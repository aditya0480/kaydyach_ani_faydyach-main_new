import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma_db } from "@/lib/prisma";
import { uploadPaymentScreenshot } from "@/lib/s3";
import { extractPaymentFromImage, validateExtraction, type ExtractedPayment } from "@/lib/manual-payment-verify";
import { fulfillOrder } from "@/lib/order-fulfillment";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();
        const orderId = String(form.get("orderId") || "");
        const utr = String(form.get("utr") || "").trim();
        const file = form.get("screenshot") as File | null;

        if (!orderId || !utr || !file) {
            return NextResponse.json({ ok: false, error: "Missing orderId, utr or screenshot" }, { status: 400 });
        }

        if (!/^[A-Za-z0-9]{6,40}$/.test(utr)) {
            return NextResponse.json({ ok: false, error: "Invalid UTR format" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ ok: false, error: "Only JPG/PNG/WEBP allowed" }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ ok: false, error: "Screenshot too large (max 5MB)" }, { status: 400 });
        }

        const order = await prisma_db.order.findUnique({ where: { id: orderId } });
        if (!order) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
        if (order.status === "PAID") return NextResponse.json({ ok: false, error: "Order already paid" }, { status: 409 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const screenshotHash = crypto.createHash("sha256").update(buffer).digest("hex");

        const dupHash = await prisma_db.order.findFirst({ where: { manualScreenshotHash: screenshotHash, NOT: { id: orderId } } });
        if (dupHash) return NextResponse.json({ ok: false, error: "This screenshot was already used" }, { status: 409 });

        const dupUtr = await prisma_db.order.findFirst({ where: { manualUtr: utr, NOT: { id: orderId } } });
        if (dupUtr) return NextResponse.json({ ok: false, error: "This UTR was already used" }, { status: 409 });

        const screenshotKey = await uploadPaymentScreenshot(buffer, file.type);
        const submittedAt = new Date();

        let extracted: ExtractedPayment | null = null;
        let extractionError: string | null = null;
        try {
            extracted = await extractPaymentFromImage({
                base64: buffer.toString("base64"),
                mediaType: file.type as "image/jpeg" | "image/png" | "image/webp",
            });
        } catch (err) {
            extractionError = err instanceof Error ? err.message : String(err);
            console.error("[MANUAL_PAYMENT] OCR error:", err);
        }

        const validation = extracted
            ? validateExtraction({ extracted, expectedAmount: order.amount, submittedAt })
            : { autoApprove: false, reasons: [extractionError || "OCR extraction failed"] };

        const utrMismatch = extracted?.utr && extracted.utr.replace(/\s/g, "") !== utr.replace(/\s/g, "");
        if (utrMismatch) validation.reasons.push(`UTR in screenshot (${extracted?.utr}) does not match submitted UTR (${utr})`);

        const autoApprove = validation.autoApprove && !utrMismatch;

        await prisma_db.order.update({
            where: { id: orderId },
            data: {
                manualUtr: utr,
                manualScreenshotKey: screenshotKey,
                manualScreenshotHash: screenshotHash,
                manualPayerName: extracted?.payerName,
                manualReceiverName: extracted?.receiverName,
                manualReceiverUpiId: extracted?.receiverUpiId,
                manualPaidAt: extracted?.paidAt ? new Date(extracted.paidAt) : null,
                manualSubmittedAt: submittedAt,
                manualConfidence: extracted?.confidence,
                manualGeminiRaw: (extracted ?? undefined) as never,
                manualStatus: autoApprove ? "AUTO_APPROVED" : "PENDING",
                manualRejectionReason: autoApprove ? null : validation.reasons.join("; "),
                status: autoApprove ? "PAID" : "PENDING_VERIFICATION",
            },
        });

        if (autoApprove) {
            await fulfillOrder(orderId, `MANUAL_${utr}`, "manual");
            return NextResponse.json({ ok: true, status: "approved", message: "Payment verified" });
        }

        return NextResponse.json({
            ok: true,
            status: "pending_review",
            message: "Submitted for manual review. We will verify within a few hours.",
            reasons: validation.reasons,
        });
    } catch (err) {
        console.error("[MANUAL_PAYMENT_SUBMIT] error:", err);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
