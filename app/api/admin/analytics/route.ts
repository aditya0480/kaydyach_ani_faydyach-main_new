import { NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStartOfDayIST, toIST } from "@/lib/date-utils";

export async function GET() {
    try {
        const session = await auth();
        // Check if user is admin (you might want to add role check here if needed)
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Correct to IST start of day
        const thirtyDaysAgoIST = getStartOfDayIST(thirtyDaysAgo);

        // Run queries in parallel for better performance
        const [revenueResult, paidOrdersCount, allOrdersCount, uniqueCustomers, salesData, recentOrders] = await Promise.all([
            // 1. Total Revenue
            prisma_db.order.aggregate({
                _sum: { amount: true },
                where: { status: "PAID" },
            }),
            // 2. Paid Orders
            prisma_db.order.count({
                where: { status: "PAID" },
            }),
            // 3. All Initiated Orders (for Conversion Rate)
            prisma_db.order.count(),
            // 4. Total Customers (Unique Emails)
            prisma_db.order.findMany({
                where: {
                    status: "PAID",
                    customerEmail: { not: null },
                },
                distinct: ["customerEmail"],
                select: { customerEmail: true },
            }),
            // 5. Sales Over Time (Last 30 days)
            prisma_db.order.findMany({
                where: {
                    status: "PAID",
                    createdAt: { gte: thirtyDaysAgoIST },
                },
                select: {
                    createdAt: true,
                    amount: true,
                },
                orderBy: { createdAt: "asc" },
            }),
            // 6. Recent Transactions
            prisma_db.order.findMany({
                where: { status: "PAID" },
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    items: {
                        include: {
                            ebook: { select: { title: true } }
                        }
                    }
                }
            })
        ]);

        const totalRevenue = revenueResult._sum.amount || 0;
        const totalOrders = paidOrdersCount; // Keep existing var name for compatibility if needed, or totalPaidOrders
        const totalCustomers = uniqueCustomers.length;

        // Conversion Rate: Paid / Total Initiated
        // If 0 orders, rate is 0
        const conversionRate = allOrdersCount > 0
            ? ((paidOrdersCount / allOrdersCount) * 100)
            : 0;

        // Group by day for graph - USING IST DATES
        const salesByDay: Record<string, number> = {};
        salesData.forEach((order) => {
            // Convert order creation time to IST before grouping so it matches the dashboard day
            const istDate = toIST(order.createdAt);
            const date = istDate.toISOString().split("T")[0]; // YYYY-MM-DD
            salesByDay[date] = (salesByDay[date] || 0) + order.amount;
        });

        const graphData = Object.entries(salesByDay).map(([date, total]) => ({
            name: date,
            total,
        }));

        const recentTransactions = recentOrders.map(order => ({
            id: order.id,
            name: order.customerName || "Unknown",
            email: order.customerEmail,
            amount: order.amount,
            status: order.status,
            date: order.createdAt,
            items: order.items.map(item => item.ebook.title).join(", ")
        }));

        return NextResponse.json({
            totalRevenue,
            totalOrders,
            totalCustomers,
            conversionRate,
            graphData,
            recentTransactions
        });

    } catch (error) {
        console.error("[ADMIN_ANALYTICS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
