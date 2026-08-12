import { PDFDocument } from 'pdf-lib';

// Watermark functionality removed for performance.
// Only keeping mergePDFs for Combo functionality.

/**
 * Merge multiple PDFs into a single document
 */
export async function mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
    try {
        const mergedPdf = await PDFDocument.create();

        for (const pdfBuffer of pdfBuffers) {
            const pdf = await PDFDocument.load(pdfBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        return Buffer.from(mergedPdfBytes);
    } catch (error) {
        console.error('[MERGE_PDF_ERROR]', error);
        throw new Error("Failed to merge PDFs");
    }
}
