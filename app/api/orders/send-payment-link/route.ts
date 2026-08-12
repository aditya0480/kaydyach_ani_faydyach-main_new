import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import Razorpay from "razorpay";
import { checkRateLimit } from "@/lib/rate-limit";
import { logOrderEvent } from "@/lib/order-logger";
import { sendPaymentReminder } from "@/lib/whatsapp";
import { getBaseUrl } from "@/lib/base-url";

// Suppress DEP0169: Razorpay SDK v2.9.6 uses url.parse() internally
const _origWarn = process.emitWarning.bind(process);
process.emitWarning = ((warning: string | Error) => {
    if (typeof warning === "string" && warning.includes("DEP0169")) return;
    _origWarn(warning);
}) as typeof process.emitWarning;

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
        }

        // Fetch order with items for book title
        const order = await prisma_db.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { ebook: true } } },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Only process PENDING orders
        if (order.status !== "PENDING") {
            return NextResponse.json({ error: "Order is not pending" }, { status: 400 });
        }

        if (!order.customerPhone) {
            return NextResponse.json({ error: "No phone number on order" }, { status: 400 });
        }

        // Rate limit: 2 per phone per hour
        const rateLimitCheck = await checkRateLimit(order.customerPhone, "send-payment-link");
        if (!rateLimitCheck.isAllowed) {
            await logOrderEvent("PAYMENT_LINK_RATE_LIMITED", "payment-link", orderId, {
                phone: order.customerPhone,
                retryAfter: rateLimitCheck.retryAfter?.toISOString(),
            });
            return NextResponse.json({ error: "Rate limited" }, { status: 429 });
        }

        const bookTitle = order.items[0]?.ebook?.title || "Ebook";
        const customerName = order.customerName || "Customer";
        const baseUrl = getBaseUrl();
        const callbackUrl = `${baseUrl}/api/payment/link-callback`;

        // If payment link already exists on order, reuse it
        let paymentLinkUrl: string;

        if (order.razorpayPaymentLinkId) {
            // Fetch existing payment link to check if still active
            try {
                const existingLink = await razorpay.paymentLink.fetch(order.razorpayPaymentLinkId) as {
                    id: string;
                    status: string;
                    short_url: string;
                };
                if (["created", "issued", "partially_paid"].includes(existingLink.status)) {
                    // Still active, reuse it
                    paymentLinkUrl = existingLink.short_url;
                } else {
                    // Expired or paid — create new one
                    paymentLinkUrl = await createPaymentLink(order, callbackUrl);
                }
            } catch {
                // Fetch failed — create new one
                paymentLinkUrl = await createPaymentLink(order, callbackUrl);
            }
        } else {
            paymentLinkUrl = await createPaymentLink(order, callbackUrl);
        }

        await logOrderEvent("PAYMENT_LINK_CREATED", "payment-link", orderId, {
            paymentLinkUrl,
            phone: order.customerPhone,
        });

        // Send WhatsApp via existing pending_followup_v2 template
        try {
            await sendPaymentReminder(
                order.customerPhone,
                customerName,
                bookTitle,
                paymentLinkUrl,
            );
            await logOrderEvent("PAYMENT_LINK_WHATSAPP_SENT", "payment-link", orderId, {
                phone: order.customerPhone,
            });
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            console.error("[PAYMENT_LINK] WhatsApp send failed:", e);
            await logOrderEvent("PAYMENT_LINK_WHATSAPP_FAILED", "payment-link", orderId, {
                phone: order.customerPhone,
                error: errorMsg,
            });
        }

        return NextResponse.json({ success: true, paymentLinkUrl });
    } catch (error) {
        console.error("[SEND_PAYMENT_LINK]", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
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
    callbackUrl: string,
): Promise<string> {
    const bookTitle = order.items[0]?.ebook?.title || "Ebook";

    const paymentLink = await razorpay.paymentLink.create({
        amount: Math.round(order.amount * 100), // paise
        currency: "INR",
        description: `Payment for ${bookTitle}`,
        reference_id: order.id,
        customer: {
            name: order.customerName || undefined,
            email: order.customerEmail || undefined,
            contact: order.customerPhone || undefined,
        },
        notify: { sms: false, email: false }, // We send our own WhatsApp
        callback_url: callbackUrl,
        callback_method: "get",
        expire_by: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24hr expiry
        notes: {
            db_order_id: order.id,
            book_title: bookTitle,
        },
    }) as { id: string; short_url: string };

    // Store payment link ID on order
    await prisma_db.order.update({
        where: { id: order.id },
        data: { razorpayPaymentLinkId: paymentLink.id },
    });

    return paymentLink.short_url;
}
