import { prisma_db } from "@/lib/prisma";
import crypto from "crypto";
import { cacheComboPdf } from "@/lib/combo-cache";
import { logOrderEvent } from "@/lib/order-logger";
import { sendOrderWhatsapp } from "@/lib/send-order-whatsapp";

const ORDER_INCLUDE = {
    items: { include: { ebook: { include: { includedEbooks: { include: { ebook: true } } } } } },
} as const;

/** Fetch order with items and flatten ComboItem join records */
async function fetchOrderFlat(orderId: string): Promise<OrderWithItems | null> {
    const raw = await prisma_db.order.findUnique({
        where: { id: orderId },
        include: ORDER_INCLUDE,
    });
    if (!raw) return null;
    return {
        ...raw,
        items: raw.items.map((item) => ({
            ...item,
            ebook: {
                ...item.ebook,
                includedEbooks: item.ebook.includedEbooks.map((ci) => ci.ebook),
            },
        })),
    } as unknown as OrderWithItems;
}

// Define the Order structure with necessary relations
// Using a type compatible with what we get from Prisma include
type EbookSub = { id: string; title: string; fileUrl: string | null; pages: number | null };

type OrderWithItems = {
    id: string;
    customerEmail: string | null;
    customerName: string | null;
    customerPhone: string | null;
    amount: number;
    currency: string;
    razorpayOrderId: string | null;
    status: string;
    whatsappSentAt: Date | null;
    items: {
        ebookId: string;
        ebook: {
            id: string;
            title: string;
            fileUrl: string | null;
            pages: number | null;
            isCombo: boolean;
            comboOrder: string[];
            includedEbooks: EbookSub[];
        }
    }[];
};

export interface FulfillmentResult {
    success: boolean;
    orderId: string;
    ebookTitle?: string;
    ebookId?: string;
    browser_access_token?: string;
    isNewPayment: boolean;
}

/**
 * Atomically claim the WhatsApp send slot using updateMany with a WHERE guard.
 * Returns true if this caller won the right to send, false if another caller already claimed it.
 */
async function claimWhatsappSend(orderId: string): Promise<boolean> {
    const result = await prisma_db.order.updateMany({
        where: { id: orderId, whatsappSentAt: null },
        data: { whatsappSentAt: new Date() },
    });
    return result.count > 0;
}

/**
 * Send WhatsApp notification (non-blocking).
 * Fires and forgets — failures are caught by the cron retry job.
 * Uses an atomic DB claim to prevent duplicate sends across concurrent callers.
 */
function deliverWhatsappNotificationAsync(
    order: OrderWithItems,
    source: "callback" | "verify" | "webhook" | "manual" | "admin",
): void {
    if (!order.customerPhone) return;

    void (async () => {
        try {
            // Atomically claim the send slot — only one caller wins
            const claimed = await claimWhatsappSend(order.id);
            if (!claimed) {
                console.info(`[FULFILLMENT] WhatsApp already claimed for order ${order.id}, skipping (source: ${source})`);
                return;
            }

            await sendOrderWhatsapp(order);
            await logOrderEvent("WHATSAPP_SENT", source, order.id, {
                phone: order.customerPhone,
            });
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            console.error("[FULFILLMENT] WhatsApp send failed:", e);
            // Reset whatsappSentAt so the cron retry job can pick it up
            await prisma_db.order.update({
                where: { id: order.id },
                data: { whatsappSentAt: null },
            }).catch(() => {});
            await logOrderEvent("WHATSAPP_FAILED", source, order.id, {
                phone: order.customerPhone,
                error: errorMsg,
            }).catch(() => {});
        }
    })();
}

function warmComboCache(order: OrderWithItems): void {
    void (async () => {
        if (!order.items) {
            return;
        }

        for (const item of order.items) {
            if (item.ebook?.isCombo) {
                await cacheComboPdf(item.ebook.id).catch((e) =>
                    console.error("[FULFILLMENT] Combo Cache Trigger Error", e)
                );
            }
        }
    })();
}

export async function fulfillOrder(
    orderId: string,
    razorpayPaymentId: string,
    source: "callback" | "verify" | "webhook" | "manual" | "admin" = "verify"
): Promise<FulfillmentResult> {
    // Fail fast before any DB mutations if secret is missing
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET not set");

    console.info(`[FULFILLMENT] Starting fulfillment for Order ${orderId} (source: ${source})`);

    // 1. Fetch Order with latest state
    let order = await fetchOrderFlat(orderId);

    if (!order) {
        throw new Error(`Order ${orderId} not found`);
    }

    let isNewPayment = false;

    // 2. Atomic status update — prevents race condition between callback and webhook.
    // Using updateMany with a WHERE clause so only the FIRST caller wins.
    if (order.status !== "PAID") {
        const updated = await prisma_db.order.updateMany({
            where: { id: orderId, status: { not: "PAID" } },
            data: {
                status: "PAID",
                failureReason: null,
                razorpayPaymentId: razorpayPaymentId,
            },
        });

        isNewPayment = updated.count > 0;

        if (isNewPayment) {
            console.info(`[FULFILLMENT] Marking order ${orderId} as PAID (won race)`);
            // Re-fetch to get updated data with relations
            order = await fetchOrderFlat(orderId) ?? order;
            await logOrderEvent("ORDER_FULFILLED", source, orderId, {
                razorpayPaymentId,
                amount: order.amount,
                customerPhone: order.customerPhone,
                customerEmail: order.customerEmail,
            });
        } else {
            console.info(`[FULFILLMENT] Order ${orderId} was already PAID by another caller (lost race)`);
            await logOrderEvent("ORDER_ALREADY_PAID", source, orderId, { razorpayPaymentId });
        }
    } else {
        console.info(`[FULFILLMENT] Order ${orderId} is already PAID. Re-processing fulfillment artifacts.`);
        await logOrderEvent("ORDER_ALREADY_PAID", source, orderId, { razorpayPaymentId });
    }

    // 3. Send WhatsApp notification (NON-BLOCKING — doesn't delay user redirect)
    // If it fails, the cron retry job at /api/cron/retry-whatsapp picks it up.
    const shouldSendNotifications = isNewPayment || (source === "webhook" && !isNewPayment && !order.whatsappSentAt);
    if (shouldSendNotifications) {
        deliverWhatsappNotificationAsync(order, source);
    }

    // 4. Best-effort combo cache warm-up (fire-and-forget)
    warmComboCache(order);

    // 5. Generate Browser Access Token (BAT)
    const browser_access_token = crypto
        .createHmac("sha256", secret)
        .update(order.id)
        .digest("hex");

    // Extract first item info for redirect params
    const firstItem = order.items?.[0];

    return {
        success: true,
        orderId: order.id,
        ebookTitle: firstItem?.ebook?.title,
        ebookId: firstItem?.ebook?.id,
        browser_access_token,
        isNewPayment
    };
}
