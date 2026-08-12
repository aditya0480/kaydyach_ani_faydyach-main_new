
import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import { sendBookWithPdfWhatsapp, hasBookPdfConfig } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
    try {
        const { orderIds } = await req.json();

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return new NextResponse("orderIds must be a non-empty array", { status: 400 });
        }

        // Fetch all PAID orders in the selection
        const orders = await prisma_db.order.findMany({
            where: {
                id: { in: orderIds },
                status: "PAID"
            },
            include: {
                items: {
                    include: {
                        ebook: true
                    }
                }
            }
        });

        if (orders.length === 0) {
            return new NextResponse("No PAID orders found in selection", { status: 404 });
        }

        let successCount = 0;
        let skippedCount = 0;
        const errors: Array<{ orderId: string; error: string }> = [];

        for (const order of orders) {
            if (!order.customerPhone) {
                skippedCount++;
                continue;
            }

            // Process each item in the order
            for (const item of order.items) {
                // Check if this ebook has a PDF configuration
                if (hasBookPdfConfig(item.ebookId)) {
                    try {
                        console.info(`[BULK_PDF] Sending PDF for book "${item.ebook.title}" to ${order.customerName} (${order.customerPhone})...`);

                        await sendBookWithPdfWhatsapp(
                            order.customerPhone,
                            order.customerName || "Customer",
                            item.ebookId,
                            item.ebook.title
                        );

                        successCount++;
                        // Add a small delay to avoid overwhelming the API
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        console.error(`[BULK_PDF] Failed to send for order ${order.id}, item ${item.ebookId}:`, error);
                        errors.push({
                            orderId: order.id,
                            error: error instanceof Error ? error.message : "Unknown error sending PDF"
                        });
                    }
                } else {
                    skippedCount++; // Item doesn't have config
                }
            }
        }

        return NextResponse.json({
            success: true,
            successCount,
            skippedCount,
            totalOrders: orders.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("[BULK_PDF_API] Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
