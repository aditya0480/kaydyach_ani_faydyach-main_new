import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma_db } from "@/lib/prisma";
import { uploadToS3, uploadPrivateFile, fetchPdfBuffer } from "@/lib/s3";
import { mergePDFs } from "@/lib/pdf-watermark";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/data-access";

export const maxDuration = 120;

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const params = await context.params;
        const { id } = params;

        const existingEbook = await prisma_db.ebook.findUnique({ where: { id } });
        if (!existingEbook) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const contentType = req.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        let title: string = "";
        let description: string = "";
        let price: string = "";
        let pages: string = "";
        let language: string = "";
        let isEnabled: string = "";
        let isCombo = false;
        let includedEbookIds: string[] = [];
        let coverImageUrl: string | null = existingEbook.coverImage;
        let sampleImages: string[] = existingEbook.sampleImages;
        let fileKey: string = existingEbook.fileUrl;
        let pdfReplaced = false;

        if (isJson) {
            const body = (await req.json()) as {
                title?: string;
                description?: string;
                price?: number | string;
                pages?: number | string;
                isEnabled?: boolean | string;
                isCombo?: boolean;
                includedEbooks?: string[];
                coverImageUrl?: string | null;
                removeCoverImage?: boolean;
                fileKey?: string | null;
                existingSampleImages?: string[];
                newSampleImageUrls?: string[];
            };
            title = body.title ?? "";
            description = body.description ?? "";
            price = body.price != null ? String(body.price) : "";
            pages = body.pages != null ? String(body.pages) : "";
            language = (body as { language?: string }).language ?? "";
            isEnabled = body.isEnabled != null ? String(body.isEnabled) : "";
            isCombo = !!body.isCombo;
            includedEbookIds = Array.isArray(body.includedEbooks) ? body.includedEbooks : [];

            if (body.removeCoverImage) coverImageUrl = null;
            if (typeof body.coverImageUrl === "string") coverImageUrl = body.coverImageUrl;

            const kept = Array.isArray(body.existingSampleImages) ? body.existingSampleImages : sampleImages;
            const added = Array.isArray(body.newSampleImageUrls) ? body.newSampleImageUrls : [];
            sampleImages = [...kept, ...added];

            if (typeof body.fileKey === "string" && body.fileKey.length > 0) {
                fileKey = body.fileKey;
                pdfReplaced = true;
            }
        } else {
            // Legacy multipart path
            const formData = await req.formData();
            title = (formData.get("title") as string) || "";
            description = (formData.get("description") as string) || "";
            price = (formData.get("price") as string) || "";
            pages = (formData.get("pages") as string) || "";
            isEnabled = (formData.get("isEnabled") as string) || "";

            const coverImage = formData.get("coverImage") as File | null;
            const ebookFile = formData.get("ebookFile") as File | null;
            const newSampleImages = formData.getAll("sampleImages") as File[];
            const existingSampleImagesJson = formData.get("existingSampleImages") as string;

            isCombo = formData.get("isCombo") === "true";
            const includedEbooksJson = formData.get("includedEbooks") as string;
            if (isCombo && includedEbooksJson) {
                try { includedEbookIds = JSON.parse(includedEbooksJson); } catch (e) { console.error("Failed to parse includedEbooks", e); }
            }

            if (formData.get("removeCoverImage") === "true") coverImageUrl = null;
            if (coverImage && coverImage.size > 0) {
                const buffer = Buffer.from(await coverImage.arrayBuffer());
                coverImageUrl = await uploadToS3(buffer, coverImage.name);
            }

            if (existingSampleImagesJson) sampleImages = JSON.parse(existingSampleImagesJson);
            for (const file of newSampleImages) {
                if (file && file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const url = await uploadToS3(buffer, file.name);
                    if (url) sampleImages.push(url);
                }
            }

            if (ebookFile && ebookFile.size > 0) {
                const buffer = Buffer.from(await ebookFile.arrayBuffer());
                fileKey = await uploadPrivateFile(buffer, ebookFile.name);
                pdfReplaced = true;
            }
        }

        // Combo re-merge fallback when no PDF replacement provided
        if (!pdfReplaced && isCombo && includedEbookIds.length > 0) {
            // Only re-merge if the included books or their order actually changed
            const existingOrder = existingEbook.comboOrder || [];
            const comboChanged = !existingEbook.isCombo
                || existingOrder.length !== includedEbookIds.length
                || existingOrder.some((id, i) => id !== includedEbookIds[i]);

            if (comboChanged) {
                try {
                    console.info("[EBOOKS_PUT] Combo books changed, re-merging:", title || existingEbook.title);

                    const selectedEbooks = await prisma_db.ebook.findMany({
                        where: { id: { in: includedEbookIds } },
                        select: { id: true, fileUrl: true }
                    });

                    const sortedEbooks = includedEbookIds
                        .map(id => selectedEbooks.find(ebook => ebook.id === id))
                        .filter(ebook => ebook && ebook.fileUrl && ebook.fileUrl !== "COMBO_COLLECTION");

                    if (sortedEbooks.length > 0) {
                        const pdfBuffers = await Promise.all(
                            sortedEbooks.map(async (b) => {
                                try {
                                    if (!b || !b.fileUrl) return null;
                                    return await fetchPdfBuffer(b.fileUrl);
                                } catch (e) {
                                    console.error(`Failed to fetch PDF for ${b?.id}`, e);
                                    return null;
                                }
                            })
                        );

                        const validBuffers = pdfBuffers.filter((b): b is Buffer => b !== null);
                        if (validBuffers.length > 0) {
                            const mergedBuffer = await mergePDFs(validBuffers);
                            fileKey = await uploadPrivateFile(mergedBuffer, `${(title || existingEbook.title).replace(/[^a-zA-Z0-9]/g, '_')}_combo.pdf`);
                            console.info("[EBOOKS_PUT] Re-merge successful, key:", fileKey);
                        }
                    }
                } catch (error) {
                    console.error("[EBOOKS_PUT] Failed to re-merge combo PDFs:", error);
                }
            } else {
                console.info("[EBOOKS_PUT] Combo books unchanged, skipping re-merge");
            }
        }

        // Update the ebook fields first
        const ebook = await prisma_db.ebook.update({
            where: { id },
            data: {
                title: title || undefined,
                description: description || undefined,
                price: price ? parseFloat(price) : undefined,
                pages: pages ? parseInt(pages) : undefined,
                language: (["MARATHI", "HINDI", "ENGLISH"].includes(language) ? language : undefined) as "MARATHI" | "HINDI" | "ENGLISH" | undefined,
                isEnabled: isEnabled ? isEnabled === "true" : undefined,
                isCombo: isCombo,
                coverImage: coverImageUrl,
                fileUrl: fileKey,
                sampleImages,
                comboOrder: isCombo ? includedEbookIds : [],
            },
        });

        // Update ComboItem relationships: delete all existing, then recreate
        await prisma_db.comboItem.deleteMany({ where: { comboId: id } });
        if (isCombo && includedEbookIds.length > 0) {
            await prisma_db.comboItem.createMany({
                data: includedEbookIds.map((ebookId: string) => ({ comboId: id, ebookId })),
            });
        }

        revalidateTag(CACHE_TAGS.EBOOKS, "default"); // Force-refresh all cached ebook pages
        return NextResponse.json(ebook);
    } catch (error) {
        console.error("[EBOOKS_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const params = await context.params;
        const { id } = params;

        // Check if ebook has any orders
        const orderCount = await prisma_db.orderItem.count({
            where: { ebookId: id },
        });

        if (orderCount > 0) {
            // Soft delete (archive)
            const ebook = await prisma_db.ebook.update({
                where: { id },
                data: { isEnabled: false },
            });
            revalidateTag(CACHE_TAGS.EBOOKS, "default"); // Force-refresh all cached ebook pages
            return NextResponse.json({ ...ebook, message: "Ebook archived because it has existing orders." });
        } else {
            // Get the displayId before deleting
            const ebookToDelete = await prisma_db.ebook.findUnique({
                where: { id },
                select: { displayId: true }
            });

            if (!ebookToDelete) {
                return new NextResponse("Ebook not found", { status: 404 });
            }

            // Hard delete
            const ebook = await prisma_db.ebook.delete({
                where: { id },
            });

            // Re-order ids: Decrement displayId for all books with displayId > deleted displayId
            if (ebookToDelete.displayId) {
                await prisma_db.ebook.updateMany({
                    where: {
                        displayId: {
                            gt: ebookToDelete.displayId
                        }
                    },
                    data: {
                        displayId: {
                            decrement: 1
                        }
                    }
                });

                // Reset the auto-increment sequence to fill the gap at the end
                // This ensures that if the last book (#N) was deleted, the next one will be #N, not #(N+1)
                try {
                    await prisma_db.$queryRaw`SELECT setval(pg_get_serial_sequence('"Ebook"', 'displayId'), COALESCE((SELECT MAX("displayId") FROM "Ebook"), 0));`;
                } catch (seqError) {
                    console.error("Failed to reset sequence:", seqError);
                }
            }

            revalidateTag(CACHE_TAGS.EBOOKS, "default"); // Force-refresh all cached ebook pages
            return NextResponse.json(ebook);
        }
    } catch (error) {
        console.error("[EBOOKS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
