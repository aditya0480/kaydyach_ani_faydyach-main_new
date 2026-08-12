import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma_db } from "@/lib/prisma";

const PLATFORMS = ["META", "GOOGLE", "OTHER"] as const;
type Platform = (typeof PLATFORMS)[number];

async function requireAdmin() {
    const session = await auth();
    return session?.user?.role === "ADMIN";
}

function toDayDate(dateStr: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    const d = new Date(`${dateStr}T00:00:00.000Z`);
    return isNaN(d.getTime()) ? null : d;
}

export async function GET() {
    if (!(await requireAdmin())) return new NextResponse("Unauthorized", { status: 401 });
    const entries = await prisma_db.adSpend.findMany({ orderBy: { date: "desc" }, take: 90 });
    return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
    if (!(await requireAdmin())) return new NextResponse("Unauthorized", { status: 401 });
    try {
        const body = await req.json();
        const date = toDayDate(String(body.date ?? ""));
        const platform: Platform = PLATFORMS.includes(body.platform) ? body.platform : "META";
        const amount = Number(body.amount);

        if (!date) return new NextResponse("Invalid date (expected yyyy-mm-dd)", { status: 400 });
        if (!Number.isFinite(amount) || amount < 0) return new NextResponse("Invalid amount", { status: 400 });

        const data = {
            amount,
            campaign: body.campaign ? String(body.campaign) : null,
            clicks: body.clicks != null && body.clicks !== "" ? Number(body.clicks) : null,
            impressions: body.impressions != null && body.impressions !== "" ? Number(body.impressions) : null,
            notes: body.notes ? String(body.notes) : null,
        };

        const entry = await prisma_db.adSpend.upsert({
            where: { date_platform: { date, platform } },
            update: data,
            create: { date, platform, ...data },
        });
        return NextResponse.json(entry);
    } catch (error) {
        console.error("[AD_SPEND_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    if (!(await requireAdmin())) return new NextResponse("Unauthorized", { status: 401 });
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return new NextResponse("Missing id", { status: 400 });
    await prisma_db.adSpend.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}
