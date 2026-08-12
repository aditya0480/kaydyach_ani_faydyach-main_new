import { NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import { sendOrderWhatsapp } from "@/lib/send-order-whatsapp";
import { logOrderEvent } from "@/lib/order-logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Find PAID orders where WhatsApp was never sent
    // 1-hour buffer avoids racing with the original fulfillment attempt
    // 7-day cap avoids retrying very old orders
    const orders = await prisma_db.order.findMany({
        where: {
            status: "PAID",
            whatsappSentAt: null,
            customerPhone: { not: null },
            createdAt: {
                lt: oneHourAgo,
                gt: sevenDaysAgo,
            },
        },
        include: {
            items: {
                include: {
                    ebook: {
                        include: { includedEbooks: { include: { ebook: true } } },
                    },
                },
            },
        },
        take: 10,
        orderBy: { createdAt: "asc" },
    });

    const results: { orderId: string; success: boolean; error?: string }[] = [];

    for (const rawOrder of orders) {
        // Flatten ComboItem join records for downstream consumers
        const order = {
            ...rawOrder,
            items: rawOrder.items.map((item) => ({
                ...item,
                ebook: {
                    ...item.ebook,
                    includedEbooks: item.ebook.includedEbooks.map((ci) => ci.ebook),
                },
            })),
        };
        try {
            // sendOrderWhatsapp generates CloudFront signed URLs internally
            await sendOrderWhatsapp(order);

            // Mark as sent
            await prisma_db.order.update({
                where: { id: order.id },
                data: { whatsappSentAt: new Date() },
            });

            await logOrderEvent("WHATSAPP_SENT", "server", order.id, {
                phone: order.customerPhone,
                source: "cron-retry",
            });

            results.push({ orderId: order.id, success: true });
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            console.error(`[CRON] WhatsApp retry failed for order ${order.id}:`, e);

            await logOrderEvent("WHATSAPP_FAILED", "server", order.id, {
                phone: order.customerPhone,
                error: errorMsg,
                source: "cron-retry",
            }).catch(() => {});

            results.push({ orderId: order.id, success: false, error: errorMsg });
        }
    }

    return NextResponse.json({
        processed: results.length,
        succeeded: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
    });
}
