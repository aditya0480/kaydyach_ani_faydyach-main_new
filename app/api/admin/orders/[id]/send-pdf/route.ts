import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import { sendBookWithPdfWhatsapp, hasBookPdfConfig } from "@/lib/whatsapp";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json().catch(() => ({})) as { testPhone?: string };

        const order = await prisma_db.order.findUnique({
            where: { id },
            include: { items: { include: { ebook: true } } },
        });

        if (!order) return new NextResponse("Order not found", { status: 404 });
        if (order.status !== "PAID") return new NextResponse("Order is not PAID", { status: 400 });

        const phone = body.testPhone?.trim() || order.customerPhone;
        if (!phone) return new NextResponse("No phone number", { status: 400 });

        let sentCount = 0;
        for (const item of order.items) {
            if (!hasBookPdfConfig(item.ebookId)) continue;
            await sendBookWithPdfWhatsapp(
                phone,
                order.customerName || "Customer",
                item.ebookId,
                item.ebook.title
            );
            sentCount++;
        }

        return NextResponse.json({ success: true, sentCount });
    } catch (error) {
        console.error("[SEND_PDF]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
