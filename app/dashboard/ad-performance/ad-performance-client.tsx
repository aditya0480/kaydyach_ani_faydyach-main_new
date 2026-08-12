"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianRupee, TrendingUp, TrendingDown, Target, Wallet, Sparkles, Loader2, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import type { AdPerformance } from "@/lib/data-access";

const GOLD = "#C79A3E";
const TEAL = "#0A2342";
const RED = "#dc2626";

function Delta({ current, previous, invert = false }: { current: number; previous: number; invert?: boolean }) {
  if (previous <= 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const good = invert ? pct <= 0 : pct >= 0;
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${good ? "text-green-600" : "text-red-500"}`}>
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

export function AdPerformanceClient({
  data,
  todayStr,
  books = [],
}: {
  data: AdPerformance;
  todayStr: string;
  books?: { id: string; title: string }[];
}) {
  const { summary, daily, rangeDays } = data;
  const router = useRouter();
  const [insights, setInsights] = useState<string | null>(null);
  const [date, setDate] = useState(todayStr);
  const [platform, setPlatform] = useState("META");
  const [bookId, setBookId] = useState(""); // "" = account-level (all books)
  const [amount, setAmount] = useState("");

  const saveSpend = useMutation({
    mutationFn: async () => {
      // A specific book → per-book Meta spend (ebook_ad_spend). Otherwise the
      // account-level blended entry (one row per platform per day).
      const res = bookId
        ? await fetch("/api/admin/ebook-ad-spend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, book_id: bookId, meta_spend: amount }),
          })
        : await fetch("/api/admin/ad-spend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, platform, amount }),
          });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { toast.success("Spend saved"); setAmount(""); router.refresh(); },
    onError: (e) => toast.error(e instanceof Error && e.message ? e.message : "Could not save spend"),
  });

  const insightMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/ad-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rangeDays, summary, daily }),
      });
      if (!res.ok) throw new Error("failed");
      return (await res.json()) as { insights: string };
    },
    onSuccess: (d) => setInsights(d.insights),
    onError: () => toast.error("Could not generate insights. Try again."),
  });

  const roasColor = summary.roas >= 1 ? "text-green-600" : "text-red-500";

  return (
    <div className="space-y-5">
      {/* Spend entry */}
      <Card className="border-brand-gold/30">
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Plus className="h-4 w-4 text-brand-gold" /> Log ad spend</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-gray-400">Date (IST)</label>
              <Input type="date" value={date} max={todayStr} onChange={(e) => setDate(e.target.value)} className="h-9 w-40" />
            </div>
            {books.length > 0 && (
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-gray-400">Book</label>
                <select value={bookId} onChange={(e) => setBookId(e.target.value)} className="h-9 max-w-56 rounded-md border border-gray-200 bg-white px-2 text-sm">
                  <option value="">All books (account-level)</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-gray-400">Platform</label>
              <select value={bookId ? "META" : platform} onChange={(e) => setPlatform(e.target.value)} disabled={!!bookId} className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm disabled:bg-gray-50 disabled:text-gray-400">
                <option value="META">Meta</option>
                <option value="GOOGLE">Google</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-gray-400">Spend (₹)</label>
              <Input type="number" inputMode="decimal" placeholder="e.g. 1500" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-9 w-32" />
            </div>
            <Button onClick={() => saveSpend.mutate()} disabled={saveSpend.isPending || !amount} className="h-9 bg-brand-teal text-white hover:bg-brand-teal/90">
              {saveSpend.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            {bookId
              ? "Per-book Meta spend for the selected day — saving the same day/book updates it. View it under the Per-Book Daily tab."
              : "Account-level: one entry per platform per day — saving the same day/platform updates it."}
          </p>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard icon={<Wallet className="h-5 w-5" />} label={`Spend · ${rangeDays}d`} value={`₹${summary.spend.toLocaleString("en-IN")}`}>
          <Delta current={summary.spend} previous={summary.prevSpend} />
        </StatCard>
        <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Revenue" value={`₹${summary.revenue.toLocaleString("en-IN")}`}>
          <Delta current={summary.revenue} previous={summary.prevRevenue} />
        </StatCard>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-teal/8 text-brand-teal"><Target className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400">ROAS (blended)</p>
              <p className={`flex items-center gap-1.5 text-lg font-black ${roasColor}`}>{summary.roas}x <Delta current={summary.roas} previous={summary.prevRoas} /></p>
            </div>
          </CardContent>
        </Card>
        <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Net (rev − spend)" value={`₹${summary.net.toLocaleString("en-IN")}`} />
        <StatCard icon={<Target className="h-5 w-5" />} label="CAC / order" value={`₹${summary.cac.toLocaleString("en-IN")}`} />
      </div>

      {/* Spend vs revenue + ROAS */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Spend vs revenue · ROAS</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={daily} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), "dd MMM")} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={20} />
              <YAxis yAxisId="money" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
              <YAxis yAxisId="roas" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                labelFormatter={(d) => format(parseISO(String(d)), "dd MMM yyyy")}
                formatter={(v?: number, name?: string) => {
                  if (name === "ROAS") return [v == null ? "—" : `${v}x`, "ROAS"];
                  return [`₹${(v ?? 0).toLocaleString("en-IN")}`, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="money" dataKey="spend" name="Spend" fill={GOLD} radius={[3, 3, 0, 0]} maxBarSize={22} />
              <Bar yAxisId="money" dataKey="revenue" name="Revenue" fill={TEAL} radius={[3, 3, 0, 0]} maxBarSize={22} />
              <Line yAxisId="roas" type="monotone" dataKey="roas" name="ROAS" stroke={RED} strokeWidth={2} dot={false} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Daily breakdown</CardTitle></CardHeader>
        <CardContent className="px-0">
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100 text-left text-[11px] font-bold tracking-wide text-gray-400 uppercase">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2 text-right">Spend</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                  <th className="px-4 py-2 text-right">ROAS</th>
                  <th className="px-4 py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {[...daily].reverse().map((d) => (
                  <tr key={d.date} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-2 text-gray-600">{format(parseISO(d.date), "dd MMM")}</td>
                    <td className="px-4 py-2 text-right text-gray-700">₹{d.spend.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">₹{d.revenue.toLocaleString("en-IN")}</td>
                    <td className={`px-4 py-2 text-right font-bold ${d.roas == null ? "text-gray-300" : d.roas >= 1 ? "text-green-600" : "text-red-500"}`}>{d.roas == null ? "—" : `${d.roas}x`}</td>
                    <td className={`px-4 py-2 text-right ${d.net >= 0 ? "text-gray-700" : "text-red-500"}`}>₹{d.net.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI insights */}
      <Card className="border-brand-gold/30">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4 text-brand-gold" /> AI insights</CardTitle>
          <Button size="sm" disabled={insightMutation.isPending || summary.spend === 0} onClick={() => insightMutation.mutate()} className="h-8 bg-brand-teal text-white hover:bg-brand-teal/90">
            {insightMutation.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing…</> : "Generate"}
          </Button>
        </CardHeader>
        <CardContent>
          {insights ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{insights}</div>
          ) : (
            <p className="text-sm text-gray-400">Generate an AI read of spend vs ROAS — what to scale, cut, or investigate. {summary.spend === 0 && "Log some spend first."}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
