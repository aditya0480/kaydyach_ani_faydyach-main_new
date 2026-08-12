import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import Razorpay from "razorpay";
import { checkRateLimit } from "@/lib/rate-limit";
import { CONSULTATION_CATEGORY_VALUES } from "@/lib/constants/consultation-categories";
import { getConsultationPrice } from "@/lib/consultation-config";

// Suppress DEP0169: Razorpay SDK v2.9.6 uses url.parse() internally (their bug, latest version)
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
        const { name, mobile, category, description } = body;

        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return new NextResponse("Valid name required", { status: 400 });
        }

        const mobileClean = (mobile ?? "").replace(/[\s\-\(\)\+]/g, "").replace(/^(?:91|0)(\d{10})$/, "$1");
        if (!/^[6-9]\d{9}$/.test(mobileClean)) {
            return new NextResponse("Valid 10-digit Indian mobile number required", { status: 400 });
        }

        if (!CONSULTATION_CATEGORY_VALUES.includes(category)) {
            return new NextResponse("Valid category required", { status: 400 });
        }

        if (description && (typeof description !== "string" || description.length > 500)) {
            return new NextResponse("Description too long", { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            ?? req.headers.get("x-real-ip")
            ?? "unknown";

        const rateLimitCheck = await checkRateLimit(mobileClean || ip, "create-order");
        if (!rateLimitCheck.isAllowed) {
            return new NextResponse("Too many attempts. Please try again in an hour.", { status: 429 });
        }

        const currentPrice = await getConsultationPrice();

        const booking = await prisma_db.consultationBooking.create({
            data: {
                name: name.trim(),
                mobile: mobileClean,
                category,
                description: description?.trim() || null,
                amount: currentPrice,
                status: "PENDING",
            },
        });

        const amountPaise = Math.round(currentPrice * 100);
        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create({
                amount: amountPaise,
                currency: "INR",
                receipt: booking.id,
                notes: {
                    db_consultation_id: booking.id,
                },
            });
        } catch (rzpError) {
            await prisma_db.consultationBooking.delete({ where: { id: booking.id } }).catch(() => {});
            throw rzpError;
        }

        await prisma_db.consultationBooking.update({
            where: { id: booking.id },
            data: { razorpayOrderId: razorpayOrder.id },
        });

        console.info("[CONSULTATION_CREATE] Booking created:", { bookingId: booking.id, razorpayOrderId: razorpayOrder.id });

        return NextResponse.json({
            bookingId: booking.id,
            razorpayOrderId: razorpayOrder.id,
            amount: amountPaise,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[CONSULTATION_CREATE] Error:", message);
        return new NextResponse(`Internal Error: ${message}`, { status: 500 });
    }
}
