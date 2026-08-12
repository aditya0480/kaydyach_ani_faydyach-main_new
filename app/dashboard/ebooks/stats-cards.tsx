"use client";

import { BookOpen, CheckCircle2, IndianRupee, ShoppingBag } from "lucide-react";

interface EbookStatsCardsProps {
    totalEbooks: number;
    activeEbooks: number;
    totalRevenue: number;
    totalSales: number;
}

export function EbookStatsCards({
    totalEbooks,
    activeEbooks,
    totalRevenue,
    totalSales
}: EbookStatsCardsProps) {
    const inactiveEbooks = totalEbooks - activeEbooks;

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {/* Total Ebooks */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-blue-50/50 shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-5 transition-opacity group-hover:opacity-10">
                    <BookOpen className="h-16 w-16 text-blue-600" />
                </div>
                <div className="flex flex-row items-center justify-between p-4 pb-1">
                    <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Total Library</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/50">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                </div>
                <div className="p-4 pt-1">
                    <div className="text-xl font-bold text-[#0A2342] md:text-2xl">{totalEbooks}</div>
                    <p className="mt-1 truncate text-[10px] font-medium text-muted-foreground md:text-xs">
                        Digital products
                    </p>
                </div>
            </div>

            {/* Active Ebooks */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-green-50/50 shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-5 transition-opacity group-hover:opacity-10">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
                <div className="flex flex-row items-center justify-between p-4 pb-1">
                    <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Active Selling</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100/50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                </div>
                <div className="p-4 pt-1">
                    <div className="text-xl font-bold text-[#0A2342] md:text-2xl">{activeEbooks}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground md:text-xs">
                        <span className="font-bold text-orange-600">{inactiveEbooks}</span> disabled
                    </div>
                </div>
            </div>

            {/* Total Revenue */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-amber-50/50 shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-5 transition-opacity group-hover:opacity-10">
                    <IndianRupee className="h-16 w-16 text-amber-600" />
                </div>
                <div className="flex flex-row items-center justify-between p-4 pb-1">
                    <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Est. Revenue</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/50">
                        <IndianRupee className="h-4 w-4 text-amber-600" />
                    </div>
                </div>
                <div className="p-4 pt-1">
                    <div className="text-xl font-bold text-[#0A2342] md:text-2xl">₹{totalRevenue.toLocaleString()}</div>
                    <p className="mt-1 truncate text-[10px] font-medium text-muted-foreground md:text-xs">
                        Lifetime earnings
                    </p>
                </div>
            </div>

            {/* Total Sales */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-linear-to-br from-white to-purple-50/50 shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-5 transition-opacity group-hover:opacity-10">
                    <ShoppingBag className="h-16 w-16 text-purple-600" />
                </div>
                <div className="flex flex-row items-center justify-between p-4 pb-1">
                    <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">Total Sales</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100/50">
                        <ShoppingBag className="h-4 w-4 text-purple-600" />
                    </div>
                </div>
                <div className="p-4 pt-1">
                    <div className="text-xl font-bold text-[#0A2342] md:text-2xl">{totalSales}</div>
                    <p className="mt-1 truncate text-[10px] font-medium text-muted-foreground md:text-xs">
                        Copies sold
                    </p>
                </div>
            </div>
        </div>
    );
}
