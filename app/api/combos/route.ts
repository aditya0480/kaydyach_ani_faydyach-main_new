import { NextResponse } from "next/server";
import { getComboEbooks } from "@/lib/data-access";

export async function GET() {
    try {
        const ebooks = await getComboEbooks();
        return NextResponse.json(ebooks);
    } catch (error) {
        console.error("[COMBOS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
