import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import crypto from "crypto";
import { fulfillConsultation } from "@/lib/consultation-fulfillment";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        const expectedBuffer = Buffer.from(expected);
        const signatureBuffer = Buffer.from(razorpay_signature || "");
        const isValid = expectedBuffer.length === signatureBuffer.length &&
            crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

        if (!isValid) {
            return new NextResponse("Invalid signature", { status: 400 });
        }

        const booking = await prisma_db.consultationBooking.findUnique({
            where: { razorpayOrderId: razorpay_order_id },
        });

        if (!booking) {
            return new NextResponse("Booking not found", { status: 404 });
        }

        const result = await fulfillConsultation(booking.id, razorpay_payment_id, "verify");

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("[CONSULTATION_VERIFY]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
