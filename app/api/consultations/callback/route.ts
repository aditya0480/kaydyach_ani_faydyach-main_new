import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import crypto from "crypto";
import { fulfillConsultation } from "@/lib/consultation-fulfillment";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const razorpay_payment_id = formData.get("razorpay_payment_id") as string;
        const razorpay_order_id = formData.get("razorpay_order_id") as string;
        const razorpay_signature = formData.get("razorpay_signature") as string;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            const error_description = formData.get("error[description]");
            console.warn("[CONSULTATION_CALLBACK] Missing fields or payment error", { error_description, order_id: razorpay_order_id });
            return NextResponse.redirect(new URL("/legal-consultation?payment_error=1", req.url));
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || "";
        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return new NextResponse("Invalid signature", { status: 400 });
        }

        const booking = await prisma_db.consultationBooking.findUnique({
            where: { razorpayOrderId: razorpay_order_id },
        });

        if (!booking) {
            console.error("[CONSULTATION_CALLBACK] Booking not found:", razorpay_order_id);
            return new NextResponse("Booking not found", { status: 404 });
        }

        await fulfillConsultation(booking.id, razorpay_payment_id, "callback");

        const successUrl = new URL("/legal-consultation/success", req.url);
        successUrl.searchParams.set("bookingId", booking.id);
        return NextResponse.redirect(successUrl, { status: 303 });
    } catch (error) {
        console.error("[CONSULTATION_CALLBACK_ERROR]", error);
        const fallbackUrl = new URL("/legal-consultation?payment_pending=1", req.url);
        return NextResponse.redirect(fallbackUrl, { status: 303 });
    }
}
