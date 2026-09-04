import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import { getOrGenerateCoverImage } from "@/lib/cover-extractor";

export const maxDuration = 60;

function generateFallbackSvg(title: string): string {
  const safeTitle = title ? title.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "कायदेशीर मार्गदर्शक";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560" fill="none">
    <rect width="400" height="560" fill="url(#bg)"/>
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="400" y2="560" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0D9488"/>
        <stop offset="1" stop-color="#042F2C"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#F59E0B"/>
        <stop offset="1" stop-color="#D97706"/>
      </linearGradient>
    </defs>
    <rect x="20" y="20" width="360" height="520" rx="12" stroke="url(#gold)" stroke-width="3" fill="none" opacity="0.6"/>
    <rect x="28" y="28" width="344" height="504" rx="8" stroke="#F59E0B" stroke-width="1" stroke-dasharray="4 4" fill="none" opacity="0.4"/>
    <g transform="translate(170, 70) scale(2)" opacity="0.9">
      <path d="M12 2v20M5 7l7-3 7 3M3 13l4-6 4 6H3zm10 0l4-6 4 6h-8z" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>
    <text x="200" y="160" text-anchor="middle" fill="#F59E0B" font-family="system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="1">कायद्याचं आणि फायद्याचं</text>
    <foreignObject x="40" y="190" width="320" height="260">
      <div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; height: 100%; align-items: center; justify-content: center; text-align: center; color: white; font-family: system-ui, sans-serif; font-size: 22px; font-weight: 800; line-height: 1.4; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
        ${safeTitle}
      </div>
    </foreignObject>
    <rect x="100" y="475" width="200" height="34" rx="17" fill="#F59E0B"/>
    <text x="200" y="497" text-anchor="middle" fill="#042F2C" font-family="system-ui, sans-serif" font-size="13" font-weight="800">100% कायदेशीर मार्गदर्शक</text>
  </svg>`;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let ebookTitle = "कायदेशीर मार्गदर्शक";
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
            ebook: { select: { id: true, fileUrl: true } }
          }
        }
      }
    });

    if (ebook?.title) {
      ebookTitle = ebook.title;
    }

    let targetPdfKey = ebook?.fileUrl;

    if (ebook?.isCombo && (!targetPdfKey || targetPdfKey === "COMBO_COLLECTION") && ebook.includedEbooks.length > 0) {
      targetPdfKey = ebook.includedEbooks[0]?.ebook?.fileUrl;
    }

    if (targetPdfKey && targetPdfKey !== "COMBO_COLLECTION") {
      const result = await getOrGenerateCoverImage(id, targetPdfKey);
      if (result) {
        return new NextResponse(new Uint8Array(result.buffer), {
          status: 200,
          headers: {
            "Content-Type": result.contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // Fallback: Dynamic branded SVG book cover (Never cache fallback so updates appear immediately)
    const svgContent = generateFallbackSvg(ebookTitle);
    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[COVER_IMAGE_ROUTE_ERROR]", error);
    const svgContent = generateFallbackSvg(ebookTitle);
    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}

