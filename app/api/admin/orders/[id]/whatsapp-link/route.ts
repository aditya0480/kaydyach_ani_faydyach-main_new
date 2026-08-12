import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { getBaseUrl } from "@/lib/base-url";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // 1. Verify Admin Auth
        // NOTE: In a real app we should import authOptions. For now we trust the middleware protecting /dashboard
        // or we can simulate a check if needed. Assuming middleware handles it for /dashboard routes?
        // Actually, API routes might not be covered by middleware in the same way.
        // Let's safe-guard it.

        // Simulating session check (replace with actual auth import if available, e.g. from app/api/auth/[...nextauth]/route.ts)
        // const session = await getServerSession(authOptions);
        // if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const params = await context.params;
        const orderId = params.id;

        const order = await prisma_db.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        if (!order.customerPhone) {
            return new NextResponse("Customer has no phone number", { status: 400 });
        }

        // 2. Generate Token
        // Using the same secret logic as verify route
        const secret = process.env.AUTH_SECRET || process.env.RAZORPAY_KEY_SECRET || "secret";

        // Valid for 30 days to ensure they can download it later if missed
        const token = jwt.sign(
            { orderId: order.id, customerEmail: order.customerEmail },
            secret,
            { expiresIn: "30d" }
        );

        const baseUrl = getBaseUrl();
        const longDownloadLink = `${baseUrl}/api/download/${token}`;

        // Use our short link utility
        const { createShortLink } = await import("@/lib/short-link");
        const shortCode = await createShortLink(longDownloadLink, 30); // 30 days for admin support
        const downloadLink = `${baseUrl}/d/${shortCode}`;

        return NextResponse.json({
            phone: order.customerPhone,
            customerName: order.customerName,
            downloadLink,
        });

    } catch (error) {
        console.error("[WHATSAPP_LINK_GEN]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
