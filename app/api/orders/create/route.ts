import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import Razorpay from "razorpay";
import { checkRateLimit } from "@/lib/rate-limit";
import { logOrderEvent } from "@/lib/order-logger";
import { fulfillOrder } from "@/lib/order-fulfillment";
import { parseClientContext } from "@/lib/user-agent";

// Suppress DEP0169: Razorpay SDK v2.9.6 uses url.parse() internally (their bug, latest version)
const _origWarn = process.emitWarning.bind(process);
process.emitWarning = ((warning: string | Error) => {
    if (typeof warning === "string" && warning.includes("DEP0169")) return;
    _origWarn(warning);
}) as typeof process.emitWarning;

// Module-scoped — reused across requests
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ebookId, name, email, phone, paymentMode } = body;
        const isManual = paymentMode === "manual" || process.env.PAYMENT_MODE === "manual";

        if (!ebookId) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Normalize and validate phone server-side (guard against API abuse bypassing client validation)
        const phoneClean = (phone ?? "").replace(/[\s\-\(\)\+]/g, "").replace(/^(?:91|0)(\d{10})$/, "$1");
        if (!/^[6-9]\d{9}$/.test(phoneClean)) {
            return new NextResponse("Valid 10-digit Indian mobile number required", { status: 400 });
        }

        // Use IP as fallback so all unauthenticated users don't share one rate-limit bucket
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            ?? req.headers.get("x-real-ip")
            ?? "unknown";

        // Capture device/browser context at order creation — the ONLY point that sees
        // every order (incl. ones that later die at checkout). Powers funnel analysis of
        // in-app-browser (Instagram/Facebook/WhatsApp WebView) UPI drop-off.
        const clientCtx = parseClientContext(req.headers.get("user-agent"));

        // Parallelize independent checks to reduce latency
        const [rateLimitCheck, ebook] = await Promise.all([
            checkRateLimit(email || phoneClean || ip, "create-order"),
            prisma_db.ebook.findUnique({
                where: { id: ebookId },
            })
        ]);

        if (!rateLimitCheck.isAllowed) {
            return new NextResponse("Too many order attempts. Please try again in an hour.", { status: 429 });
        }

        if (!ebook || !ebook.isEnabled) {
            return new NextResponse("Ebook not found", { status: 404 });
        }

        // With reverse logic, DB Price IS the Sale Price.
        // We do NOT apply any discount here.
        const finalPrice = Number(ebook.price);

        // --- IDEMPOTENCY CHECK ---
        // Reuse an existing PENDING order for the same customer+ebook instead of creating duplicates.
        // Uses a 30-minute window to cover slow/retrying users.
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const existingRecentOrder = await prisma_db.order.findFirst({
            where: {
                customerPhone: phoneClean,
                status: "PENDING",
                amount: finalPrice,
                createdAt: { gte: thirtyMinutesAgo },
                items: {
                    some: { ebookId: ebookId },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        if (existingRecentOrder && existingRecentOrder.razorpayOrderId) {
            // Verify the Razorpay order is still usable before reusing it.
            // If Razorpay says "paid" but our DB is PENDING, auto-recover.
            // If the Razorpay order is dead/expired, skip it and create a fresh one.
            let canReuse = true;
            try {
                const rzpOrder = await razorpay.orders.fetch(existingRecentOrder.razorpayOrderId);
                const rzpStatus = rzpOrder.status; // "created" | "attempted" | "paid"

                if (rzpStatus === "paid") {
                    // Payment was captured on Razorpay but our DB missed it!
                    // Auto-recover: find the payment and fulfill the order.
                    console.warn("[ORDER_CREATE] Razorpay order is PAID but DB is PENDING — auto-recovering:", existingRecentOrder.id);
                    const payments = await razorpay.orders.fetchPayments(existingRecentOrder.razorpayOrderId);
                    const capturedPayment = payments.items?.find(
                        (p) => p.status === "captured"
                    );
                    if (capturedPayment) {
                        await fulfillOrder(existingRecentOrder.id, capturedPayment.id, "verify");
                        await logOrderEvent("ORDER_AUTO_RECOVERED", "server", existingRecentOrder.id, {
                            razorpayOrderId: existingRecentOrder.razorpayOrderId,
                            razorpayPaymentId: capturedPayment.id,
                        });
                    }
                    // Don't reuse — the order is now PAID, create fresh if user wants another
                    canReuse = false;
                } else if (rzpStatus === "created" || rzpStatus === "attempted") {
                    // Still active — safe to reuse
                    canReuse = true;
                } else {
                    // Unknown/expired status — skip this order
                    console.info("[ORDER_CREATE] Razorpay order has unusable status:", rzpStatus, existingRecentOrder.id);
                    canReuse = false;
                }
            } catch (e) {
                // If we can't verify Razorpay status (network issue), still reuse to avoid duplicates
                console.warn("[ORDER_CREATE] Could not verify Razorpay order status, reusing anyway:", e instanceof Error ? e.message : e);
            }

            if (canReuse) {
                console.info("[ORDER_CREATE] Reusing existing recent pending order:", existingRecentOrder.id);
                await logOrderEvent("ORDER_CREATED", "server", existingRecentOrder.id, {
                    reused: true,
                    razorpayOrderId: existingRecentOrder.razorpayOrderId,
                    ...clientCtx,
                });

                return NextResponse.json({
                    orderId: existingRecentOrder.id,
                    razorpayOrderId: existingRecentOrder.razorpayOrderId,
                    amount: Math.round(Number(existingRecentOrder.amount) * 100), // use stored amount, not current price
                    currency: "INR",
                    keyId: razorpayKeyId,
                });
            }
            // If not reusable, fall through to create a fresh order
        }

        // Amount in paise
        const amount = Math.round(finalPrice * 100);
        const currency = "INR";

        const orderItemsData = [{
            ebookId: ebook.id,
            price: ebook.price,
        }];

        // 1. Create DB order first — gives us a stable ID to use as Razorpay receipt.
        //    If Razorpay creation fails we delete the DB record; if DB creation fails
        //    no Razorpay order is created, so no orphaned orders.
        const order = await prisma_db.order.create({
            data: {
                customerName: name,
                customerEmail: email,
                customerPhone: phoneClean,
                amount: finalPrice,
                status: "PENDING",
                items: {
                    create: orderItemsData,
                },
            },
        });

        if (isManual) {
            await logOrderEvent("ORDER_CREATED", "manual", order.id, {
                ebookId: ebook.id,
                ebookTitle: ebook.title,
                amount: finalPrice,
                customerPhone: phone,
                customerEmail: email,
                paymentMode: "manual",
                ...clientCtx,
            });
            return NextResponse.json({
                orderId: order.id,
                amount: amount,
                currency: currency,
                paymentMode: "manual",
            });
        }

        // 2. Create Razorpay order using DB id as receipt (enables reconciliation)
        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create({
                amount,
                currency,
                receipt: order.id,
                notes: {
                    db_order_id: order.id,
                    ebook_title: ebook.title,
                },
            });
        } catch (rzpError) {
            // Clean up DB record so next retry starts fresh
            await prisma_db.order.delete({ where: { id: order.id } }).catch(() => {});
            throw rzpError;
        }

        // 3. Link the Razorpay order to our DB record
        await prisma_db.order.update({
            where: { id: order.id },
            data: { razorpayOrderId: razorpayOrder.id },
        });

        console.info("[ORDER_CREATE] Order created:", { orderId: order.id, razorpayOrderId: razorpayOrder.id });

        await logOrderEvent("ORDER_CREATED", "server", order.id, {
            ebookId: ebook.id,
            ebookTitle: ebook.title,
            amount: finalPrice,
            razorpayOrderId: razorpayOrder.id,
            customerPhone: phone,
            customerEmail: email,
            ...clientCtx,
        });

        return NextResponse.json({
            orderId: order.id,
            razorpayOrderId: razorpayOrder.id,
            amount: amount,
            currency: currency,
            keyId: razorpayKeyId
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[ORDER_CREATE] Global error:", {
            message,
            stack: error instanceof Error ? error.stack : undefined
        });
        return new NextResponse(`Internal Error: ${message}`, { status: 500 });
    }
}
