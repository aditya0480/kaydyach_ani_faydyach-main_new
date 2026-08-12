import { NextRequest, NextResponse } from "next/server";
import { extractPaymentFromImage } from "@/lib/manual-payment-verify";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();
        const file = form.get("screenshot") as File | null;

        if (!file) return NextResponse.json({ ok: false, error: "Missing screenshot" }, { status: 400 });
        if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ ok: false, error: "Invalid type" }, { status: 400 });
        if (file.size > MAX_SIZE) return NextResponse.json({ ok: false, error: "Too large" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const extracted = await extractPaymentFromImage({
            base64: buffer.toString("base64"),
            mediaType: file.type as "image/jpeg" | "image/png" | "image/webp",
        });

        if (!extracted) return NextResponse.json({ ok: false, error: "Could not extract" }, { status: 422 });

        return NextResponse.json({
            ok: true,
            utr: extracted.utr,
            amount: extracted.amount,
            paidAt: extracted.paidAt,
            payerName: extracted.payerName,
            receiverName: extracted.receiverName,
            confidence: extracted.confidence,
        });
    } catch (err) {
        console.error("[EXTRACT_UTR] error:", err);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
