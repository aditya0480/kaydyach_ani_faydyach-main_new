import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { fetchPdfBuffer, getPresignedUrl, getCloudFrontSignedUrl } from "@/lib/s3";
import { mergePDFs } from "@/lib/pdf-watermark";
import { cacheComboPdf } from "@/lib/combo-cache";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const params = await context.params;
    const { token } = params;
    const { searchParams } = new URL(req.url);
    const ebookId = searchParams.get("ebookId");

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      console.error("AUTH_SECRET is not set");
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    let decoded: unknown;
    try {
      decoded = jwt.verify(token, secret);
    } catch (_e) {
      console.error("Invalid or Expired Token", _e);
      return new NextResponse("Invalid or Expired Token", { status: 401 });
    }

    const { orderId } = decoded as { orderId: string };

    const rawOrder = await prisma_db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            ebook: {
              include: {
                includedEbooks: { include: { ebook: true } },
              },
            },
          },
        },
      },
    });
    // Flatten ComboItem join records
    const order = rawOrder ? {
      ...rawOrder,
      items: rawOrder.items.map((item) => ({
        ...item,
        ebook: {
          ...item.ebook,
          includedEbooks: item.ebook.includedEbooks.map((ci) => ci.ebook),
        },
      })),
    } : null;

    if (!order || order.status !== "PAID") {
      return new NextResponse("Order not found or not paid", { status: 403 });
    }

    interface EbookBase {
      id: string;
      title: string;
      fileUrl: string | null;
      isCombo: boolean;
      includedEbooks?: EbookBase[];
    }

    // Determine which ebook to download
    let targetItem = order.items[0];
    let targetEbook: EbookBase = targetItem.ebook;

    // Helper to find ebook in order (direct or included in combo)
    const findEbookInOrder = (id: string): { item: typeof order.items[number]; ebook: EbookBase } | null => {
      for (const item of order.items) {
        if (item.ebookId === id) return { item, ebook: item.ebook as EbookBase };
        if (item.ebook.isCombo && item.ebook.includedEbooks) {
          const found = item.ebook.includedEbooks.find((e) => e.id === id);
          if (found) return { item, ebook: found as EbookBase };
        }
      }
      return null;
    };

    if (ebookId) {
      const found = findEbookInOrder(ebookId);
      if (found) {
        targetItem = found.item;
        targetEbook = found.ebook;
      } else {
        // If specific ebook requested but not found in order
        return new NextResponse("Ebook not found in this order", { status: 404 });
      }
    }

    // Check if we need to merge files (Combo) or download single file
    // Condition: 
    // 1. It IS a combo wrapper (isCombo=true)
    // 2. OR The order has multiple items (unwrapped combo items)
    const isComboWrapper = targetEbook.isCombo && targetEbook.includedEbooks && targetEbook.includedEbooks.length > 0;
    const isMultiItemOrder = order.items.length > 1;

    // OPTIMIZATION: Check for pre-merged file
    // If it's a combo wrapper and has a valid fileUrl (not the placeholder), we treat it as a single file download.
    const hasPreMergedFile = isComboWrapper && targetEbook.fileUrl && targetEbook.fileUrl !== "COMBO_COLLECTION";

    // We only merge if NO specific ebookId was requested (or if the requested one implies the whole set)
    // AND we don't have a pre-merged file ready.
    const needsOnTheFlyMerge = !ebookId && (isMultiItemOrder || (isComboWrapper && !hasPreMergedFile));

    console.info('[DOWNLOAD] Debugging Combo Logic:', {
      ebookId,
      isComboWrapper,
      isMultiItemOrder,
      hasPreMergedFile,
      needsOnTheFlyMerge,
      itemCount: order.items.length,
      title: targetEbook.title
    });

    if (needsOnTheFlyMerge) {
      console.info('[DOWNLOAD] Checking for Cached Combo...');

      // 1. Try to get from cache (checks S3 first, merges if missing)
      // Only for single products that are combos
      if (isComboWrapper && !isMultiItemOrder) {
        const cachedKey = await cacheComboPdf(targetEbook.id);
        if (cachedKey) {
          console.info('[DOWNLOAD] Using Cached Combo:', cachedKey);
          const safeTitle = targetEbook.title.replace(/["/\\:;]/g, '').trim();
          const encodedTitle = encodeURIComponent(safeTitle);
          const openInline = searchParams.get("open") === "true";
          const disposition = openInline ? "inline" : "attachment";
          const contentDisposition = `${disposition}; filename="Complete_Set.pdf"; filename*=UTF-8''${encodedTitle}_Complete_Set.pdf`;

          const presignedUrl = await getPresignedUrl(
            cachedKey,
            3600,
            contentDisposition,
            "application/pdf"
          );
          return NextResponse.redirect(presignedUrl, { status: 307 });
        }
      }

      console.info('[DOWNLOAD] Falling back to on-the-fly merge...');

      try {
        const pdfBuffers: Buffer[] = [];

        // Determine which books to include
        const booksToProcess = isMultiItemOrder
          ? order.items.map(item => item.ebook as EbookBase)
          : (targetEbook.includedEbooks || []);

        // 1. Fetch and Watermark each book sequentially
        for (const subBook of booksToProcess) {
          console.info(`[DOWNLOAD] Processing included book: ${subBook.title}`);
          if (subBook.fileUrl) {
            const rawBuffer = await fetchPdfBuffer(subBook.fileUrl);
            pdfBuffers.push(rawBuffer);
          }
        }

        if (pdfBuffers.length === 0) {
          return new NextResponse("No valid files found in this combo.", { status: 404 });
        }

        // 2. Merge all watermarked PDFs
        console.info('[DOWNLOAD] Merging', pdfBuffers.length, 'PDFs...');
        const finalPdfBuffer = await mergePDFs(pdfBuffers);

        // 3. Return the merged file
        const safeTitle = targetEbook.title.replace(/["/\\:;]/g, '').trim();
        const encodedTitle = encodeURIComponent(safeTitle);
        const openInline = searchParams.get("open") === "true";
        const disposition = openInline ? "inline" : "attachment";

        return new NextResponse(new Uint8Array(finalPdfBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${disposition}; filename="Complete_Set.pdf"; filename*=UTF-8''${encodedTitle}_Complete_Set.pdf`,
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });

      } catch {
        // console.error('[DOWNLOAD] Combo processing failed', _e);
        return new NextResponse("Failed to generate combo file", { status: 500 });
      }
    }

    // Fallback: Single File Download Logic (for individual books or specific selection)

    // OPTIMIZATION: Generate CloudFront Signed URL and Redirect
    // This moves the bandwidth cost to CloudFront Edge and eliminates Vercel Origin Transfer
    if (!targetEbook.fileUrl) {
      console.error(`[DOWNLOAD] Missing fileUrl for ebook ${targetEbook.id}`);
      return new NextResponse("File not available", { status: 404 });
    }

    console.info('[DOWNLOAD] Redirecting to CloudFront for:', targetEbook.fileUrl);

    const signedUrl = await getCloudFrontSignedUrl(
      targetEbook.fileUrl,
      3600 // 1 hour expiry
    );

    // 307 Temporary Redirect ensures the browser follows the signed URL to CloudFront.
    return NextResponse.redirect(signedUrl, { status: 307 });

  } catch (error) {
    console.error("[DOWNLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
