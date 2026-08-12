import { NextRequest, NextResponse } from "next/server";
import { searchEbooks, getEbooks } from "@/lib/data-access";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query) {
            // If no query, return latest 6 (same as home page limit) to keep it efficient
            const ebooks = await getEbooks();
            return NextResponse.json(ebooks.slice(0, 6));
        }

        const ebooks = await searchEbooks(query);
        return NextResponse.json(ebooks);
    } catch (error) {
        console.error("[SEARCH_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
