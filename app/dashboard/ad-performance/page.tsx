import Link from "next/link";
import { format } from "date-fns";
import { getAdPerformance, getEbooks } from "@/lib/data-access";
import { getNowIST } from "@/lib/date-utils";
import { AdPerformanceClient } from "./ad-performance-client";
import { DailyAnalyticsClient } from "./daily-analytics-client";

export const dynamic = "force-dynamic";

const RANGES = [
    { days: 7, label: "7 days" },
    { days: 30, label: "30 days" },
    { days: 90, label: "90 days" },
];

const TABS = [
    { view: "blended", label: "Blended" },
    { view: "bookwise", label: "Per-Book Daily" },
];

export default async function AdPerformancePage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string; view?: string }>;
}) {
    const { range, view } = await searchParams;
    const rangeDays = [7, 30, 90].includes(Number(range)) ? Number(range) : 30;
    const activeView = view === "bookwise" ? "bookwise" : "blended";
    const todayStr = format(getNowIST(), "yyyy-MM-dd");

    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-black text-gray-900">Ad Performance</h1>
                    <p className="text-sm text-gray-400">
                        {activeView === "bookwise"
                            ? "Per-book spend · ROAS · net profit · IST"
                            : "Daily spend · blended ROAS · IST"}
                    </p>
                </div>
                {activeView === "blended" && (
                    <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
                        {RANGES.map((r) => (
                            <Link
                                key={r.days}
                                href={`/dashboard/ad-performance?range=${r.days}`}
                                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                                    rangeDays === r.days
                                        ? "bg-[#0A2342] text-white"
                                        : "text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                {r.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Tab nav */}
            <div className="mb-5 flex gap-1 border-b border-gray-200">
                {TABS.map((t) => (
                    <Link
                        key={t.view}
                        href={`/dashboard/ad-performance?view=${t.view}`}
                        className={`-mb-px border-b-2 px-4 py-2 text-sm font-bold transition-colors ${
                            activeView === t.view
                                ? "border-[#0A2342] text-[#0A2342]"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            {activeView === "blended" ? (
                <AdPerformanceClient
                    data={await getAdPerformance(rangeDays)}
                    todayStr={todayStr}
                    books={(await getEbooks()).map((b) => ({ id: b.id, title: b.title }))}
                />
            ) : (
                <DailyAnalyticsClient />
            )}
        </div>
    );
}
