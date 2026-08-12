"use client";

import { IndianRupee, CheckCircle2, TrendingUp, TrendingDown, ShoppingBag, Target, AlertCircle } from "lucide-react";

const COMPARISON_LABELS: Record<string, string> = {
    today: 'vs yesterday',
    week: 'vs prev week',
    month: 'vs last month',
    '2months': 'vs prev 2mo',
    '3months': 'vs prev 3mo',
    all: '',
};

interface StatsCardsProps {
    totalRevenue: number;
    paidOrders: number;
    previousRevenue: number;
    previousOrders: number;
    conversionRate: number;
    failedRevenue: number;
    failedOrders: number;
    dateFilter: string;
}

function GrowthBadge({ current, previous, label }: { current: number; previous: number; label: string }) {
    if (!label || previous === 0) return <span className="font-medium text-muted-foreground">No prior data</span>;
    const pct = ((current - previous) / previous) * 100;
    const isUp = pct >= 0;
    return (
        <div className="flex items-center gap-1.5">
            {isUp
                ? <TrendingUp className="h-3 w-3 text-green-600" />
                : <TrendingDown className="h-3 w-3 text-red-600" />
            }
            <span className={`font-bold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                {isUp ? '+' : ''}{pct.toFixed(1)}%
            </span>
            <span className="hidden font-medium text-muted-foreground sm:inline">{label}</span>
        </div>
    );
}

export function StatsCards({ totalRevenue, paidOrders, previousRevenue, previousOrders, conversionRate, failedRevenue, failedOrders, dateFilter }: StatsCardsProps) {
    const avgOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0;
    const compLabel = COMPARISON_LABELS[dateFilter] ?? '';

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {/* Revenue */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-green-50/50 shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-5 transition-opacity group-hover:opacity-10">
                    <IndianRupee className="h-16 w-16 text-green-600" />
                </div>
                <div className="flex flex-row items-center justify-between p-4 pb-1">
                    <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Revenue</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100/50">
                        <IndianRupee className="h-4 w-4 text-green-600" />
                    </div>
                </div>
                <div className="p-4 pt-1">
                    <div className="text-xl font-bold text-[#0A2342] md:text-2xl">₹{totalRevenue.toLocaleString()}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] md:text-xs">
                        <GrowthBadge current={totalRevenue} previous={previousRevenue} label={compLabel} />
                    </div>
                </div>
            </div>

            {/* Paid Orders */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-blue-50/50 shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-5 transition-opacity group-hover:opacity-10">
                    <CheckCircle2 className="h-16 w-16 text-blue-600" />
                </div>
                <div className="flex flex-row items-center justify-between p-4 pb-1">
                    <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Paid Orders</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/50">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                </div>
                <div className="p-4 pt-1">
                    <div className="text-xl font-bold text-[#0A2342] md:text-2xl">{paidOrders}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] md:text-xs">
                        <GrowthBadge current={paidOrders} previous={previousOrders} label={compLabel} />
                    </div>
                </div>
            </div>

            {/* Avg Order Value */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-purple-50/50 shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-5 transition-opacity group-hover:opacity-10">
                    <ShoppingBag className="h-16 w-16 text-purple-600" />
                </div>
                <div className="flex flex-row items-center justify-between p-4 pb-1">
                    <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Avg Order</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100/50">
                        <ShoppingBag className="h-4 w-4 text-purple-600" />
                    </div>
                </div>
                <div className="p-4 pt-1">
                    <div className="text-xl font-bold text-[#0A2342] md:text-2xl">
                        ₹{avgOrderValue > 0 ? Math.round(avgOrderValue).toLocaleString() : '—'}
                    </div>
                    <p className="mt-1 text-[10px] font-medium text-muted-foreground md:text-xs">Per paid order</p>
                </div>
            </div>

            {/* Conversion Rate */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-orange-50/50 shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-5 transition-opacity group-hover:opacity-10">
                    <Target className="h-16 w-16 text-orange-600" />
                </div>
                <div className="flex flex-row items-center justify-between p-4 pb-1">
                    <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Conversion</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100/50">
                        <Target className="h-4 w-4 text-orange-600" />
                    </div>
                </div>
                <div className="p-4 pt-1">
                    <div className={`text-xl font-bold md:text-2xl ${conversionRate >= 70 ? 'text-green-600' : conversionRate >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                        {conversionRate > 0 ? `${conversionRate.toFixed(1)}%` : '—'}
                    </div>
                    <p className="mt-1 text-[10px] font-medium text-muted-foreground md:text-xs">Paid / all attempts</p>
                </div>
            </div>

            {/* Recovery Opportunity */}
            <div className="group relative col-span-2 overflow-hidden rounded-2xl border border-red-100 bg-linear-to-br from-white to-red-50/50 shadow-sm lg:col-span-1">
                <div className="absolute top-0 right-0 p-3 opacity-5 transition-opacity group-hover:opacity-10">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <div className="flex flex-row items-center justify-between p-4 pb-1">
                    <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Recovery Opp.</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100/50">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                </div>
                <div className="p-4 pt-1">
                    <div className={`text-xl font-bold md:text-2xl ${failedRevenue > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {failedRevenue > 0 ? `₹${failedRevenue.toLocaleString()}` : '—'}
                    </div>
                    <p className="mt-1 text-[10px] font-medium text-muted-foreground md:text-xs">
                        {failedOrders > 0 ? `${failedOrders} failed/pending` : 'No lost orders'}
                    </p>
                </div>
            </div>
        </div>
    );
}
