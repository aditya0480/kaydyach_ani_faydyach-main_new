"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee, ShoppingBag, Package, TrendingUp, TrendingDown, Sparkles, Loader2, BookOpen, Download, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import type { BookwiseSales } from "@/lib/data-access";

const BRAND = "#0A2342";
const GOLD = "#C79A3E";

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous <= 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(pct)}%
    </span>
  );
}

function StatCard({ icon, label, value, children }: { icon: React.ReactNode; label: string; value: string; children?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-teal/8 text-brand-teal">{icon}</div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-400">{label}</p>
          <p className="flex items-center gap-1.5 text-lg font-black text-gray-900">{value} {children}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function SalesAnalyticsClient({ data }: { data: BookwiseSales }) {
  const { summary, books, daily, rangeDays, seriesByBook } = data;
  const [insights, setInsights] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const avgOrder = summary.orders > 0 ? Math.round(summary.revenue / summary.orders) : 0;
  const topBooks = books.slice(0, 8).map((b) => ({ ...b, label: b.title.length > 22 ? b.title.slice(0, 20) + "…" : b.title }));

  const selectedBook = books.find((b) => b.ebookId === selectedId) ?? null;
  const drilldown = selectedBook
    ? daily.map((d, i) => ({ date: d.date, revenue: seriesByBook[selectedBook.ebookId]?.[i] ?? 0 }))
    : [];

  const exportCsv = () => {
    const header = ["Book", "Type", "Revenue (INR)", "Units", "Share %"];
    const rows = books.map((b) => [
      b.title,
      b.isCombo ? "Combo" : "Single",
      b.revenue,
      b.units,
      summary.revenue > 0 ? Math.round((b.revenue / summary.revenue) * 100) : 0,
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-bookwise-${rangeDays}d.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const insightMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/sales-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rangeDays, summary, books, daily }),
      });
      if (!res.ok) throw new Error("failed");
      return (await res.json()) as { insights: string };
    },
    onSuccess: (d) => setInsights(d.insights),
    onError: () => toast.error("Could not generate insights. Try again."),
  });

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={books.length === 0} className="h-8 gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<IndianRupee className="h-5 w-5" />} label={`Revenue · ${rangeDays}d`} value={`₹${summary.revenue.toLocaleString("en-IN")}`}>
          <Delta current={summary.revenue} previous={summary.prevRevenue} />
        </StatCard>
        <StatCard icon={<Package className="h-5 w-5" />} label="Units sold" value={summary.units.toLocaleString("en-IN")}>
          <Delta current={summary.units} previous={summary.prevUnits} />
        </StatCard>
        <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Paid orders" value={summary.orders.toLocaleString("en-IN")} />
        <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Avg order value" value={`₹${avgOrder.toLocaleString("en-IN")}`} />
      </div>

      {/* Revenue by book */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue by book</CardTitle></CardHeader>
        <CardContent>
          {topBooks.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No paid sales in this range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(160, topBooks.length * 38)}>
              <BarChart data={topBooks} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
                <Tooltip formatter={(v?: number) => [`₹${(v ?? 0).toLocaleString("en-IN")}`, "Revenue"]} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="revenue" fill={BRAND} radius={[0, 4, 4, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Daily revenue trend */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Daily revenue</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), "dd MMM")} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={20} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                labelFormatter={(d) => format(parseISO(String(d)), "dd MMM yyyy")}
                formatter={(v?: number) => [`₹${(v ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-book table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Book breakdown</CardTitle>
          <p className="text-[11px] text-gray-400">Tap a row for its daily trend</p>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-bold tracking-wide text-gray-400 uppercase">
                  <th className="px-4 py-2">Book</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                  <th className="px-4 py-2 text-right">Units</th>
                  <th className="px-4 py-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr
                    key={b.ebookId}
                    onClick={() => setSelectedId(b.ebookId === selectedId ? null : b.ebookId)}
                    className={`cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-brand-gold/5 ${b.ebookId === selectedId ? "bg-brand-gold/10" : ""}`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2 font-medium text-gray-800">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                        <span className="line-clamp-1">{b.title}</span>
                        {b.isCombo && <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">COMBO</span>}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-gray-900">₹{b.revenue.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{b.units}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{summary.revenue > 0 ? Math.round((b.revenue / summary.revenue) * 100) : 0}%</td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No paid sales in this range.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Per-book daily drill-down */}
      {selectedBook && (
        <Card className="border-brand-teal/30">
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div className="min-w-0">
              <CardTitle className="line-clamp-1 text-sm">{selectedBook.title}</CardTitle>
              <p className="mt-0.5 text-[11px] text-gray-400">Daily revenue · ₹{selectedBook.revenue.toLocaleString("en-IN")} · {selectedBook.units} units</p>
            </div>
            <button onClick={() => setSelectedId(null)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={drilldown} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), "dd MMM")} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  labelFormatter={(d) => format(parseISO(String(d)), "dd MMM yyyy")}
                  formatter={(v?: number) => [`₹${(v ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke={BRAND} strokeWidth={2} fill="url(#bookrev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* AI insights */}
      <Card className="border-brand-gold/30">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4 text-brand-gold" /> AI insights</CardTitle>
          <Button size="sm" disabled={insightMutation.isPending || books.length === 0} onClick={() => insightMutation.mutate()} className="h-8 bg-brand-teal text-white hover:bg-brand-teal/90">
            {insightMutation.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing…</> : "Generate"}
          </Button>
        </CardHeader>
        <CardContent>
          {insights ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{insights}</div>
          ) : (
            <p className="text-sm text-gray-400">Generate an AI read of these numbers — top movers, trends, concentration risk, and what to act on.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
