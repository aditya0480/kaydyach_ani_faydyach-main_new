import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { fulfillOrder } from "@/lib/order-fulfillment";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const orderId = String(body.orderId || "");
    const action = body.action as "approve" | "reject";
    const rejectionReason = body.rejectionReason as string | undefined;

    if (!orderId || !["approve", "reject"].includes(action)) {
        return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const order = await prisma_db.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });

    if (action === "approve") {
        await prisma_db.order.update({
            where: { id: orderId },
            data: {
                manualStatus: "ADMIN_APPROVED",
                manualVerifiedAt: new Date(),
                manualVerifiedBy: session.user.email || session.user.id,
                manualRejectionReason: null,
                status: "PAID",
            },
        });
        await fulfillOrder(orderId, `MANUAL_${order.manualUtr || orderId}`, "admin");
        return NextResponse.json({ ok: true, status: "approved" });
    }

    await prisma_db.order.update({
        where: { id: orderId },
        data: {
            manualStatus: "ADMIN_REJECTED",
            manualVerifiedAt: new Date(),
            manualVerifiedBy: session.user.email || session.user.id,
            manualRejectionReason: rejectionReason || "Rejected by admin",
            status: "FAILED",
        },
    });
    return NextResponse.json({ ok: true, status: "rejected" });
}
