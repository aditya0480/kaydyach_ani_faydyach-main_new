import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDailyAnalytics } from "@/lib/data-access";
import { getNowIST } from "@/lib/date-utils";
import { format, subDays } from "date-fns";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const nowIST = getNowIST();
    const toParam = searchParams.get("to") ?? "";
    const fromParam = searchParams.get("from") ?? "";
    const to = DAY.test(toParam) ? toParam : format(nowIST, "yyyy-MM-dd");
    const from = DAY.test(fromParam) ? fromParam : format(subDays(nowIST, 29), "yyyy-MM-dd");

    const data = await getDailyAnalytics(from, to);
    return NextResponse.json(data);
}
