import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import { getOrGeneratePreviewPdf } from "@/lib/preview-generator";

export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return new NextResponse("Missing ebook ID", { status: 400 });
    }

    const ebook = await prisma_db.ebook.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        isCombo: true,
        includedEbooks: {
          select: {
            ebook: { select: { id: true, fileUrl: true } },
          },
        },
      },
    });

    if (!ebook) {
      return new NextResponse("Ebook not found", { status: 404 });
    }

    let targetPdfKey = ebook.fileUrl;

    if (
      ebook.isCombo &&
      (!targetPdfKey || targetPdfKey === "COMBO_COLLECTION") &&
      ebook.includedEbooks.length > 0
    ) {
      targetPdfKey = ebook.includedEbooks[0]?.ebook?.fileUrl;
    }

    if (!targetPdfKey || targetPdfKey === "COMBO_COLLECTION") {
      return new NextResponse("No PDF available for preview", { status: 404 });
    }

    const previewBuffer = await getOrGeneratePreviewPdf(id, targetPdfKey, 6);

    if (!previewBuffer) {
      return new NextResponse("Failed to generate preview PDF", { status: 500 });
    }

    return new NextResponse(new Uint8Array(previewBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="preview_${id}.pdf"`,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[PREVIEW_PDF_ROUTE_ERROR]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
