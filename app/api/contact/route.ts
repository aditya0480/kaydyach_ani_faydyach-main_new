import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma_db } from "@/lib/prisma";

const contactSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    subject: z.string().min(2).max(200),
    message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = contactSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { name, email, subject, message } = parsed.data;

        await prisma_db.lead.create({
            data: {
                name,
                email,
                resource: `[Contact Form] Subject: ${subject} | Message: ${message}`,
            },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
    }
}
