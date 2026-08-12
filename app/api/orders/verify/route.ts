import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import crypto from "crypto";
import { fulfillOrder } from "@/lib/order-fulfillment";
import { logOrderEvent } from "@/lib/order-logger";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        const signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (signature !== razorpay_signature) {
            return new NextResponse("Invalid signature", { status: 400 });
        }

        // Idempotency: Check if order exists
        const existingOrder = await prisma_db.order.findUnique({
            where: { razorpayOrderId: razorpay_order_id }
        });

        if (!existingOrder) {
            return new NextResponse("Order not found", { status: 404 });
        }

        await logOrderEvent("VERIFY_RECEIVED", "verify", existingOrder.id, {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
        });

        // Use Shared Fulfillment Logic
        const result = await fulfillOrder(existingOrder.id, razorpay_payment_id);

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("[ORDER_VERIFY]", error);
        await logOrderEvent("VERIFY_ERROR", "server", null, {
            error: error instanceof Error ? error.message : "Unknown error",
        }).catch(() => {});
        return new NextResponse("Internal Error", { status: 500 });
    }
}
