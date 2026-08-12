import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma_db } from "@/lib/prisma";
import { fulfillOrder } from "@/lib/order-fulfillment";
import { fulfillConsultation } from "@/lib/consultation-fulfillment";
import { logOrderEvent } from "@/lib/order-logger";

type RazorpayPaymentEntity = {
    id?: string;
    order_id?: string;
    payment_link_id?: string;
    email?: string;
    contact?: string;
    notes?: {
        db_order_id?: string;
        db_consultation_id?: string;
        [key: string]: unknown;
    };
};

type RazorpayPaymentLinkEntity = {
    id?: string;
    reference_id?: string;
    status?: string;
    payments?: Array<{ payment_id?: string }>;
    notes?: {
        db_order_id?: string;
        db_consultation_id?: string;
        [key: string]: unknown;
    };
};

type RazorpayWebhookPayload = {
    event?: string;
    payload?: {
        payment?: { entity?: RazorpayPaymentEntity };
        payment_link?: { entity?: RazorpayPaymentLinkEntity };
    };
};

function hasValidSignature(rawBody: string, signature: string | null, secret: string): boolean {
    if (!signature || !secret) return false;

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    return expectedBuffer.length === signatureBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

async function findOrderForWebhook(
    payment?: RazorpayPaymentEntity,
    paymentLink?: RazorpayPaymentLinkEntity,
) {
    const dbOrderId = payment?.notes?.db_order_id ?? paymentLink?.notes?.db_order_id ?? paymentLink?.reference_id;

    if (dbOrderId) {
        const order = await prisma_db.order.findUnique({ where: { id: dbOrderId } });
        if (order) return order;
    }

    if (payment?.order_id) {
        const order = await prisma_db.order.findUnique({ where: { razorpayOrderId: payment.order_id } });
        if (order) return order;
    }

    const paymentLinkId = payment?.payment_link_id ?? paymentLink?.id;
    if (paymentLinkId) {
        const order = await prisma_db.order.findFirst({ where: { razorpayPaymentLinkId: paymentLinkId } });
        if (order) return order;
    }

    if (payment?.id) {
        return prisma_db.order.findFirst({ where: { razorpayPaymentId: payment.id } });
    }

    return null;
}

async function findConsultationForWebhook(
    payment?: RazorpayPaymentEntity,
    paymentLink?: RazorpayPaymentLinkEntity,
) {
    const dbConsultationId = payment?.notes?.db_consultation_id ?? paymentLink?.notes?.db_consultation_id;

    if (dbConsultationId) {
        const booking = await prisma_db.consultationBooking.findUnique({ where: { id: dbConsultationId } });
        if (booking) return booking;
    }

    if (payment?.order_id) {
        const booking = await prisma_db.consultationBooking.findUnique({ where: { razorpayOrderId: payment.order_id } });
        if (booking) return booking;
    }

    return null;
}

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!hasValidSignature(rawBody, signature, webhookSecret)) {
        console.error("[RAZORPAY_WEBHOOK] Invalid signature");
        return new NextResponse("Invalid signature", { status: 401 });
    }

    let body: RazorpayWebhookPayload;
    try {
        body = JSON.parse(rawBody) as RazorpayWebhookPayload;
    } catch (error) {
        console.error("[RAZORPAY_WEBHOOK] Invalid JSON payload", error);
        return new NextResponse("Invalid JSON", { status: 400 });
    }

    const event = body.event || "unknown";
    const payment = body.payload?.payment?.entity;
    const paymentLink = body.payload?.payment_link?.entity;

    try {
        const order = await findOrderForWebhook(payment, paymentLink);
        const paymentId = payment?.id ?? paymentLink?.payments?.[0]?.payment_id;
        const eventName = event === "payment_link.paid" ? "PAYMENT_LINK_WEBHOOK_RECEIVED" : "WEBHOOK_RECEIVED";

        await logOrderEvent(eventName, "webhook", order?.id, {
            event,
            razorpayOrderId: payment?.order_id,
            razorpayPaymentId: paymentId,
            razorpayPaymentLinkId: payment?.payment_link_id ?? paymentLink?.id,
        });

        if (!order) {
            const consultation = await findConsultationForWebhook(payment, paymentLink);
            if (consultation) {
                if (event === "payment.captured" || event === "order.paid" || event === "payment_link.paid") {
                    if (!paymentId) {
                        return NextResponse.json({ ok: true, handled: false, reason: "missing_payment_id" });
                    }
                    const result = await fulfillConsultation(consultation.id, paymentId, "webhook");
                    return NextResponse.json({ ok: true, handled: true, type: "consultation", bookingId: result.bookingId, isNewPayment: result.isNewPayment });
                }
                return NextResponse.json({ ok: true, handled: false, reason: "event_ignored" });
            }

            // Full notes + contact logged so externally-created payments (e.g. Interakt
            // autocheckout links on the same Razorpay account) can be mapped to a product
            // and recovered manually or by a future handler.
            await logOrderEvent("WEBHOOK_ORDER_NOT_FOUND", "webhook", null, {
                event,
                razorpayOrderId: payment?.order_id,
                razorpayPaymentId: paymentId,
                razorpayPaymentLinkId: payment?.payment_link_id ?? paymentLink?.id,
                contact: payment?.contact,
                email: payment?.email,
                notes: payment?.notes ?? paymentLink?.notes,
            });
            return NextResponse.json({ ok: true, handled: false, reason: "order_not_found" });
        }

        if (event === "payment.captured" || event === "order.paid" || event === "payment_link.paid") {
            if (!paymentId) {
                console.warn("[RAZORPAY_WEBHOOK] Missing payment id for paid event", { event, orderId: order.id });
                return NextResponse.json({ ok: true, handled: false, reason: "missing_payment_id" });
            }

            const result = await fulfillOrder(order.id, paymentId, "webhook");
            return NextResponse.json({ ok: true, handled: true, orderId: result.orderId, isNewPayment: result.isNewPayment });
        }

        return NextResponse.json({ ok: true, handled: false, reason: "event_ignored" });
    } catch (error) {
        console.error("[RAZORPAY_WEBHOOK] Handler error", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
