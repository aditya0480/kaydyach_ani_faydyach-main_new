"use client";

import { AlertTriangle, MousePointerClick, LogOut, Wifi, CreditCard, HelpCircle } from "lucide-react";

export type DropCategory =
    | "never_started"
    | "modal_dismissed"
    | "abandoned_redirect"
    | "gateway_error"
    | "client_error"
    | "unknown";

export interface DropBucket {
    category: DropCategory;
    count: number;
    label: string;
    description: string;
    errorSamples?: string[];
}

interface DropAnalysisProps {
    buckets: DropBucket[];
    totalPending: number;
}

const ICONS: Record<DropCategory, React.ReactNode> = {
    never_started: <HelpCircle className="h-4 w-4" />,
    modal_dismissed: <LogOut className="h-4 w-4" />,
    abandoned_redirect: <Wifi className="h-4 w-4" />,
    gateway_error: <AlertTriangle className="h-4 w-4" />,
    client_error: <CreditCard className="h-4 w-4" />,
    unknown: <MousePointerClick className="h-4 w-4" />,
};

const COLORS: Record<DropCategory, string> = {
    never_started: "bg-gray-50 text-gray-600 border-gray-200",
    modal_dismissed: "bg-orange-50 text-orange-700 border-orange-200",
    abandoned_redirect: "bg-yellow-50 text-yellow-700 border-yellow-200",
    gateway_error: "bg-red-50 text-red-700 border-red-200",
    client_error: "bg-red-50 text-red-700 border-red-200",
    unknown: "bg-purple-50 text-purple-700 border-purple-200",
};

export function DropAnalysis({ buckets, totalPending }: DropAnalysisProps) {
    if (totalPending === 0) return null;

    const nonZero = buckets.filter((b) => b.count > 0);
    if (nonZero.length === 0) return null;

    return (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-4">
            <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-bold text-orange-800">
                    Drop-off Analysis
                </h3>
                <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                    {totalPending} pending
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {nonZero.map((bucket) => (
                    <div
                        key={bucket.category}
                        className={`flex flex-col gap-1 rounded-xl border p-3 ${COLORS[bucket.category]}`}
                        title={bucket.description}
                    >
                        <div className="flex items-center gap-1.5">
                            {ICONS[bucket.category]}
                            <span className="text-lg font-bold">{bucket.count}</span>
                        </div>
                        <p className="text-[11px] font-semibold leading-tight">{bucket.label}</p>
                        {bucket.errorSamples && bucket.errorSamples.length > 0 && (
                            <p className="mt-0.5 truncate text-[10px] opacity-70">
                                {bucket.errorSamples[0]}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <p className="mt-2 text-[10px] text-orange-600/70">
                Based on OrderLog events. &quot;Never started&quot; = order created but no modal opened.
            </p>
        </div>
    );
}
