"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface ChartOrder {
    createdAt: string;
    amount: number;
    status: string;
}

interface RevenueChartProps {
    orders: ChartOrder[];
    dateFilter: string;
}

const DATE_FORMAT: Record<string, string> = {
    today: 'HH:mm',
    week: 'MMM dd',
    month: 'MMM dd',
    '2months': 'MMM dd',
    '3months': 'MMM dd',
    all: 'MMM yy',
};

export function RevenueChart({ orders, dateFilter }: RevenueChartProps) {
    const chartData = useMemo(() => {
        const fmt = DATE_FORMAT[dateFilter] ?? 'MMM dd';
        const byBucket: Record<string, { revenue: number; orders: number }> = {};

        orders
            .filter(o => o.status === 'PAID')
            .forEach(order => {
                const key = format(new Date(order.createdAt), fmt);
                if (!byBucket[key]) byBucket[key] = { revenue: 0, orders: 0 };
                byBucket[key].revenue += Number(order.amount);
                byBucket[key].orders += 1;
            });

        return Object.entries(byBucket).map(([label, data]) => ({ label, ...data }));
    }, [orders, dateFilter]);

    if (chartData.length < 2) return null;

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 px-5 py-3">
                <div>
                    <h3 className="text-sm font-bold text-[#0A2342]">Revenue Trend</h3>
                    <p className="text-[11px] text-muted-foreground">Paid orders only</p>
                </div>
                <div className="rounded-lg bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    ₹{chartData.reduce((s, d) => s + d.revenue, 0).toLocaleString()} total
                </div>
            </div>
            <div className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                            width={48}
                        />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                return (
                                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
                                        <p className="mb-1.5 text-xs font-bold text-gray-500">{label}</p>
                                        <p className="text-sm font-bold text-[#0A2342]">
                                            ₹{Number(payload[0]?.value ?? 0).toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {(payload[0]?.payload as { orders: number })?.orders} order(s)
                                        </p>
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="revenue" fill="#0A2342" radius={[4, 4, 0, 0]} maxBarSize={48} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
