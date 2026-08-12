"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Loader2,
  Users,
  ShoppingCart,
  MousePointerClick,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";

// ... (existing code)

import { cn } from "@/lib/utils";

// --- Types ---
type FunnelData = {
  step: string;
  count: number;
  dropOff: number;
}[];

type DeviceStats = {
  name: string;
  value: number;
  color: string;
}[];

// --- API Fetcher ---
async function fetchAnalytics(days: number) {
  const res = await fetch(`/api/analytics/stats?days=${days}`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState(7);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["analytics", period],
    queryFn: ({ queryKey }) => fetchAnalytics(queryKey[1] as number),

    // refetchInterval: 60000, // Removed to save DB Compute Units
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading analytics. Please try again.
      </div>
    );
  }

  const { funnel, daily, devices, summary, locations } = data || {};

  // Calculate Conversion Rate
  const conversionRate = summary?.visitors
    ? ((summary.sales / summary.visitors) * 100).toFixed(2)
    : 0;

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500">
            Track user journey, drop-offs, and conversions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCcw
              className={cn("h-4 w-4", isRefetching && "animate-spin")}
            />
          </Button>
          <Tabs
            defaultValue="7"
            onValueChange={(v) => setPeriod(parseInt(v))}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="7">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30">Last 30 Days</TabsTrigger>
              <TabsTrigger value="90">Last 3 Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Visitors"
          value={summary?.visitors || 0}
          icon={Users}
          trend="+12%" // Ideally dynamic but hardcoded for now
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatsCard
          title="Initiated Checkout"
          value={summary?.checkouts || 0}
          icon={ShoppingCart}
          trend={`${summary?.visitors ? Math.round((summary.checkouts / summary.visitors) * 100) : 0}% conv.`}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatsCard
          title="Total Sales"
          value={summary?.sales || 0}
          icon={TrendingUp}
          trend="Revenue"
          color="text-green-600"
          bgColor="bg-green-50"
          isCurrency
        />
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={MousePointerClick}
          trend="Visitor to Sale"
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-9">
        {/* Main Conversion Funnel */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Where do users drop off?</CardDescription>
          </CardHeader>
          <CardContent className="h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnel}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barSize={30}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="step"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#0D9488"
                  radius={[0, 4, 4, 0]}
                  label={{ position: "right", fill: "#666" }}
                >
                  {funnel?.map((_entry: FunnelData[number], index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === funnel.length - 1 ? "#22c55e" : "#0D9488"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card className="col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <CardDescription>Where your visitors are.</CardDescription>
          </CardHeader>
          <CardContent className="h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={locations}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                barSize={20}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                  <Cell fill="#6366f1" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Mobile vs Desktop utility.</CardDescription>
          </CardHeader>
          <CardContent className="h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={devices}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {devices?.map((entry: DeviceStats[number], index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Traffic & Sales Trend</CardTitle>
          <CardDescription>
            Daily performance over the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-87.5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={daily}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVisitors)"
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#22c55e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: string;
  color: string;
  bgColor: string;
  isCurrency?: boolean;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  bgColor,
  isCurrency,
}: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-black text-gray-900">
            {isCurrency ? "₹" : ""}
            {value?.toLocaleString()}
          </h3>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            bgColor,
          )}
        >
          <Icon className={cn("h-6 w-6", color)} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-500">
        <span className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </span>
        <span className="opacity-50">vs previous period</span>
      </div>
    </div>
  );
}
