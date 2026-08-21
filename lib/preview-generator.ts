import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fetchPdfBuffer, supabase } from "./s3";

function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || process.env.S3_BUCKET_NAME || "pdfs";
}

const previewMemoryCache = new Map<string, Buffer>();

/**
 * Gets or generates a 6-page sample preview PDF for an ebook
 */
export async function getOrGeneratePreviewPdf(
  ebookId: string,
  pdfKey: string,
  maxPages = 6
): Promise<Buffer | null> {
  // 0. RAM Cache hit (<1ms)
  const cachedRam = previewMemoryCache.get(ebookId);
  if (cachedRam) {
    return cachedRam;
  }

  const bucketName = getBucketName();
  const previewStorageKey = `previews/${ebookId}.pdf`;

  // 1. Check if preview PDF is already cached in Supabase Storage
  try {
    const { data, error } = await supabase.storage.from(bucketName).download(previewStorageKey);
    if (data && !error) {
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      previewMemoryCache.set(ebookId, buffer);
      return buffer;
    }
  } catch {
    // Not cached in storage yet
  }

  // 2. Fetch full PDF buffer and slice first 6 pages
  try {
    const fullPdfBuffer = await fetchPdfBuffer(pdfKey);
    const pdfDoc = await PDFDocument.load(fullPdfBuffer);
    const totalPages = pdfDoc.getPageCount();
    const count = Math.min(maxPages, totalPages);

    const subDoc = await PDFDocument.create();
    const pageIndices = Array.from({ length: count }, (_, i) => i);
    const copiedPages = await subDoc.copyPages(pdfDoc, pageIndices);

    copiedPages.forEach((page) => {
      subDoc.addPage(page);
    });

    const previewPdfBytes = await subDoc.save();
    const previewBuffer = Buffer.from(previewPdfBytes);

    // 3. Cache in Supabase Storage asynchronously
    supabase.storage
      .from(bucketName)
      .upload(previewStorageKey, previewBuffer, {
        contentType: "application/pdf",
        upsert: true,
      })
      .catch((err) => console.error(`[UPLOAD_PREVIEW_PDF_ERROR] for ${ebookId}:`, err));

    previewMemoryCache.set(ebookId, previewBuffer);
    return previewBuffer;
  } catch (error) {
    console.error(`[GENERATE_PREVIEW_PDF_ERROR] for ebookId=${ebookId}:`, error);
    return null;
  }
}
