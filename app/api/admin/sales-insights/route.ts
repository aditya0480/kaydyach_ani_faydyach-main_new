import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { gemini } from "@/lib/gemini_ai";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { rangeDays, summary, books, daily } = await req.json();

        const prompt = `You are a sales analyst for an Indian Marathi-language legal ebook business (currency ₹ INR).
Analyze the PAID-sales data below for the last ${rangeDays} days and give the owner a concise, actionable read.

STRICT RULES:
- Use ONLY the numbers provided. Do NOT invent, estimate, or recompute any figure.
- If something cannot be determined from the data, say so briefly.
- Be specific and reference actual book titles and numbers from the data.
- Output 4–6 short bullet points (plain text, start each with "• "), covering: top movers, the period trend (compare revenue vs previous period), revenue concentration/risk, and 1–2 concrete actions to consider. No preamble, no markdown headers.

DATA (JSON):
${JSON.stringify({ summary, books, daily })}`;

        const result = await gemini.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        const insights = result.response.text()?.trim();
        if (!insights) throw new Error("empty response");
        return NextResponse.json({ insights });
    } catch (error) {
        console.error("[SALES_INSIGHTS_ERROR]", error);
        return new NextResponse("Insight generation failed", { status: 502 });
    }
}
