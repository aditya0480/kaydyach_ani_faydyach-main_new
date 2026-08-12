"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { IndianRupee, ShoppingCart, TrendingUp, RefreshCcw, ArrowRight, BarChart as BarChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PremiumLoader } from "@/components/premium-loader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  graphData: { name: string; total: number }[];
  recentTransactions: {
    id: string;
    name: string;
    email: string;
    amount: number;
    status: string;
    date: string;
    items: string;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    const toastId = toast.loading("Updating dashboard data...");
    try {
      const res = await fetch("/api/admin/analytics", {
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache"
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        toast.success("Dashboard data updated", { id: toastId });
      } else {
        toast.error("Failed to update data", { id: toastId });
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
      toast.error("An error occurred while refreshing", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center p-8">
        <PremiumLoader
          marathiText="माहिती गोळा केली जात आहे..."
          englishText="Gathering Analytics"
        />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;

  return (
    <div className="animate-in fade-in mx-auto max-w-7xl space-y-4 duration-500 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2 md:pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0A2342] md:text-3xl">
            Overview
          </h1>
          <p className="mt-1 hidden text-xs text-muted-foreground md:block md:text-sm">
            Snapshot of your store performance and sales.
            <br />
            <span className="opacity-80">तुमच्या स्टोअरच्या प्रगतीचा आढावा.</span>
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" disabled={loading} className="h-8 gap-2 border-gray-200 shadow-sm transition-all hover:bg-gray-100 hover:text-[#0A2342] active:scale-[0.98] md:h-9">
          <RefreshCcw className={cn("h-3.5 w-3.5 md:h-4 md:w-4", loading && "animate-spin")} />
          <span className="hidden md:inline">{loading ? "Refreshing..." : "Refresh Data"}</span>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
        {/* Total Revenue - Spans 2 cols on mobile for emphasis */}
        <div className="group relative col-span-2 overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-green-50/30 shadow-sm lg:col-span-1">
          <div className="absolute top-0 right-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
            <IndianRupee className="h-16 w-16 text-green-600" />
          </div>
          <div className="flex flex-row items-center justify-between p-4 pb-1">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Total Revenue</h3>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
              <IndianRupee className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="p-4 pt-1">
            <div className="text-2xl font-bold text-[#0A2342] md:text-3xl">₹{data.totalRevenue.toLocaleString()}</div>
            <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground md:text-xs">
              <span className="text-green-600">Lifetime</span> earnings
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-blue-50/30 shadow-sm">
          <div className="flex flex-row items-center justify-between p-3 pb-1 md:p-4">
            <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Orders</h3>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <ShoppingCart className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="p-3 pt-1 md:p-4">
            <div className="text-xl font-bold text-[#0A2342] md:text-3xl">{data.totalOrders}</div>
            <p className="mt-1 truncate text-[10px] text-muted-foreground md:text-xs">
              Completed
            </p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-purple-50/30 shadow-sm">
          <div className="flex flex-row items-center justify-between p-3 pb-1 md:p-4">
            <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Conversion</h3>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="p-3 pt-1 md:p-4">
            <div className="text-xl font-bold text-[#0A2342] md:text-3xl">{data.conversionRate.toFixed(1)}%</div>
            <p className="mt-1 truncate text-[10px] text-muted-foreground md:text-xs">
              Success Rate
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-7">
        {/* Sales Chart */}
        <div className="col-span-7 rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-4">
          <div className="border-b border-gray-50 p-4 pb-2 md:p-6 md:pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#0A2342] md:text-lg">Sales Trend</h3>
                <p className="text-xs text-muted-foreground md:text-sm">Daily revenue (Last 30 days)</p>
              </div>
              <BarChartIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="p-2 md:p-0 md:pl-2">
            <div className="mt-4 h-62.5 w-full md:h-87.5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const parts = value.split("-");
                      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : value;
                    }}
                    minTickGap={30}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A2342",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                    cursor={{ fill: "#f3f4f6" }}
                    itemStyle={{ padding: 0 }}
                  />
                  <Bar dataKey="total" fill="#0A2342" radius={[4, 4, 0, 0]} barSize={20} activeBar={{ fill: "#FFD301" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-span-7 flex h-100 flex-col rounded-2xl border border-gray-100 bg-white shadow-sm md:h-auto lg:col-span-3">
          <div className="sticky top-0 z-10 flex flex-row items-center justify-between rounded-t-2xl border-b border-gray-100 bg-gray-50/30 p-4 py-3 backdrop-blur-sm">
            <div>
              <h3 className="text-sm font-semibold text-[#0A2342] md:text-base">Recent Orders</h3>
              <p className="hidden text-[10px] text-muted-foreground md:block md:text-xs">Latest transactions</p>
            </div>
            <Link href="/dashboard/orders" className="flex items-center text-xs text-blue-600 hover:underline">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="relative flex-1 overflow-hidden p-0">
            <div className="custom-scrollbar absolute inset-0 overflow-y-auto">
              {data.recentTransactions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <ShoppingCart className="h-5 w-5 text-gray-300" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">No orders yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="group flex cursor-default items-center justify-between p-3 transition-all hover:bg-gray-50">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A2342]/5 text-[10px] font-bold text-[#0A2342] transition-colors group-hover:bg-[#0A2342]/10">
                          {transaction.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="max-w-30 truncate text-xs font-semibold text-gray-900 md:max-w-35" title={transaction.items}>
                            {transaction.items}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="max-w-20 truncate text-[10px] text-muted-foreground">{transaction.name}</p>
                            <span className="text-[10px] text-gray-300">•</span>
                            <p className="text-[10px] text-gray-500">{new Date(transaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                      <div className="pl-2 text-right">
                        <div className="text-xs font-bold text-[#0A2342]">₹{transaction.amount}</div>
                        <Badge variant="outline" className="h-3.5 border-green-200 bg-green-50 px-1 py-0 text-[9px] font-bold tracking-[0.2em] text-green-700 uppercase">Paid</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
