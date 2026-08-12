import { NextRequest, NextResponse } from "next/server";
import { resolveShortLink } from "@/lib/short-link";
import { prisma_db } from "@/lib/prisma";
import { getCloudFrontSignedUrl } from "@/lib/s3";
import { notFound } from "next/navigation";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ shortCode: string }> }
) {
    try {
        const params = await context.params;
        const { shortCode } = params;

        // 1. Check if this is a permanent ebook short code (or fallback: ebook id)
        const ebook = await prisma_db.ebook.findFirst({
            where: { OR: [{ shortCode }, { id: shortCode }] },
            select: { fileUrl: true },
        });

        if (ebook && ebook.fileUrl && ebook.fileUrl !== "COMBO_COLLECTION") {
            // Generate a fresh CloudFront signed URL (1h expiry) and redirect
            const signedUrl = await getCloudFrontSignedUrl(ebook.fileUrl, 3600);
            return NextResponse.redirect(signedUrl, { status: 302 });
        }

        // 2. Fall back to legacy ShortLink table
        const longUrl = await resolveShortLink(shortCode);
        if (!longUrl) {
            return notFound();
        }

        return NextResponse.redirect(longUrl, { status: 302 });
    } catch (error) {
        console.error("[SHORT_LINK_REDIRECT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
