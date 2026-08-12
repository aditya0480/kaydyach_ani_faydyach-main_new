import { anthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { UPI_VPA, UPI_RECEIVER_NAME } from "@/lib/upi";

export type ExtractedPayment = {
    utr: string;
    amount: number;
    paidAt?: string;
    payerName?: string;
    receiverName?: string;
    receiverUpiId?: string;
    appName?: string;
    status?: string;
    confidence: number;
};

export type VerifyResult = {
    ok: boolean;
    autoApprove: boolean;
    reasons: string[];
    extracted: ExtractedPayment | null;
};

const EXTRACT_TOOL = {
    name: "extract_payment",
    description: "Extract structured data from a UPI payment screenshot.",
    input_schema: {
        type: "object" as const,
        properties: {
            utr: { type: "string", description: "UPI transaction ID (usually 12 digits) or Google transaction ID" },
            amount: { type: "number", description: "Amount paid in INR" },
            paidAt: { type: "string", description: "ISO 8601 timestamp of payment, e.g. 2026-05-11T13:07:00+05:30" },
            payerName: { type: "string" },
            receiverName: { type: "string" },
            receiverUpiId: { type: "string", description: "Receiver UPI ID e.g. user@bank" },
            appName: { type: "string", description: "PhonePe / GPay / Paytm / BHIM / Other" },
            status: { type: "string", description: "Completed / Pending / Failed / Unknown" },
            confidence: { type: "number", description: "0-1 confidence in extraction accuracy" },
        },
        required: ["utr", "amount", "status", "confidence"],
    },
};

export async function extractPaymentFromImage(opts: {
    base64: string;
    mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
}): Promise<ExtractedPayment | null> {
    const resp = await anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        tools: [EXTRACT_TOOL],
        tool_choice: { type: "tool", name: "extract_payment" },
        messages: [
            {
                role: "user",
                content: [
                    { type: "image", source: { type: "base64", media_type: opts.mediaType, data: opts.base64 } },
                    {
                        type: "text",
                        text: `Extract payment details from this UPI payment screenshot. The receiver should be "${UPI_RECEIVER_NAME}" (UPI ID: ${UPI_VPA}). Return all visible fields. If unclear, give confidence < 0.5.`,
                    },
                ],
            },
        ],
    });

    for (const block of resp.content) {
        if (block.type === "tool_use" && block.name === "extract_payment") {
            return block.input as ExtractedPayment;
        }
    }
    return null;
}

export function validateExtraction(opts: {
    extracted: ExtractedPayment;
    expectedAmount: number;
    submittedAt: Date;
}): { autoApprove: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const minConfidence = Number(process.env.MANUAL_PAYMENT_AUTO_APPROVE_CONFIDENCE || "0.85");
    const maxGapMinutes = Number(process.env.MANUAL_PAYMENT_MAX_TIME_GAP_MINUTES || "10");

    if (opts.extracted.confidence < minConfidence) {
        reasons.push(`Low OCR confidence: ${opts.extracted.confidence}`);
    }

    if (opts.extracted.status && opts.extracted.status.toLowerCase() !== "completed") {
        reasons.push(`Payment status not Completed: ${opts.extracted.status}`);
    }

    if (Math.abs(opts.extracted.amount - opts.expectedAmount) > 0.01) {
        reasons.push(`Amount mismatch: paid ${opts.extracted.amount}, expected ${opts.expectedAmount}`);
    }

    const expectedReceiverFirstName = UPI_RECEIVER_NAME.split(" ")[0]?.toLowerCase() || "";
    const recName = (opts.extracted.receiverName || "").toLowerCase();
    if (expectedReceiverFirstName && !recName.includes(expectedReceiverFirstName)) {
        reasons.push(`Receiver name mismatch: got "${opts.extracted.receiverName}"`);
    }

    const expectedVpaUser = UPI_VPA.split("@")[0]?.toLowerCase() || "";
    const recVpa = (opts.extracted.receiverUpiId || "").toLowerCase();
    if (recVpa && expectedVpaUser && !recVpa.includes(expectedVpaUser)) {
        reasons.push(`Receiver UPI mismatch: got "${opts.extracted.receiverUpiId}"`);
    }

    if (opts.extracted.paidAt) {
        const paidAt = new Date(opts.extracted.paidAt);
        if (!isNaN(paidAt.getTime())) {
            const diffMinutes = Math.abs(opts.submittedAt.getTime() - paidAt.getTime()) / 60000;
            if (diffMinutes > maxGapMinutes) {
                reasons.push(`Time gap too large: ${diffMinutes.toFixed(1)} min (max ${maxGapMinutes})`);
            }
        }
    }

    return { autoApprove: reasons.length === 0, reasons };
}
