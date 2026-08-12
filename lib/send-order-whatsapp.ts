import {
    sendPaymentSuccessWhatsapp,
    hasBookPdfConfig,
    sendBookWithPdfWhatsapp,
    sendComboPdfWhatsapp,
} from "@/lib/whatsapp";
import { getCloudFrontSignedUrl } from "@/lib/s3";

type OrderForWhatsapp = {
    id: string;
    customerPhone: string | null;
    customerName: string | null;
    items: {
        ebook: {
            id: string;
            title: string;
            fileUrl: string | null;
            pages: number | null;
            isCombo: boolean;
            includedEbooks: { id: string; title: string; fileUrl: string | null; pages: number | null }[];
        };
    }[];
};

/**
 * Sends WhatsApp notification for a paid order.
 * Uses CloudFront signed URLs directly — the PDF is sent as a document attachment.
 * No JWT, no short links needed.
 *
 * @returns true if WhatsApp was sent successfully, false otherwise
 */
export async function sendOrderWhatsapp(
    order: OrderForWhatsapp,
): Promise<boolean> {
    if (!order.customerPhone) {
        return false;
    }

    const customerPhone = order.customerPhone;
    const customerName = order.customerName || "Customer";

    if (order.items.length === 1) {
        const item = order.items[0];
        const ebook = item.ebook;

        let totalPages = ebook.pages || 0;
        if (ebook.isCombo && ebook.includedEbooks) {
            totalPages = ebook.includedEbooks.reduce((sum, sub) => sum + (sub.pages || 0), 0);
        }

        const displayTitle = totalPages > 0
            ? `${ebook.title} (एकूण ${totalPages} पाने)`
            : ebook.title;

        if (hasBookPdfConfig(ebook.id)) {
            // Path 1: Pre-configured book — generates its own CloudFront URL internally
            await sendBookWithPdfWhatsapp(customerPhone, customerName, ebook.id, displayTitle);
        } else if (ebook.fileUrl && ebook.fileUrl !== "COMBO_COLLECTION") {
            // Path 2: Generate CloudFront signed URL (24h expiry)
            const pdfUrl = await getCloudFrontSignedUrl(ebook.fileUrl, 86400);
            if (ebook.isCombo) {
                await sendComboPdfWhatsapp(customerPhone, displayTitle, pdfUrl);
            } else {
                await sendPaymentSuccessWhatsapp(customerPhone, customerName, displayTitle, pdfUrl, pdfUrl);
            }
        } else {
            // Path 3: No file URL available
            console.warn(`[WHATSAPP] No fileUrl for ebook ${ebook.id}, sending text-only notification`);
            await sendPaymentSuccessWhatsapp(customerPhone, customerName, displayTitle, "");
        }
    } else {
        // Multiple items
        const itemsWithPages = order.items.map((i) => {
            let pages = i.ebook.pages || 0;
            if (i.ebook.isCombo && i.ebook.includedEbooks) {
                pages = i.ebook.includedEbooks.reduce((sum, sub) => sum + (sub.pages || 0), 0);
            }
            return pages > 0 ? `${i.ebook.title} (एकूण ${pages} पाने)` : i.ebook.title;
        }).join(", ");

        const firstFileUrl = order.items.find(i => i.ebook.fileUrl && i.ebook.fileUrl !== "COMBO_COLLECTION")?.ebook.fileUrl;
        const pdfUrl = firstFileUrl ? await getCloudFrontSignedUrl(firstFileUrl, 86400) : undefined;

        await sendPaymentSuccessWhatsapp(customerPhone, customerName, itemsWithPages, pdfUrl || "", pdfUrl);
    }

    return true;
}
