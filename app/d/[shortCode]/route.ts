import { NextRequest, NextResponse } from "next/server";
import { resolveShortLink } from "@/lib/short-link";
import { prisma_db } from "@/lib/prisma";
import { getCloudFrontSignedUrl } from "@/lib/s3";
import { getSafeDownloadFilename } from "@/lib/ebook-filenames";
import { notFound } from "next/navigation";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ shortCode: string }> }
) {
    try {
        const params = await context.params;
        const { shortCode } = params;

        if (!shortCode) {
            return notFound();
        }

        // 1. Check if this is a permanent ebook short code (or fallback: ebook id)
        const ebook = await prisma_db.ebook.findFirst({
            where: { OR: [{ shortCode }, { id: shortCode }] },
            select: { displayId: true, title: true, fileUrl: true },
        });

        if (ebook && ebook.fileUrl && ebook.fileUrl !== "COMBO_COLLECTION") {
            try {
                const openInline = req.nextUrl.searchParams.get("open") === "true";
                const downloadFilename = getSafeDownloadFilename(ebook.displayId, ebook.title);
                const disposition = openInline ? "inline" : `attachment; filename="${downloadFilename}"`;
                // Generate a fresh signed URL (1h expiry) and redirect
                const signedUrl = await getCloudFrontSignedUrl(ebook.fileUrl, 3600, disposition);
                return NextResponse.redirect(signedUrl, { status: 302 });
            } catch (storageErr) {
                console.error(`[SHORT_LINK_REDIRECT] Storage error for ebook ${shortCode}:`, storageErr);
            }
        }

        // 2. Fall back to ShortLink table
        const longUrl = await resolveShortLink(shortCode);
        if (!longUrl) {
            return notFound();
        }

        // Normalize internal URLs: if it points to /api/download, redirect to current host
        try {
            const parsed = new URL(longUrl);
            if (parsed.pathname.startsWith("/api/download") || parsed.pathname.startsWith("/ebooks")) {
                const targetUrl = new URL(parsed.pathname + parsed.search, req.nextUrl.origin);
                return NextResponse.redirect(targetUrl, { status: 302 });
            }
        } catch {
            if (longUrl.startsWith("/")) {
                return NextResponse.redirect(new URL(longUrl, req.nextUrl.origin), { status: 302 });
            }
        }

        return NextResponse.redirect(longUrl, { status: 302 });
    } catch (error) {
        console.error("[SHORT_LINK_REDIRECT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
