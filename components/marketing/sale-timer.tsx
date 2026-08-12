"use client";

import { useEffect, useState } from "react";
import { Zap, Flame } from "lucide-react";
import { SALE_CONFIG } from "@/lib/sale-config";
import { cn } from "@/lib/utils";

export function SaleTimer({ className }: { className?: string }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted || !SALE_CONFIG.isActive) return null;

    // Always Urgent styling
    const isUrgent = true;

    return (
        <div className={cn(
            "inline-flex items-center gap-2.5 rounded-xl border px-3 py-1.5 transition-all duration-500",
            isUrgent
                ? "animate-pulse border-red-500/20 bg-red-500/10 text-red-600"
                : "border-orange-500/20 bg-orange-500/5 text-orange-600",
            className
        )}>
            <div className="flex items-center gap-1.5">
                {isUrgent ? (
                    <Flame className="h-3.5 w-3.5 fill-red-500" />
                ) : (
                    <Zap className="h-3.5 w-3.5 fill-orange-500" />
                )}
                <span className="text-[10px] font-black tracking-tight uppercase">
                    {SALE_CONFIG.badgeLabel}
                </span>
            </div>
        </div>
    );
}

export function DiscountBadge({ className }: { className?: string }) {
    if (!SALE_CONFIG.isActive) return null;
    return (
        <div className={cn(
            "flex items-center gap-1 rounded-lg bg-linear-to-r from-red-600 to-orange-600 px-2.5 py-1 text-[10px] font-black tracking-wider text-white uppercase shadow-lg shadow-red-500/20",
            className
        )}>
            {SALE_CONFIG.discountPercent}% सवलत
        </div>
    );
}
