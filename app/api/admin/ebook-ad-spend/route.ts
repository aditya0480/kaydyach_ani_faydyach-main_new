import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma_db } from "@/lib/prisma";

async function requireAdmin() {
    const session = await auth();
    return session?.user?.role === "ADMIN";
}

function toDayDate(dateStr: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    const d = new Date(`${dateStr}T00:00:00.000Z`);
    return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
    if (!(await requireAdmin())) return new NextResponse("Unauthorized", { status: 401 });
    const { searchParams } = new URL(req.url);
    const from = toDayDate(searchParams.get("from") ?? "");
    const to = toDayDate(searchParams.get("to") ?? "");
    const entries = await prisma_db.ebookAdSpend.findMany({
        where: from && to ? { date: { gte: from, lte: to } } : undefined,
        orderBy: { date: "desc" },
        take: 1000,
    });
    return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
    if (!(await requireAdmin())) return new NextResponse("Unauthorized", { status: 401 });
    try {
        const body = await req.json();
        const date = toDayDate(String(body.date ?? ""));
        const ebookId = String(body.book_id ?? body.ebookId ?? "").trim();
        const metaSpend = Number(body.meta_spend ?? body.metaSpend);

        if (!date) return new NextResponse("Invalid date (expected yyyy-mm-dd)", { status: 400 });
        if (!ebookId) return new NextResponse("Missing book_id", { status: 400 });
        if (!Number.isFinite(metaSpend) || metaSpend < 0) return new NextResponse("Invalid meta_spend", { status: 400 });

        const entry = await prisma_db.ebookAdSpend.upsert({
            where: { date_ebookId: { date, ebookId } },
            update: { metaSpend, enteredOn: new Date() },
            create: { date, ebookId, metaSpend },
        });
        return NextResponse.json({ success: true, entry });
    } catch (error) {
        console.error("[EBOOK_AD_SPEND_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
