import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConsultationPrice, setConsultationPrice } from "@/lib/consultation-config";

async function requireAdmin() {
    const session = await auth();
    return session?.user?.role === "ADMIN";
}

export async function GET() {
    if (!(await requireAdmin())) return new NextResponse("Unauthorized", { status: 401 });
    const price = await getConsultationPrice();
    return NextResponse.json({ price });
}

export async function POST(req: NextRequest) {
    if (!(await requireAdmin())) return new NextResponse("Unauthorized", { status: 401 });
    try {
        const body = await req.json();
        const price = Number(body.price);

        if (!Number.isFinite(price) || price < 1 || price > 100000) {
            return new NextResponse("Invalid price", { status: 400 });
        }

        const updated = await setConsultationPrice(Math.round(price));
        return NextResponse.json({ price: updated });
    } catch (error) {
        console.error("[CONSULTATION_PRICE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
