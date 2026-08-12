import { prisma_db } from "./prisma";
import { fetchPdfBuffer, supabase } from "./s3";
import { mergePDFs } from "./pdf-watermark";

/**
 * Ensures a combo PDF is merged and cached in Supabase Storage.
 * Returns the storage key of the cached file.
 */
export async function cacheComboPdf(ebookId: string): Promise<string | null> {
    try {
        const rawEbook = await prisma_db.ebook.findUnique({
            where: { id: ebookId },
            include: { includedEbooks: { include: { ebook: true } } }
        });

        if (!rawEbook || !rawEbook.isCombo || !rawEbook.includedEbooks || rawEbook.includedEbooks.length === 0) {
            return null;
        }

        // Flatten join table
        const ebook = {
            ...rawEbook,
            includedEbooks: rawEbook.includedEbooks.map((ci) => ci.ebook),
        };

        const bucketName = process.env.SUPABASE_STORAGE_BUCKET || process.env.S3_BUCKET_NAME || "pdfs";

        // Cache Key is based on the Combo ID and the IDs of included books to ensure validity if component books change
        // We also include a version or timestamp if we want to force refresh
        const componentIds = ebook.includedEbooks.map(e => e.id).sort().join('-');
        // Use a hash of components if it gets too long, but for now simple string is fine
        const cacheKey = `cache/combos/${ebook.id}_${componentIds.substring(0, 32)}.pdf`;

        // 1. Check if already cached
        try {
            const fileName = cacheKey.split('/').pop() || "";
            const { data: files, error: listError } = await supabase.storage
                .from(bucketName)
                .list("cache/combos", { search: fileName });

            if (!listError && files && files.some(f => f.name === fileName)) {
                console.info(`[COMBO_CACHE] Hit for ${ebook.title}`);
                return cacheKey;
            }
            console.info(`[COMBO_CACHE] Miss for ${ebook.title}, merging...`);
        } catch {
            // Not found, proceed to merge
            console.info(`[COMBO_CACHE] Miss for ${ebook.title}, merging...`);
        }

        // 2. Fetch all component buffers
        const pdfBuffers: Buffer[] = [];
        // Important: Use comboOrder to preserve the intended book sequence
        const orderArray = (ebook.comboOrder as string[]) || [];
        const sortedIncluded = [...ebook.includedEbooks].sort((a, b) => {
            const indexA = orderArray.indexOf(a.id);
            const indexB = orderArray.indexOf(b.id);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
        });

        for (const subBook of sortedIncluded) {
            if (subBook.fileUrl) {
                const buffer = await fetchPdfBuffer(subBook.fileUrl);
                pdfBuffers.push(buffer);
            }
        }

        if (pdfBuffers.length === 0) return null;

        // 3. Merge
        const mergedBuffer = await mergePDFs(pdfBuffers);

        // 4. Upload to Cache
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(cacheKey, mergedBuffer, {
                contentType: "application/pdf",
                upsert: true,
            });

        if (uploadError) {
            console.error("[COMBO_CACHE_UPLOAD_ERROR]", uploadError);
            throw uploadError;
        }

        console.info(`[COMBO_CACHE] Created and uploaded ${cacheKey}`);
        return cacheKey;

    } catch (error) {
        console.error("[COMBO_CACHE_ERROR]", error);
        return null; // Fallback to on-the-fly merge if caching fails
    }
}
