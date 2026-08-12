import { prisma_db } from "@/lib/prisma";

export interface ConsultationFulfillmentResult {
    success: boolean;
    bookingId: string;
    isNewPayment: boolean;
}

export async function fulfillConsultation(
    bookingId: string,
    razorpayPaymentId: string,
    source: "callback" | "verify" | "webhook" = "verify"
): Promise<ConsultationFulfillmentResult> {
    const booking = await prisma_db.consultationBooking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error(`Consultation booking ${bookingId} not found`);

    let isNewPayment = false;
    if (booking.status !== "PAID") {
        const updated = await prisma_db.consultationBooking.updateMany({
            where: { id: bookingId, status: { not: "PAID" } },
            data: { status: "PAID", razorpayPaymentId },
        });
        isNewPayment = updated.count > 0;
        console.info(`[CONSULTATION_FULFILLMENT] ${isNewPayment ? "Marked" : "Already"} PAID for booking ${bookingId} (source: ${source})`);
    }

    return { success: true, bookingId, isNewPayment };
}
