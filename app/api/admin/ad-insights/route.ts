import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { gemini } from "@/lib/gemini_ai";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { rangeDays, summary, daily } = await req.json();

        const prompt = `You are a performance-marketing analyst for an Indian Marathi-language legal ebook business (currency ₹ INR). Ad spend is on Meta. ROAS = revenue ÷ ad spend (blended/account-level, not per-campaign).
Analyze the last ${rangeDays} days and advise the owner.

STRICT RULES:
- Use ONLY the numbers provided. Do NOT invent, estimate, or recompute figures.
- ROAS is blended (mixes organic + paid revenue) — treat it as directional, not exact per-ad truth; say so if relevant.
- Output 4–6 short bullet points (plain text, each starting "• "), covering: overall ROAS & net (revenue − spend) and the trend vs the previous period, days with notably low/high ROAS, whether spend changes tracked revenue changes, CAC, and 1–2 concrete actions (scale / cut / investigate). No preamble, no markdown headers.

DATA (JSON):
${JSON.stringify({ summary, daily })}`;

        const result = await gemini.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        const insights = result.response.text()?.trim();
        if (!insights) throw new Error("empty response");
        return NextResponse.json({ insights });
    } catch (error) {
        console.error("[AD_INSIGHTS_ERROR]", error);
        return new NextResponse("Insight generation failed", { status: 502 });
    }
}
