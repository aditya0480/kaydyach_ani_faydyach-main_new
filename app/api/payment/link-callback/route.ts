import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/base-url";
import { prisma_db } from "@/lib/prisma";
import { fulfillOrder } from "@/lib/order-fulfillment";
import { logOrderEvent } from "@/lib/order-logger";
import crypto from "crypto";

/**
 * GET /api/payment/link-callback
 * Razorpay redirects here after a customer completes payment via a Payment Link.
 * We verify the signature, fulfill the order immediately, and redirect to success page.
 */
export async function GET(req: NextRequest) {
    const baseUrl = getBaseUrl();
    const razorpayPaymentLinkId = req.nextUrl.searchParams.get("razorpay_payment_link_id");
    const razorpayPaymentLinkRefId = req.nextUrl.searchParams.get("razorpay_payment_link_reference_id");
    const razorpayPaymentLinkStatus = req.nextUrl.searchParams.get("razorpay_payment_link_status");
    const razorpayPaymentId = req.nextUrl.searchParams.get("razorpay_payment_id");
    const razorpaySignature = req.nextUrl.searchParams.get("razorpay_signature");

    // Build base redirect URL
    const redirectUrl = new URL("/my-books", baseUrl);

    if (!razorpayPaymentLinkId || !razorpayPaymentId || !razorpaySignature) {
        // Missing params — just redirect, webhook will handle fulfillment
        console.warn("[LINK_CALLBACK] Missing required params, redirecting without fulfillment");
        redirectUrl.searchParams.set("payment_pending", "true");
        if (razorpayPaymentLinkRefId) {
            redirectUrl.searchParams.set("orderId", razorpayPaymentLinkRefId);
        }
        return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
    }

    try {
        // Verify Razorpay signature for payment links
        // Signature = HMAC-SHA256(payment_link_id|payment_link_reference_id|payment_link_status|razorpay_payment_id, secret)
        const secret = process.env.RAZORPAY_KEY_SECRET || "";
        const payload = `${razorpayPaymentLinkId}|${razorpayPaymentLinkRefId || ""}|${razorpayPaymentLinkStatus || ""}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            console.error("[LINK_CALLBACK] Invalid signature");
            await logOrderEvent("LINK_CALLBACK_SIG_INVALID", "link-callback", null, {
                paymentLinkId: razorpayPaymentLinkId,
                paymentId: razorpayPaymentId,
            });
            redirectUrl.searchParams.set("payment_pending", "true");
            if (razorpayPaymentLinkRefId) {
                redirectUrl.searchParams.set("orderId", razorpayPaymentLinkRefId);
            }
            return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
        }

        // Find order by payment link ID
        const order = await prisma_db.order.findFirst({
            where: { razorpayPaymentLinkId },
        });

        if (!order) {
            console.warn(`[LINK_CALLBACK] No order found for payment link: ${razorpayPaymentLinkId}`);
            await logOrderEvent("LINK_CALLBACK_ORDER_NOT_FOUND", "link-callback", null, {
                paymentLinkId: razorpayPaymentLinkId,
                paymentId: razorpayPaymentId,
            });
            // Still redirect — webhook will handle it
            redirectUrl.searchParams.set("pli", razorpayPaymentLinkId);
            if (razorpayPaymentLinkRefId) {
                redirectUrl.searchParams.set("orderId", razorpayPaymentLinkRefId);
            }
            redirectUrl.searchParams.set("payment_pending", "true");
            return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
        }

        await logOrderEvent("LINK_CALLBACK_RECEIVED", "link-callback", order.id, {
            paymentLinkId: razorpayPaymentLinkId,
            paymentId: razorpayPaymentId,
        });

        // Fulfill the order immediately (idempotent — safe if webhook also fires)
        const result = await fulfillOrder(order.id, razorpayPaymentId, "callback");

        // Build rich redirect URL
        redirectUrl.searchParams.set("payment_success", "true");
        redirectUrl.searchParams.set("orderId", order.id);
        redirectUrl.searchParams.set("amount", order.amount.toString());
        redirectUrl.searchParams.set("currency", "INR");

        if (order.customerPhone) {
            redirectUrl.searchParams.set("phone", order.customerPhone);
        }
        if (order.customerEmail) {
            redirectUrl.searchParams.set("email", order.customerEmail);
        }
        if (result.ebookTitle) {
            redirectUrl.searchParams.set("title", result.ebookTitle);
        }
        if (result.ebookId) {
            redirectUrl.searchParams.set("ebook_id", result.ebookId);
        }
        if (result.browser_access_token) {
            redirectUrl.searchParams.set("access_token", result.browser_access_token);
        }

        return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
    } catch (error) {
        console.error("[LINK_CALLBACK_ERROR]", error);
        // On error, still redirect — webhook is the backup
        redirectUrl.searchParams.set("payment_pending", "true");
        redirectUrl.searchParams.set("pli", razorpayPaymentLinkId);
        if (razorpayPaymentId) {
            redirectUrl.searchParams.set("pi", razorpayPaymentId);
        }
        if (razorpayPaymentLinkRefId) {
            redirectUrl.searchParams.set("orderId", razorpayPaymentLinkRefId);
        }
        return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
    }
}
