import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import Razorpay from "razorpay";
import { logOrderEvent } from "@/lib/order-logger";
import { sendPaymentReminder } from "@/lib/whatsapp";
import { getBaseUrl } from "@/lib/base-url";

// Suppress DEP0169: Razorpay SDK uses url.parse() internally
const _origWarn = process.emitWarning.bind(process);
process.emitWarning = ((warning: string | Error) => {
    if (typeof warning === "string" && warning.includes("DEP0169")) return;
    _origWarn(warning);
}) as typeof process.emitWarning;

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const order = await prisma_db.order.findUnique({
            where: { id },
            include: { items: { include: { ebook: true } } },
        });

        if (!order) return new NextResponse("Order not found", { status: 404 });
        if (order.status === "PAID") return new NextResponse("Order already paid", { status: 400 });
        if (!order.customerPhone) return new NextResponse("No phone number", { status: 400 });

        const bookTitle = order.items[0]?.ebook?.title || "Ebook";
        const baseUrl = getBaseUrl();
        const callbackUrl = `${baseUrl}/api/payment/link-callback`;

        let paymentLinkUrl: string;

        if (order.razorpayPaymentLinkId) {
            try {
                const existing = await razorpay.paymentLink.fetch(order.razorpayPaymentLinkId) as {
                    status: string;
                    short_url: string;
                };
                if (["created", "issued", "partially_paid"].includes(existing.status)) {
                    paymentLinkUrl = existing.short_url;
                } else {
                    paymentLinkUrl = await createPaymentLink(order, callbackUrl);
                }
            } catch {
                paymentLinkUrl = await createPaymentLink(order, callbackUrl);
            }
        } else {
            paymentLinkUrl = await createPaymentLink(order, callbackUrl);
        }

        await logOrderEvent("PAYMENT_LINK_CREATED", "admin", id, { paymentLinkUrl });

        try {
            await sendPaymentReminder(
                order.customerPhone,
                order.customerName || "Customer",
                bookTitle,
                paymentLinkUrl
            );
            await logOrderEvent("PAYMENT_REMINDER_SENT", "admin", id, { phone: order.customerPhone });
        } catch (e) {
            await logOrderEvent("PAYMENT_REMINDER_FAILED", "admin", id, {
                error: e instanceof Error ? e.message : String(e),
            });
            throw e;
        }

        return NextResponse.json({ success: true, paymentLinkUrl });
    } catch (error) {
        console.error("[SEND_FOLLOWUP]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

async function createPaymentLink(
    order: {
        id: string;
        amount: number;
        customerName: string | null;
        customerEmail: string | null;
        customerPhone: string | null;
        items: { ebook: { title: string } }[];
    },
    callbackUrl: string
): Promise<string> {
    const bookTitle = order.items[0]?.ebook?.title || "Ebook";
    const link = await razorpay.paymentLink.create({
        amount: Math.round(order.amount * 100),
        currency: "INR",
        description: `Payment for ${bookTitle}`,
        reference_id: order.id,
        customer: {
            name: order.customerName || undefined,
            email: order.customerEmail || undefined,
            contact: order.customerPhone || undefined,
        },
        notify: { sms: false, email: false },
        callback_url: callbackUrl,
        callback_method: "get",
        expire_by: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        notes: { db_order_id: order.id, book_title: bookTitle },
    }) as { id: string; short_url: string };

    await prisma_db.order.update({
        where: { id: order.id },
        data: { razorpayPaymentLinkId: link.id },
    });

    return link.short_url;
}
