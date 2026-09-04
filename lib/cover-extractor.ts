import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import { fetchPdfBuffer, supabase, supabaseFallback } from "./s3";

function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || process.env.S3_BUCKET_NAME || "pdfs";
}

/**
 * Extracts page 1 image from a PDF Buffer
 */
export async function extractPage1Image(pdfBuffer: Buffer): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    if (pages.length === 0) return null;

    const page1 = pages[0];
    const resources = page1.node.Resources();
    const xObjectDict = resources?.get(PDFName.of("XObject")) as any;

    if (xObjectDict && xObjectDict.dict) {
      for (const [_, ref] of xObjectDict.dict.entries()) {
        const stream = pdfDoc.context.lookup(ref);
        if (stream instanceof PDFRawStream) {
          const subtype = stream.dict.get(PDFName.of("Subtype"));
          if (subtype === PDFName.of("Image")) {
            const filter = stream.dict.get(PDFName.of("Filter"));
            const filterStr = filter ? filter.toString() : "";
            const imageBytes = stream.contents;

            if (imageBytes && imageBytes.length > 1000) {
              const isJpeg = filterStr.includes("DCTDecode");
              return {
                buffer: Buffer.from(imageBytes),
                contentType: isJpeg ? "image/jpeg" : "image/png",
              };
            }
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("[EXTRACT_PAGE1_ERROR]", error);
    return null;
  }
}

const coverMemoryCache = new Map<string, { buffer: Buffer; contentType: string }>();

/**
 * Gets or generates cover image for an ebook ID and PDF file key
 */
export async function getOrGenerateCoverImage(ebookId: string, pdfKey: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  // 0. Instant RAM Cache hit (<1ms)
  const cachedRam = coverMemoryCache.get(ebookId);
  if (cachedRam) {
    return cachedRam;
  }

  const bucketName = getBucketName();
  const coverKeys = [`covers/${ebookId}.jpg`, `covers/${ebookId}.png`];

  // 1. Check if cover image is already cached in Supabase Storage
  for (const coverKey of coverKeys) {
    try {
      let { data, error } = await supabase.storage.from(bucketName).download(coverKey);
      if ((error || !data) && supabaseFallback) {
        const fallbackDownload = await supabaseFallback.storage.from(bucketName).download(coverKey);
        if (!fallbackDownload.error && fallbackDownload.data) {
          data = fallbackDownload.data;
          error = null;
        }
      }
      if (data && !error) {
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const isPng = buffer.slice(0, 8).toString("hex") === "89504e470d0a1a0a";
        const result = {
          buffer,
          contentType: isPng ? "image/png" : "image/jpeg",
        };
        coverMemoryCache.set(ebookId, result);
        return result;
      }
    } catch {
      // Try next format
    }
  }

  // 2. Fetch PDF buffer and extract page 1
  try {
    const pdfBuffer = await fetchPdfBuffer(pdfKey);
    const extracted = await extractPage1Image(pdfBuffer);
    if (!extracted) return null;

    // 3. Cache extracted cover image in Supabase
    const uploadKey = `covers/${ebookId}.${extracted.contentType === "image/png" ? "png" : "jpg"}`;
    supabase.storage
      .from(bucketName)
      .upload(uploadKey, extracted.buffer, {
        contentType: extracted.contentType,
        upsert: true,
      })
      .catch(() => {
        if (supabaseFallback) {
          supabaseFallback.storage
            .from(bucketName)
            .upload(uploadKey, extracted.buffer, {
              contentType: extracted.contentType,
              upsert: true,
            })
            .catch(() => {});
        }
      });

    coverMemoryCache.set(ebookId, extracted);
    return extracted;
  } catch (error) {
    console.error(`[GENERATE_COVER_ERROR] for ebookId=${ebookId}:`, error);
    return null;
  }
}
