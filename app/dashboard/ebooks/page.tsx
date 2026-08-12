import { Button } from "@/components/ui/button";
import { prisma_db } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import { EbooksClient } from "./ebooks-client";
import { EbookStatsCards } from "./stats-cards";

export default async function EbooksPage() {
    const ebooksData = await prisma_db.ebook.findMany({
        select: {
            id: true,
            displayId: true,
            title: true,
            description: true,
            price: true,
            coverImage: true,
            isEnabled: true,
            createdAt: true,
            _count: { select: { orderItems: true } },
            includedIn: {
                select: {
                    combo: {
                        select: {
                            _count: { select: { orderItems: true } }
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    // 1. Calculate Global Stats from RAW data (to avoid double counting revenue/sales)
    const totalEbooks = ebooksData.length;
    const activeEbooks = ebooksData.filter(e => e.isEnabled).length;
    const totalSales = ebooksData.reduce((acc, curr) => acc + curr._count.orderItems, 0);
    const totalRevenue = ebooksData.reduce((acc, curr) => acc + (Number(curr.price) * curr._count.orderItems), 0);

    // 2. Adjust Individual Ebook Counts for Display
    // Included items should show: Direct Sales + Sales of any Combo containing them
    const enrichedEbooks = ebooksData.map(ebook => {
        const directSales = ebook._count.orderItems;
        const comboSales = ebook.includedIn.reduce((acc, ci) => acc + ci.combo._count.orderItems, 0);

        return {
            ...ebook,
            _count: {
                orderItems: directSales + comboSales
            }
        };
    });

    return (
        <div className="mx-auto max-w-7xl space-y-4">
            {/* Header Section */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0A2342]">
                        Ebooks Library
                    </h1>
                    <p className="hidden text-sm text-muted-foreground sm:block">
                        Manage digital products and availability.
                    </p>
                </div>
                <Button asChild className="h-9 bg-[#0A2342] px-4 text-sm font-medium shadow-sm transition-all hover:-translate-y-px hover:bg-[#0A2342]/90">
                    <Link href="/dashboard/ebooks/new">
                        <Plus className="mr-2 h-4 w-4" /> Add New Ebook
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <EbookStatsCards
                totalEbooks={totalEbooks}
                activeEbooks={activeEbooks}
                totalRevenue={totalRevenue}
                totalSales={totalSales}
            />

            {/* Ebooks List (Client Component) */}
            <EbooksClient ebooks={enrichedEbooks} />
        </div>
    );
}
