import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/base-url";

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();

        if (!query) {
            return new NextResponse("Query is required", { status: 400 });
        }

        const cleanedQuery = query.trim();
        const baseUrl = getBaseUrl();

        // Find PAID orders matching email or phone
        const rawOrders = await prisma_db.order.findMany({
            where: {
                status: "PAID",
                OR: [
                    { customerEmail: { equals: cleanedQuery, mode: 'insensitive' } },
                    { customerPhone: { equals: cleanedQuery } },
                ],
            },
            include: {
                items: {
                    include: {
                        ebook: {
                            select: {
                                id: true,
                                title: true,
                                pages: true,
                                isCombo: true,
                                shortCode: true, // Use permanent short code
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (rawOrders.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        // Map orders — use permanent ebook short codes (no DB writes, no CloudFront signing)
        const processedOrders = rawOrders.map((order) => {
            const items = order.items.map((item) => {
                const ebook = item.ebook;
                // Use the permanent /d/SHORTCODE URL — resolves to fresh CloudFront URL on click
                // Use shortCode if present; fall back to ebook id (resolved by /d route)
                const code = ebook.shortCode || ebook.id;
                const url = `${baseUrl}/d/${code}`;

                return {
                    title: ebook.title,
                    ebookId: ebook.id,
                    pages: ebook.pages,
                    isCombo: ebook.isCombo,
                    url,
                };
            });

            return {
                id: order.id,
                date: order.createdAt,
                amount: order.amount,
                items,
            };
        });

        return NextResponse.json({ orders: processedOrders });

    } catch (error) {
        console.error("[ORDER_LOOKUP_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
