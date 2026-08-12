import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, status, reason } = body;

        if (!orderId || !status) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Only allow status updates to FAILED or CANCELLED from client
        if (status !== "FAILED" && status !== "CANCELLED") {
            return new NextResponse("Invalid status update", { status: 400 });
        }

        // Guard: if order has a payment link, don't cancel — user may still pay via link
        if (status === "CANCELLED") {
            const existingOrder = await prisma_db.order.findUnique({
                where: { id: orderId },
                select: { razorpayPaymentLinkId: true },
            });
            if (existingOrder?.razorpayPaymentLinkId) {
                return NextResponse.json({ success: true, orderId, skipped: true });
            }
        }

        const updateResult = await prisma_db.order.updateMany({
            where: {
                id: orderId,
                status: {
                    not: "PAID",
                },
            },
            data: {
                status: status,
                failureReason: reason || "Unknown reason",
            },
        });

        if (updateResult.count === 0) {
            const currentOrder = await prisma_db.order.findUnique({
                where: { id: orderId },
                select: { id: true, status: true },
            });

            return NextResponse.json({
                success: true,
                orderId,
                skipped: currentOrder?.status === "PAID",
                currentStatus: currentOrder?.status ?? null,
            });
        }

        return NextResponse.json({ success: true, orderId });
    } catch (error) {
        console.error("[ORDER_STATUS_UPDATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
