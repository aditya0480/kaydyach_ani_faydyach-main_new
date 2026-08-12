import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma_db } from "@/lib/prisma";
import { uploadToS3, uploadPrivateFile, fetchPdfBuffer } from "@/lib/s3";
import { mergePDFs } from "@/lib/pdf-watermark";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/data-access";

type CreateEbookJson = {
    title: string;
    description: string;
    price: number | string;
    pages?: number | string;
    category: string;
    language?: string;
    isCombo?: boolean;
    includedEbooks?: string[];
    coverImageUrl?: string | null;
    fileKey?: string | null;
    sampleImageUrls?: string[];
};

export const maxDuration = 120;

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const view = searchParams.get("view");

        if (view === "minimal") {
            const ebooks = await prisma_db.ebook.findMany({
                select: {
                    id: true,
                    displayId: true,
                    title: true,
                },
                orderBy: { title: "asc" },
            });
            return NextResponse.json(ebooks, {
                headers: {
                    "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
                },
            });
        }

        const ebooks = await prisma_db.ebook.findMany({
            select: {
                id: true,
                displayId: true,
                title: true,
                description: true,
                price: true,
                pages: true,
                coverImage: true,
                category: true,
                isEnabled: true,
                isCombo: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(ebooks);
    } catch (error) {
        console.error("[EBOOKS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const contentType = req.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        let title: string;
        let description: string;
        let price: string;
        let pages: string;
        let category: string;
        let language: string = "MARATHI";
        let isCombo: boolean;
        let includedEbookIds: string[];
        let coverImageUrl: string | null = null;
        let sampleImageUrls: string[] = [];
        let fileKey = "COMBO_COLLECTION";
        let providedFileKey: string | null = null;

        if (isJson) {
            const body = (await req.json()) as CreateEbookJson;
            title = body.title;
            description = body.description;
            price = String(body.price ?? "");
            pages = body.pages != null ? String(body.pages) : "";
            category = body.category;
            language = body.language ?? "MARATHI";
            isCombo = !!body.isCombo;
            includedEbookIds = Array.isArray(body.includedEbooks) ? body.includedEbooks : [];
            coverImageUrl = body.coverImageUrl ?? null;
            sampleImageUrls = Array.isArray(body.sampleImageUrls) ? body.sampleImageUrls : [];
            providedFileKey = body.fileKey ?? null;

            if (!title || !description || !price || !category) {
                return new NextResponse("Missing required fields", { status: 400 });
            }
            if (!isCombo && !providedFileKey) {
                return new NextResponse("Ebook file is required for non-combo products", { status: 400 });
            }
            if (providedFileKey) {
                fileKey = providedFileKey;
            }
        } else {
            // Legacy multipart path (subject to ~4.5MB Vercel limit — kept for backward compat)
            const formData = await req.formData();
            title = formData.get("title") as string;
            description = formData.get("description") as string;
            price = formData.get("price") as string;
            pages = formData.get("pages") as string;
            category = formData.get("category") as string;
            language = (formData.get("language") as string) || "MARATHI";
            const isComboStr = formData.get("isCombo") as string;
            const includedEbooksStr = formData.get("includedEbooks") as string;
            isCombo = isComboStr === "true";
            const coverImage = formData.get("coverImage") as File | null;
            const ebookFile = formData.get("ebookFile") as File | null;
            const sampleImages = formData.getAll("sampleImages") as File[];

            if (!title || !description || !price || !category) {
                return new NextResponse("Missing required fields", { status: 400 });
            }
            if (!isCombo && !ebookFile) {
                return new NextResponse("Ebook file is required for non-combo products", { status: 400 });
            }

            if (coverImage && coverImage.size > 0) {
                const buffer = Buffer.from(await coverImage.arrayBuffer());
                coverImageUrl = await uploadToS3(buffer, coverImage.name);
            }
            for (const file of sampleImages) {
                if (file && file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const url = await uploadToS3(buffer, file.name);
                    if (url) sampleImageUrls.push(url);
                }
            }
            includedEbookIds = isCombo && includedEbooksStr ? JSON.parse(includedEbooksStr) : [];
            if (ebookFile && ebookFile.size > 0) {
                const buffer = Buffer.from(await ebookFile.arrayBuffer());
                fileKey = await uploadPrivateFile(buffer, ebookFile.name);
            }
        }

        // Combo auto-merge fallback (when no direct PDF was provided)
        if (isCombo && fileKey === "COMBO_COLLECTION" && includedEbookIds.length > 0) {
            try {
                // Pre-merge logic for combos
                console.info("[EBOOKS_POST] Starting pre-merge for combo:", title);

                const includedEbooks = await prisma_db.ebook.findMany({
                    where: { id: { in: includedEbookIds } },
                    select: { id: true, fileUrl: true }
                });

                // Maintain order
                const sortedEbooks = includedEbookIds
                    .map((id: string) => (includedEbooks as { id: string; fileUrl: string | null }[]).find((b: { id: string }) => b.id === id))
                    .filter((b: { id: string; fileUrl: string | null } | undefined): b is { id: string; fileUrl: string | null } => !!b?.fileUrl && b.fileUrl !== "COMBO_COLLECTION");

                const pdfBuffers = await Promise.all(
                    sortedEbooks.map(async (b: { fileUrl: string | null; id: string }) => {
                        try {
                            return await fetchPdfBuffer(b.fileUrl || "");
                        } catch (_e) {
                            console.error(`Failed to fetch PDF for ${b.id}`, _e);
                            return null;
                        }
                    })
                );

                const validBuffers = pdfBuffers.filter((b: Buffer | null): b is Buffer => b !== null);

                if (validBuffers.length > 0) {
                    const mergedBuffer = await mergePDFs(validBuffers);
                    fileKey = await uploadPrivateFile(mergedBuffer, `${title.replace(/[^a-zA-Z0-9]/g, '_')}_combo.pdf`);
                    console.info("[EBOOKS_POST] Pre-merge successful, key:", fileKey);
                }
            } catch (error) {
                console.error("[EBOOKS_POST] Failed to pre-merge combo PDFs:", error);
                // Fallback to COMBO_COLLECTION is automatic if we don't update fileKey
            }
        }

        const validLanguages = ["MARATHI", "HINDI", "ENGLISH"];
        const ebook = await prisma_db.ebook.create({
            data: {
                title,
                description,
                category,
                language: (validLanguages.includes(language) ? language : "MARATHI") as "MARATHI" | "HINDI" | "ENGLISH",
                price: parseFloat(price),
                pages: pages ? parseInt(pages) : 0,
                coverImage: coverImageUrl,
                fileUrl: fileKey,
                sampleImages: sampleImageUrls,
                isEnabled: true,
                isCombo,
                includedEbooks: isCombo && includedEbookIds.length > 0 ? {
                    create: includedEbookIds.map((ebookId: string) => ({ ebookId }))
                } : undefined,
                comboOrder: isCombo ? includedEbookIds : []
            },
        });

        revalidateTag(CACHE_TAGS.EBOOKS, "default"); // Force-refresh all cached ebook pages
        return NextResponse.json(ebook);
    } catch (error) {
        console.error("[EBOOKS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
