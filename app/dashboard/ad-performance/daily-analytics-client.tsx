"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IndianRupee,
  Wallet,
  Target,
  TrendingUp,
  Download,
  ChevronRight,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import type { DailyAnalytics, DailyAnalyticsDay } from "@/lib/data-access";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const GREEN = "#1D9E75";
const AMBER = "#BA7517";
const RED = "#E24B4A";
const GRAY = "#9ca3af";

// ── helpers ──────────────────────────────────────────────────────────────
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const istToday = () => new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
const shiftDays = (key: string, n: number) => {
  const d = new Date(`${key}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const roasOf = (rev: number, spend: number | null): number | null =>
  spend != null && spend > 0 ? rev / spend : null;
const roasColor = (roas: number | null) =>
  roas == null ? GRAY : roas >= 3 ? GREEN : roas >= 1.5 ? AMBER : RED;
const profitColor = (net: number) => (net >= 0 ? GREEN : RED);
const fmtRoas = (roas: number | null) => (roas == null ? "—" : `${roas.toFixed(2)}x`);
const fmtNet = (net: number) => `${net >= 0 ? "+" : "−"}${inr(Math.abs(net))}`;

const PRESETS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ── summary card ─────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-teal/8 text-brand-teal">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-400">{label}</p>
          <p className="text-lg font-black" style={{ color: valueColor ?? "#111827" }}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── inline spend input (auto-save on blur/Enter) ─────────────────────────
function SpendInput({
  date,
  bookId,
  value,
  onSaved,
}: {
  date: string;
  bookId: string;
  value: number | null;
  onSaved: (date: string, bookId: string, spend: number) => void;
}) {
  const [draft, setDraft] = useState(value == null ? "" : String(value));
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: async (spend: number) => {
      const res = await fetch("/api/admin/ebook-ad-spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, book_id: bookId, meta_spend: spend }),
      });
      if (!res.ok) throw new Error("save failed");
      return spend;
    },
    onSuccess: (spend) => {
      onSaved(date, bookId, spend);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    },
    onError: () => toast.error("Could not save spend. Try again."),
  });

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === "") return; // nothing entered → leave as-is
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (n === (value ?? -1)) return; // unchanged
    mutation.mutate(n);
  };

  return (
    <span className="inline-flex items-center justify-end gap-1.5">
      <span className="relative">
        <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-xs text-gray-400">₹</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          placeholder="enter spend"
          className="h-7 w-24 rounded-md border border-gray-200 bg-white pr-2 pl-5 text-right text-xs tabular-nums focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/30 focus:outline-none"
        />
      </span>
      {mutation.isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
      ) : saved ? (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold" style={{ color: GREEN }}>
          <Check className="h-3 w-3" /> Saved
        </span>
      ) : (
        <span className="w-12" />
      )}
    </span>
  );
}

// ── expanded per-book breakdown for one day ──────────────────────────────
function DayBreakdown({
  day,
  onSaved,
}: {
  day: DailyAnalyticsDay;
  onSaved: (date: string, bookId: string, spend: number) => void;
}) {
  const niceDate = format(parseISO(day.date), "dd MMM yyyy");
  return (
    <div className="bg-gray-50/60 px-4 py-3">
      <p className="mb-2 text-[11px] font-semibold text-gray-400">
        Per-book breakdown · spend for {niceDate}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="text-left text-[10px] font-bold tracking-wide text-gray-400 uppercase">
              <th className="py-1.5 pr-3">Book</th>
              <th className="px-3 py-1.5 text-right">Units</th>
              <th className="px-3 py-1.5 text-right">Revenue</th>
              <th className="px-3 py-1.5 text-right">Meta Spend</th>
              <th className="px-3 py-1.5 text-right">ROAS</th>
              <th className="py-1.5 pl-3 text-right">Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {day.books.map((b) => {
              const roas = roasOf(b.revenue, b.meta_spend);
              const net = b.meta_spend == null ? null : b.revenue - b.meta_spend;
              return (
                <tr key={b.book_id} className="border-t border-gray-100">
                  <td className="py-2 pr-3">
                    <span className="line-clamp-1 font-medium text-gray-800">{b.book_name}</span>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600 tabular-nums">{b.units}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900 tabular-nums">{inr(b.revenue)}</td>
                  <td className="px-3 py-2 text-right">
                    <SpendInput date={day.date} bookId={b.book_id} value={b.meta_spend} onSaved={onSaved} />
                  </td>
                  <td className="px-3 py-2 text-right font-bold tabular-nums" style={{ color: roasColor(roas) }}>
                    {fmtRoas(roas)}
                  </td>
                  <td className="py-2 pl-3 text-right font-bold tabular-nums" style={{ color: net == null ? GRAY : profitColor(net) }}>
                    {net == null ? "—" : fmtNet(net)}
                  </td>
                </tr>
              );
            })}
            {/* Day total */}
            <tr className="border-t-2 border-gray-200 font-bold">
              <td className="py-2 pr-3 text-gray-700">Day Total</td>
              <td className="px-3 py-2 text-right tabular-nums">{day.total_units}</td>
              <td className="px-3 py-2 text-right tabular-nums">{inr(day.total_revenue)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{day.total_spend == null ? "—" : inr(day.total_spend)}</td>
              <td className="px-3 py-2 text-right tabular-nums" style={{ color: roasColor(roasOf(day.total_revenue, day.total_spend)) }}>
                {fmtRoas(roasOf(day.total_revenue, day.total_spend))}
              </td>
              <td className="py-2 pl-3 text-right tabular-nums" style={{ color: day.total_spend == null ? GRAY : profitColor(day.total_revenue - day.total_spend) }}>
                {day.total_spend == null ? "—" : fmtNet(day.total_revenue - day.total_spend)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────
export function DailyAnalyticsClient() {
  const qc = useQueryClient();
  const [to, setTo] = useState(istToday);
  const [from, setFrom] = useState(() => shiftDays(istToday(), -29));
  const [view, setView] = useState<"day" | "book">("day");
  const [expanded, setExpanded] = useState<string | null>(null);

  const queryKey = ["daily-analytics", from, to] as const;
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/admin/daily-analytics?from=${from}&to=${to}`);
      if (!res.ok) throw new Error("failed");
      return (await res.json()) as DailyAnalytics;
    },
  });

  // Optimistically merge a saved spend into the cached data so ROAS/profit/cards
  // recompute instantly without a refetch.
  const applySpend = (date: string, bookId: string, spend: number) => {
    qc.setQueryData<DailyAnalytics>(queryKey, (prev) => {
      if (!prev) return prev;
      const days = prev.days.map((d) => {
        if (d.date !== date) return d;
        const books = d.books.map((b) => (b.book_id === bookId ? { ...b, meta_spend: spend } : b));
        const total_spend = books.reduce<number | null>(
          (acc, b) => (b.meta_spend == null ? acc : (acc ?? 0) + b.meta_spend),
          null,
        );
        return { ...d, books, total_spend };
      });
      return { ...prev, days };
    });
  };

  const setPreset = (days: number) => {
    const t = istToday();
    setTo(t);
    setFrom(shiftDays(t, -(days - 1)));
  };
  const activePreset = useMemo(() => {
    if (to !== istToday()) return null;
    const span = PRESETS.find((p) => shiftDays(to, -(p.days - 1)) === from);
    return span?.days ?? null;
  }, [from, to]);

  // Totals across the whole range (reactive to spend edits).
  const totals = useMemo(() => {
    const days = data?.days ?? [];
    let revenue = 0;
    let units = 0;
    let spend = 0;
    let hasSpend = false;
    for (const d of days) {
      revenue += d.total_revenue;
      units += d.total_units;
      if (d.total_spend != null) {
        spend += d.total_spend;
        hasSpend = true;
      }
    }
    return { revenue, units, spend, hasSpend };
  }, [data]);

  // Per-book aggregation for the "By Book" view (reactive to spend edits).
  const byBook = useMemo(() => {
    const days = data?.days ?? [];
    const map = new Map<string, { name: string; units: number; revenue: number; spend: number; hasSpend: boolean }>();
    for (const b of data?.books ?? []) map.set(b.id, { name: b.title, units: 0, revenue: 0, spend: 0, hasSpend: false });
    for (const d of days) {
      for (const b of d.books) {
        const row = map.get(b.book_id) ?? { name: b.book_name, units: 0, revenue: 0, spend: 0, hasSpend: false };
        row.units += b.units;
        row.revenue += b.revenue;
        if (b.meta_spend != null) {
          row.spend += b.meta_spend;
          row.hasSpend = true;
        }
        map.set(b.book_id, row);
      }
    }
    return Array.from(map.entries())
      .map(([id, r]) => ({ id, ...r }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  const overallRoas = totals.hasSpend && totals.spend > 0 ? totals.revenue / totals.spend : null;
  const netProfit = totals.revenue - totals.spend;
  const hasAnySales = totals.revenue > 0 || totals.units > 0;

  const exportCsv = () => {
    if (!data) return;
    const header = ["Date", "Book", "Units", "Revenue (INR)", "Meta Spend (INR)", "ROAS", "Net Profit (INR)"];
    const rows: (string | number)[][] = [];
    for (const d of data.days) {
      rows.push([
        d.date,
        "DAY TOTAL",
        d.total_units,
        d.total_revenue,
        d.total_spend ?? "",
        roasOf(d.total_revenue, d.total_spend)?.toFixed(2) ?? "",
        d.total_spend == null ? "" : d.total_revenue - d.total_spend,
      ]);
      for (const b of d.books) {
        rows.push([
          d.date,
          b.book_name,
          b.units,
          b.revenue,
          b.meta_spend ?? "",
          roasOf(b.revenue, b.meta_spend)?.toFixed(2) ?? "",
          b.meta_spend == null ? "" : b.revenue - b.meta_spend,
        ]);
      }
    }
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-analytics-${from}_to_${to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {PRESETS.map((p) => (
              <button
                key={p.days}
                onClick={() => setPreset(p.days)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                  activePreset === p.days ? "bg-brand-teal text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => e.target.value && setFrom(e.target.value)}
              className="h-8 rounded-md border border-gray-200 px-2 text-xs focus:border-brand-teal focus:outline-none"
            />
            <span>→</span>
            <input
              type="date"
              value={to}
              min={from}
              max={istToday()}
              onChange={(e) => e.target.value && setTo(e.target.value)}
              className="h-8 rounded-md border border-gray-200 px-2 text-xs focus:border-brand-teal focus:outline-none"
            />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!data || data.days.length === 0} className="h-8 gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Total Revenue" value={inr(totals.revenue)} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Total Ad Spend" value={totals.hasSpend ? inr(totals.spend) : "—"} />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Overall ROAS"
          value={fmtRoas(overallRoas)}
          valueColor={roasColor(overallRoas)}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Net Profit"
          value={totals.hasSpend ? fmtNet(netProfit) : "—"}
          valueColor={totals.hasSpend ? profitColor(netProfit) : GRAY}
        />
      </div>

      {/* View toggle */}
      <div className="flex justify-center">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {([
            { key: "day", label: "By Day" },
            { key: "book", label: "By Book" },
          ] as const).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${
                view === v.key ? "bg-brand-teal text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / error */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}
      {isError && <p className="py-16 text-center text-sm text-red-500">Failed to load. Try again.</p>}

      {/* Empty state — still allow spend entry below */}
      {data && !hasAnySales && (
        <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-400">
          No sales data for this period.
        </p>
      )}

      {/* By Day */}
      {data && view === "day" && data.days.length > 0 && (
        <Card>
          <CardContent className="px-0 py-0">
            <p className="px-4 pt-3 pb-1 text-[11px] text-gray-400">
              Tap a day to expand its per-book rows and enter Meta ad spend.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-170 text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[11px] font-bold tracking-wide text-gray-400 uppercase">
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-3 py-2.5 text-right">Revenue</th>
                    <th className="px-3 py-2.5 text-right">Units</th>
                    <th className="px-3 py-2.5 text-right">Ad Spend</th>
                    <th className="px-3 py-2.5 text-right">ROAS</th>
                    <th className="px-3 py-2.5 text-right">Net Profit</th>
                    <th className="px-4 py-2.5 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {data.days.map((d) => {
                    const roas = roasOf(d.total_revenue, d.total_spend);
                    const open = expanded === d.date;
                    return (
                      <DayRow
                        key={d.date}
                        day={d}
                        roas={roas}
                        open={open}
                        onToggle={() => setExpanded(open ? null : d.date)}
                        onSaved={applySpend}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* By Book */}
      {data && view === "book" && byBook.length > 0 && (
        <Card>
          <CardContent className="px-0 py-0">
            <p className="px-4 pt-3 pb-1 text-[11px] text-gray-400">
              Summary only. To enter Meta ad spend, switch to <span className="font-bold text-brand-teal">By Day</span> and expand a date.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[11px] font-bold tracking-wide text-gray-400 uppercase">
                    <th className="px-4 py-2.5">Book</th>
                    <th className="px-3 py-2.5 text-right">Units</th>
                    <th className="px-3 py-2.5 text-right">Revenue</th>
                    <th className="px-3 py-2.5 text-right">Ad Spend</th>
                    <th className="px-3 py-2.5 text-right">Avg ROAS</th>
                    <th className="px-4 py-2.5 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {byBook.map((b) => {
                    const roas = b.hasSpend && b.spend > 0 ? b.revenue / b.spend : null;
                    const net = b.hasSpend ? b.revenue - b.spend : null;
                    return (
                      <tr key={b.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-2.5">
                          <span className="line-clamp-1 font-medium text-gray-800">{b.name}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-gray-600 tabular-nums">{b.units}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-gray-900 tabular-nums">{inr(b.revenue)}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600 tabular-nums">{b.hasSpend ? inr(b.spend) : "—"}</td>
                        <td className="px-3 py-2.5 text-right font-bold tabular-nums" style={{ color: roasColor(roas) }}>
                          {fmtRoas(roas)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold tabular-nums" style={{ color: net == null ? GRAY : profitColor(net) }}>
                          {net == null ? "—" : fmtNet(net)}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Grand total */}
                  <tr className="border-t-2 border-gray-200 font-bold">
                    <td className="px-4 py-2.5 text-gray-700">Total</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{totals.units}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{inr(totals.revenue)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{totals.hasSpend ? inr(totals.spend) : "—"}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: roasColor(overallRoas) }}>
                      {fmtRoas(overallRoas)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: totals.hasSpend ? profitColor(netProfit) : GRAY }}>
                      {totals.hasSpend ? fmtNet(netProfit) : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── one day row + inline expansion ───────────────────────────────────────
function DayRow({
  day,
  roas,
  open,
  onToggle,
  onSaved,
}: {
  day: DailyAnalyticsDay;
  roas: number | null;
  open: boolean;
  onToggle: () => void;
  onSaved: (date: string, bookId: string, spend: number) => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-gray-50 transition-colors hover:bg-brand-gold/5 ${open ? "bg-brand-gold/10" : ""}`}
      >
        <td className="px-4 py-2.5 font-medium text-gray-800">{format(parseISO(day.date), "dd MMM yyyy")}</td>
        <td className="px-3 py-2.5 text-right font-bold text-gray-900 tabular-nums">{inr(day.total_revenue)}</td>
        <td className="px-3 py-2.5 text-right text-gray-600 tabular-nums">{day.total_units}</td>
        <td className="px-3 py-2.5 text-right text-gray-600 tabular-nums">{day.total_spend == null ? "—" : inr(day.total_spend)}</td>
        <td className="px-3 py-2.5 text-right font-bold tabular-nums" style={{ color: roasColor(roas) }}>{fmtRoas(roas)}</td>
        <td className="px-3 py-2.5 text-right font-bold tabular-nums" style={{ color: day.total_spend == null ? GRAY : profitColor(day.total_revenue - day.total_spend) }}>
          {day.total_spend == null ? "—" : fmtNet(day.total_revenue - day.total_spend)}
        </td>
        <td className="px-4 py-2.5 text-right">
          <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[11px] font-bold text-brand-teal">
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {open ? "Close" : "Enter spend"}
          </span>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="p-0">
            <DayBreakdown day={day} onSaved={onSaved} />
          </td>
        </tr>
      )}
    </>
  );
}
