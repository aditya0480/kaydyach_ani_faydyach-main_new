import { prisma_db } from "./prisma";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { toIST, fromIST, getNowIST } from "./date-utils";
import { startOfDay, subDays, eachDayOfInterval, format, parseISO, addDays } from "date-fns";

// Cache tags for invalidation
export const CACHE_TAGS = {
    EBOOKS: "ebooks",
    ORDERS: "orders",
} as const;

/**
 * 1. Get all enabled ebooks (Full list)
 * Cached for 1 hour, tagged for manual invalidation.
 */
export const getEbooks = unstable_cache(
    async () => {
        const data = await prisma_db.ebook.findMany({
            where: { isEnabled: true },
            orderBy: { createdAt: "desc" },
        });
        return data.map((ebook) => ({
            ...ebook,
            price: ebook.price.toString(),
            category: ebook.category || null,
        }));
    },
    ["all-ebooks"],
    { tags: [CACHE_TAGS.EBOOKS], revalidate: 86400 }
);

/**
 * 1b. Get ebooks filtered by language
 */
export const getEbooksByLanguage = (language: "MARATHI" | "HINDI" | "ENGLISH") =>
    unstable_cache(
        async () => {
            const data = await prisma_db.ebook.findMany({
                where: { isEnabled: true, language },
                orderBy: { createdAt: "desc" },
            });
            return data.map((ebook) => ({
                ...ebook,
                price: ebook.price.toString(),
                category: ebook.category || null,
            }));
        },
        [`ebooks-lang-${language}`],
        { tags: [CACHE_TAGS.EBOOKS], revalidate: 86400 }
    )();

/**
 * 2. Get Combo Packages only
 */
export const getComboEbooks = unstable_cache(
    async () => {
        const data = await prisma_db.ebook.findMany({
            where: { isEnabled: true, isCombo: true },
            orderBy: { createdAt: "desc" },
        });
        return data.map((ebook) => ({
            ...ebook,
            price: ebook.price.toString(),
            category: ebook.category || null,
        }));
    },
    ["combo-ebooks"],
    { tags: [CACHE_TAGS.EBOOKS], revalidate: 86400 }
);

/**
 * 3. Get Ebook by ID with full details
 * Uses React.cache for per-request memoization + unstable_cache for persistent caching.
 */
export const getEbookById = cache(async (id: string) => {
    return unstable_cache(
        async (id: string) => {
            const ebook = await prisma_db.ebook.findUnique({
                where: { id },
                include: { includedEbooks: { include: { ebook: true } } },
            });
            if (!ebook) return null;

            // Flatten join table and sort based on comboOrder
            let sortedIncludedEbooks = ebook.includedEbooks.map((ci) => ci.ebook);
            if (ebook.comboOrder && ebook.comboOrder.length > 0) {
                const orderMap = new Map(ebook.comboOrder.map((id: string, index: number) => [id, index]));
                sortedIncludedEbooks = [...sortedIncludedEbooks].sort((a, b) => {
                    const indexA = orderMap.get(a.id) ?? 9999;
                    const indexB = orderMap.get(b.id) ?? 9999;
                    return indexA - indexB;
                });
            }

            return {
                ...ebook,
                price: ebook.price.toString(),
                category: ebook.category || null,
                includedEbooks: sortedIncludedEbooks.map((item) => ({
                    ...item,
                    price: item.price.toString(),
                    category: item.category || null,
                })),
            };
        },
        [`ebook-${id}-sorted`],
        { tags: [CACHE_TAGS.EBOOKS], revalidate: 86400 }
    )(id);
});

/**
 * 4. Search Ebooks with query
 */
export async function searchEbooks(query: string) {
    const isNumeric = /^\d+$/.test(query);
    const displayId = isNumeric ? parseInt(query) : undefined;

    const ebooks = await prisma_db.ebook.findMany({
        where: {
            isEnabled: true,
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
                ...(displayId !== undefined ? [{ displayId }] : []),
            ],
        },
        orderBy: [
            // If it's a numeric query, prioritize exact displayId match
            ...(displayId !== undefined ? [{ displayId: 'asc' as const }] : []),
            { createdAt: 'desc' as const },
        ],
        take: 20, // Limit results for performance
    });

    return ebooks.map((ebook) => ({
        ...ebook,
        price: ebook.price.toString(),
        category: ebook.category || null,
    }));
}

// ── Analytics types ────────────────────────────────────────────────────────

export type BookwiseSales = {
    rangeDays: number;
    summary: { revenue: number; units: number; orders: number; prevRevenue: number; prevUnits: number };
    books: { ebookId: string; title: string; isCombo: boolean; revenue: number; units: number }[];
    daily: { date: string; revenue: number; units: number }[];
    seriesByBook: Record<string, number[]>;
};

export type AdPerformance = {
    rangeDays: number;
    summary: {
        spend: number; revenue: number; orders: number; roas: number; net: number; cac: number;
        prevSpend: number; prevRevenue: number; prevRoas: number;
    };
    daily: { date: string; spend: number; revenue: number; orders: number; roas: number | null; net: number }[];
};

export type DailyAnalyticsBook = {
    book_id: string;
    book_name: string;
    is_combo: boolean;
    units: number;
    revenue: number;
    meta_spend: number | null;
};
export type DailyAnalyticsDay = {
    date: string;
    total_revenue: number;
    total_units: number;
    total_spend: number | null;
    books: DailyAnalyticsBook[];
};
export type DailyAnalytics = {
    from: string;
    to: string;
    books: { id: string; title: string; isCombo: boolean }[];
    days: DailyAnalyticsDay[];
};

export async function getAdPerformance(rangeDays: number): Promise<AdPerformance> {
    const nowIST = getNowIST();
    const startIST = startOfDay(subDays(nowIST, rangeDays - 1));
    const prevStartIST = startOfDay(subDays(nowIST, rangeDays * 2 - 1));
    const from = fromIST(startIST);
    const prevFrom = fromIST(prevStartIST);

    const [orders, spends] = await Promise.all([
        prisma_db.order.findMany({
            where: { status: "PAID", createdAt: { gte: prevFrom } },
            select: { amount: true, createdAt: true },
        }),
        prisma_db.adSpend.findMany({
            where: { date: { gte: prevFrom } },
            select: { amount: true, date: true },
        }),
    ]);

    const dayRev = new Map<string, { revenue: number; orders: number }>();
    const daySpend = new Map<string, number>();
    let prevRevenue = 0;
    let prevSpend = 0;

    for (const o of orders) {
        if (o.createdAt >= from) {
            const k = format(toIST(o.createdAt), "yyyy-MM-dd");
            const d = dayRev.get(k) ?? { revenue: 0, orders: 0 };
            d.revenue += Number(o.amount); d.orders += 1; dayRev.set(k, d);
        } else { prevRevenue += Number(o.amount); }
    }
    for (const s of spends) {
        if (s.date >= from) {
            const k = format(toIST(s.date), "yyyy-MM-dd");
            daySpend.set(k, (daySpend.get(k) ?? 0) + s.amount);
        } else { prevSpend += s.amount; }
    }

    const daily = eachDayOfInterval({ start: startIST, end: nowIST }).map((d) => {
        const k = format(d, "yyyy-MM-dd");
        const rev = dayRev.get(k) ?? { revenue: 0, orders: 0 };
        const spend = Math.round(daySpend.get(k) ?? 0);
        const revenue = Math.round(rev.revenue);
        return {
            date: k, spend, revenue, orders: rev.orders,
            roas: spend > 0 ? Number((revenue / spend).toFixed(2)) : null,
            net: revenue - spend,
        };
    });

    const spend = daily.reduce((s, d) => s + d.spend, 0);
    const revenue = daily.reduce((s, d) => s + d.revenue, 0);
    const ordersCount = daily.reduce((s, d) => s + d.orders, 0);
    prevRevenue = Math.round(prevRevenue);
    prevSpend = Math.round(prevSpend);

    return {
        rangeDays,
        summary: {
            spend, revenue, orders: ordersCount,
            roas: spend > 0 ? Number((revenue / spend).toFixed(2)) : 0,
            net: revenue - spend,
            cac: ordersCount > 0 ? Math.round(spend / ordersCount) : 0,
            prevSpend, prevRevenue,
            prevRoas: prevSpend > 0 ? Number((prevRevenue / prevSpend).toFixed(2)) : 0,
        },
        daily,
    };
}

export async function getBookwiseSales(rangeDays: number): Promise<BookwiseSales> {
    const nowIST = getNowIST();
    const startIST = startOfDay(subDays(nowIST, rangeDays - 1));
    const prevStartIST = startOfDay(subDays(nowIST, rangeDays * 2 - 1));
    const from = fromIST(startIST);
    const prevFrom = fromIST(prevStartIST);

    const items = await prisma_db.orderItem.findMany({
        where: { order: { status: "PAID", createdAt: { gte: prevFrom } } },
        select: {
            price: true,
            ebookId: true,
            orderId: true,
            order: { select: { createdAt: true } },
            ebook: { select: { title: true, isCombo: true } },
        },
    });

    const bookMap = new Map<string, { title: string; isCombo: boolean; revenue: number; units: number }>();
    const dayMap = new Map<string, { revenue: number; units: number }>();
    const bookDayMap = new Map<string, Map<string, number>>();
    const orderSet = new Set<string>();
    let prevRevenue = 0;
    let prevUnits = 0;

    for (const it of items) {
        const created = it.order.createdAt;
        if (created >= from) {
            const book = bookMap.get(it.ebookId) ?? { title: it.ebook.title, isCombo: it.ebook.isCombo, revenue: 0, units: 0 };
            book.revenue += Number(it.price); book.units += 1; bookMap.set(it.ebookId, book);
            const dayKey = format(toIST(created), "yyyy-MM-dd");
            const day = dayMap.get(dayKey) ?? { revenue: 0, units: 0 };
            day.revenue += Number(it.price); day.units += 1; dayMap.set(dayKey, day);
            const bd = bookDayMap.get(it.ebookId) ?? new Map<string, number>();
            bd.set(dayKey, (bd.get(dayKey) ?? 0) + Number(it.price)); bookDayMap.set(it.ebookId, bd);
            orderSet.add(it.orderId);
        } else { prevRevenue += Number(it.price); prevUnits += 1; }
    }

    const daily = eachDayOfInterval({ start: startIST, end: nowIST }).map((d) => {
        const dayKey = format(d, "yyyy-MM-dd");
        const day = dayMap.get(dayKey) ?? { revenue: 0, units: 0 };
        return { date: dayKey, revenue: Math.round(day.revenue), units: day.units };
    });

    const books = Array.from(bookMap.entries())
        .map(([ebookId, b]) => ({ ebookId, title: b.title, isCombo: b.isCombo, revenue: Math.round(b.revenue), units: b.units }))
        .sort((a, b) => b.revenue - a.revenue);

    const revenue = books.reduce((s, b) => s + b.revenue, 0);
    const units = books.reduce((s, b) => s + b.units, 0);
    const dayKeys = daily.map((d) => d.date);
    const seriesByBook: Record<string, number[]> = {};
    for (const [ebookId, bd] of bookDayMap.entries()) {
        seriesByBook[ebookId] = dayKeys.map((k) => Math.round(bd.get(k) ?? 0));
    }

    return {
        rangeDays,
        summary: { revenue, units, orders: orderSet.size, prevRevenue: Math.round(prevRevenue), prevUnits },
        books, daily, seriesByBook,
    };
}

export async function getDailyAnalytics(from: string, to: string): Promise<DailyAnalytics> {
    const todayKey = format(getNowIST(), "yyyy-MM-dd");
    if (to > todayKey) to = todayKey;
    if (from > to) return { from, to, books: [], days: [] };

    const startIST = startOfDay(parseISO(from));
    const endIST = startOfDay(parseISO(to));
    const lowerUTC = fromIST(startIST);
    const upperUTC = fromIST(addDays(endIST, 1));

    const [items, spends, enabledBooks] = await Promise.all([
        prisma_db.orderItem.findMany({
            where: { order: { status: "PAID", createdAt: { gte: lowerUTC, lt: upperUTC } } },
            select: {
                price: true, ebookId: true,
                order: { select: { createdAt: true } },
                ebook: { select: { title: true, isCombo: true } },
            },
        }),
        prisma_db.ebookAdSpend.findMany({
            where: { date: { gte: lowerUTC, lt: upperUTC } },
            select: { ebookId: true, metaSpend: true, date: true },
        }),
        prisma_db.ebook.findMany({
            where: { isEnabled: true },
            select: { id: true, title: true, isCombo: true },
            orderBy: { createdAt: "asc" },
        }),
    ]);

    const bookList = new Map<string, { id: string; title: string; isCombo: boolean }>();
    for (const b of enabledBooks) bookList.set(b.id, { id: b.id, title: b.title, isCombo: b.isCombo });
    for (const it of items) {
        if (!bookList.has(it.ebookId))
            bookList.set(it.ebookId, { id: it.ebookId, title: it.ebook.title, isCombo: it.ebook.isCombo });
    }
    const books = Array.from(bookList.values());

    const sales = new Map<string, Map<string, { units: number; revenue: number }>>();
    for (const it of items) {
        const dayKey = format(toIST(it.order.createdAt), "yyyy-MM-dd");
        const day = sales.get(dayKey) ?? new Map();
        const cur = day.get(it.ebookId) ?? { units: 0, revenue: 0 };
        cur.units += 1; cur.revenue += Number(it.price);
        day.set(it.ebookId, cur); sales.set(dayKey, day);
    }

    const spendMap = new Map<string, Map<string, number>>();
    for (const s of spends) {
        const dayKey = format(toIST(s.date), "yyyy-MM-dd");
        const day = spendMap.get(dayKey) ?? new Map();
        day.set(s.ebookId, (day.get(s.ebookId) ?? 0) + s.metaSpend);
        spendMap.set(dayKey, day);
    }

    const dayKeys = eachDayOfInterval({ start: startIST, end: endIST }).map((d) => format(d, "yyyy-MM-dd"));

    const days: DailyAnalyticsDay[] = dayKeys.map((date) => {
        const daySales = sales.get(date);
        const daySpend = spendMap.get(date);
        let total_revenue = 0; let total_units = 0; let total_spend: number | null = null;

        const bookRows: DailyAnalyticsBook[] = books.map((b) => {
            const s = daySales?.get(b.id);
            const units = s?.units ?? 0;
            const revenue = Math.round(s?.revenue ?? 0);
            const rawSpend = daySpend?.get(b.id);
            const meta_spend = rawSpend != null ? Math.round(rawSpend) : null;
            total_revenue += revenue; total_units += units;
            if (meta_spend !== null) total_spend = (total_spend ?? 0) + meta_spend;
            return { book_id: b.id, book_name: b.title, is_combo: b.isCombo, units, revenue, meta_spend };
        });

        return { date, total_revenue, total_units, total_spend, books: bookRows };
    });

    days.reverse();
    return { from, to, books, days };
}
