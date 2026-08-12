import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma_db } from "@/lib/prisma";
import { ManualPaymentsClient } from "./_components/client";
import { getPresignedUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";

export default async function ManualPaymentsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") redirect("/");

    const orders = await prisma_db.order.findMany({
        where: {
            OR: [
                { status: "PENDING_VERIFICATION" },
                { manualStatus: "PENDING" },
            ],
        },
        orderBy: { manualSubmittedAt: "desc" },
        include: { items: { include: { ebook: { select: { title: true } } } } },
    });

    const enriched = await Promise.all(
        orders.map(async (o) => ({
            id: o.id,
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            customerPhone: o.customerPhone,
            amount: o.amount,
            status: o.status,
            manualStatus: o.manualStatus,
            manualUtr: o.manualUtr,
            manualPayerName: o.manualPayerName,
            manualReceiverName: o.manualReceiverName,
            manualReceiverUpiId: o.manualReceiverUpiId,
            manualPaidAt: o.manualPaidAt,
            manualSubmittedAt: o.manualSubmittedAt,
            manualConfidence: o.manualConfidence,
            manualRejectionReason: o.manualRejectionReason,
            ebookTitle: o.items[0]?.ebook?.title || "—",
            screenshotUrl: o.manualScreenshotKey ? await getPresignedUrl(o.manualScreenshotKey) : null,
        }))
    );

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Manual Payment Verification Queue</h1>
            <ManualPaymentsClient orders={enriched} />
        </div>
    );
}
