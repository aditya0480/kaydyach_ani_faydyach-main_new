import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;
    const order = await prisma_db.order.findUnique({
        where: { id: orderId },
        select: { id: true, status: true, manualStatus: true, manualRejectionReason: true },
    });
    if (!order) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({
        ok: true,
        orderStatus: order.status,
        manualStatus: order.manualStatus,
        rejectionReason: order.manualRejectionReason,
    });
}
