import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const logs = await prisma_db.orderLog.findMany({
            where: { orderId: id },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                event: true,
                source: true,
                metadata: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            logs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() }))
        );
    } catch (error) {
        console.error("[ORDER_LOGS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
