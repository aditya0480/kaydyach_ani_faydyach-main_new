import { prisma_db } from "@/lib/prisma";
import { OrdersClient } from "./orders-client";
import { StatsCards } from "./stats-cards";
import { RefreshButton } from "./refresh-button";
import { RevenueChart } from "./revenue-chart";
import { DropAnalysis, type DropBucket } from "./drop-analysis";
import { getISTDateRange, getNowIST, fromIST } from "@/lib/date-utils";
import { startOfDay, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns";

export const dynamic = 'force-dynamic';

type DateFilter = 'today' | 'week' | 'month' | '2months' | '3months' | 'all';

function getComparisonQuery(filter: DateFilter, nowIST: Date) {
    switch (filter) {
        case 'today': {
            const yStart = subDays(startOfDay(nowIST), 1);
            return { gte: fromIST(yStart), lte: fromIST(startOfDay(nowIST)) };
        }
        case 'week':
            return { gte: fromIST(subDays(nowIST, 14)), lte: fromIST(subDays(nowIST, 7)) };
        case 'month': {
            const prev = subMonths(nowIST, 1);
            return { gte: fromIST(startOfMonth(prev)), lte: fromIST(endOfMonth(prev)) };
        }
        case '2months':
            return { gte: fromIST(subDays(nowIST, 120)), lte: fromIST(subDays(nowIST, 60)) };
        case '3months':
            return { gte: fromIST(subDays(nowIST, 180)), lte: fromIST(subDays(nowIST, 90)) };
        default:
            return undefined;
    }
}

export default async function OrdersPage({ searchParams }: { searchParams?: Promise<{ date?: string; from?: string; to?: string }> }) {
    const sp = await searchParams;
    const dateFilter = (sp?.date as DateFilter) || 'today';
    const nowIST = getNowIST();

    const customFrom = sp?.from;
    const customTo = sp?.to;
    const isCustom = !!customFrom;

    let dateQuery: { gte?: Date; lte?: Date } | undefined;
    if (isCustom) {
        const fromDate = new Date(`${customFrom}T00:00:00+05:30`);
        const toDate = customTo ? new Date(`${customTo}T23:59:59+05:30`) : new Date();
        dateQuery = { gte: fromDate, lte: toDate };
    } else {
        dateQuery = getISTDateRange(dateFilter);
    }

    const comparisonQuery = isCustom ? undefined : getComparisonQuery(dateFilter, nowIST);

    const [orders, currentStats, previousStats, statusCounts, failedStats] = await Promise.all([
        prisma_db.order.findMany({
            where: { createdAt: dateQuery },
            select: {
                id: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                amount: true,
                status: true,
                failureReason: true,
                razorpayOrderId: true,
                createdAt: true,
                updatedAt: true,
                items: {
                    select: {
                        id: true,
                        price: true,
                        ebook: { select: { id: true, title: true, coverImage: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: dateFilter === 'all' ? 1000 : 200,
        }),
        prisma_db.order.aggregate({
            where: { createdAt: dateQuery, status: "PAID" },
            _sum: { amount: true },
            _count: { id: true },
        }),
        comparisonQuery
            ? prisma_db.order.aggregate({
                where: { createdAt: comparisonQuery, status: "PAID" },
                _sum: { amount: true },
                _count: { id: true },
            })
            : Promise.resolve({ _sum: { amount: null as null }, _count: { id: 0 } }),
        prisma_db.order.groupBy({
            by: ['status'],
            where: { createdAt: dateQuery },
            _count: { id: true },
        }),
        prisma_db.order.aggregate({
            where: { createdAt: dateQuery, status: { in: ["FAILED", "PENDING"] } },
            _sum: { amount: true },
            _count: { id: true },
        }),
    ]);

    const totalRevenue = Number(currentStats._sum.amount || 0);
    const paidOrders = currentStats._count.id || 0;
    const previousRevenue = Number(previousStats._sum.amount || 0);
    const previousOrders = previousStats._count.id || 0;
    const failedRevenue = Number(failedStats._sum?.amount || 0);
    const failedOrders = (failedStats._count as { id?: number })?.id || 0;

    const statusMap: Record<string, number> = {};
    for (const s of statusCounts) statusMap[s.status] = s._count.id;
    const totalAttempted = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const conversionRate = totalAttempted > 0 ? ((statusMap['PAID'] || 0) / totalAttempted) * 100 : 0;

    // Drop-off analysis: fetch OrderLog events for PENDING orders
    const pendingOrders = orders.filter((o) => o.status === "PENDING");
    const pendingIds = pendingOrders.map((o) => o.id);
    const dropLogs = pendingIds.length > 0
        ? await prisma_db.orderLog.findMany({
            where: {
                orderId: { in: pendingIds },
                event: { in: ["MODAL_OPENED", "MODAL_DISMISSED", "PAYMENT_FAILED_CLIENT", "CALLBACK_EMPTY", "CALLBACK_ERROR"] },
            },
            select: { orderId: true, event: true, metadata: true },
        })
        : [];

    const EVENT_PRIORITY: Record<string, number> = {
        MODAL_OPENED: 1,
        MODAL_DISMISSED: 2,
        CALLBACK_EMPTY: 3,
        PAYMENT_FAILED_CLIENT: 4,
        CALLBACK_ERROR: 5,
    };
    const orderDropMap = new Map<string, { event: string; metadata: unknown }>();
    for (const log of dropLogs) {
        const existing = orderDropMap.get(log.orderId ?? "");
        const priority = EVENT_PRIORITY[log.event] ?? 0;
        const existingPriority = existing ? (EVENT_PRIORITY[existing.event] ?? 0) : -1;
        if (priority > existingPriority) {
            orderDropMap.set(log.orderId ?? "", { event: log.event, metadata: log.metadata });
        }
    }

    const bucketCounts: Record<string, number> = {
        never_started: 0, modal_dismissed: 0, abandoned_redirect: 0,
        gateway_error: 0, client_error: 0, unknown: 0,
    };
    const gatewayErrors: string[] = [];

    for (const order of pendingOrders) {
        const drop = orderDropMap.get(order.id);
        if (!drop) { bucketCounts.never_started++; }
        else if (drop.event === "CALLBACK_ERROR") {
            bucketCounts.gateway_error++;
            const meta = drop.metadata as Record<string, string> | null;
            if (meta?.error_description) gatewayErrors.push(meta.error_description);
        } else if (drop.event === "PAYMENT_FAILED_CLIENT") { bucketCounts.client_error++; }
        else if (drop.event === "CALLBACK_EMPTY") { bucketCounts.abandoned_redirect++; }
        else if (drop.event === "MODAL_DISMISSED") { bucketCounts.modal_dismissed++; }
        else if (drop.event === "MODAL_OPENED") { bucketCounts.unknown++; }
    }

    const dropBuckets: DropBucket[] = [
        { category: "never_started", count: bucketCounts.never_started, label: "Never started", description: "Order created but user never opened the payment modal" },
        { category: "modal_dismissed", count: bucketCounts.modal_dismissed, label: "Dismissed modal", description: "User opened Razorpay modal but closed it without paying" },
        { category: "abandoned_redirect", count: bucketCounts.abandoned_redirect, label: "Abandoned redirect", description: "User hit back button or network dropped during payment redirect" },
        { category: "gateway_error", count: bucketCounts.gateway_error, label: "Gateway error", description: "Razorpay reported a payment error", errorSamples: [...new Set(gatewayErrors)].slice(0, 3) },
        { category: "client_error", count: bucketCounts.client_error, label: "Payment failed", description: "Payment failed on client side (card declined, UPI timeout, etc.)" },
        { category: "unknown", count: bucketCounts.unknown, label: "Unknown drop", description: "Modal was opened but no further events recorded" },
    ];

    // Serialize Prisma Decimal/Date to plain JS values for RSC boundary
    const serializedOrders = orders.map(o => ({
        ...o,
        amount: Number(o.amount),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        items: o.items.map(item => ({
            ...item,
            price: Number(item.price),
        })),
    }));

    return (
        <div className="animate-in fade-in mx-auto max-w-7xl space-y-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2 md:pb-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#0A2342] md:text-3xl">Orders</h1>
                    <p className="mt-1 hidden text-xs text-muted-foreground md:block md:text-sm">
                        Manage and track your recent sales activity.
                    </p>
                </div>
                <RefreshButton />
            </div>

            {/* Stats Cards — synced to selected date filter */}
            <StatsCards
                totalRevenue={totalRevenue}
                paidOrders={paidOrders}
                previousRevenue={previousRevenue}
                previousOrders={previousOrders}
                conversionRate={conversionRate}
                failedRevenue={failedRevenue}
                failedOrders={failedOrders}
                dateFilter={dateFilter}
            />

            {/* Drop-off Analysis */}
            <DropAnalysis buckets={dropBuckets} totalPending={pendingOrders.length} />

            {/* Revenue Chart */}
            <RevenueChart orders={serializedOrders} dateFilter={dateFilter} />

            {/* Orders Table */}
            <OrdersClient orders={serializedOrders} loadedAt={new Date().toISOString()} customFrom={customFrom} customTo={customTo} />
        </div>
    );
}
