"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface EbookCardProps {
    ebook: {
        id: string;
        displayId?: number;
        title: string;
        description: string;
        price: string | number;
        coverImage: string | null;
        isCombo?: boolean;
        pages?: number | null;
    };
    searchQuery?: string;
    className?: string;
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
}

// Component to highlight search terms
function HighlightText({ text, query }: { text: string; query?: string }) {
    if (!query) return <>{text}</>;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark key={i} className="rounded-[2px] bg-brand-gold/40 px-0.5 font-bold text-brand-teal">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}

import { SALE_CONFIG, getInflatedOriginalPrice } from "@/lib/sale-config";
import { SaleTimer, DiscountBadge } from "@/components/marketing/sale-timer";

export function EbookCard({ ebook, searchQuery, className }: EbookCardProps) {
    const isSaleActive = SALE_CONFIG.isActive;

    // Calculate display prices
    // With reverse logic:
    // finalPrice = DB Price (which IS the sale price)
    // crossedPrice = Inflated Price (calculated from DB Price)
    const finalPrice = Number(ebook.price); // DB price is the sale price
    const crossedPrice = getInflatedOriginalPrice(finalPrice);

    // Calculate percentage for display if not active (fallback)
    // If active, we use the config percent. If not, we use the fake 1.5x calc.


    const [isLoading, setIsLoading] = useState(false);

    return (
        <Link
            href={`/ebooks/${ebook.id}`}
            onClick={() => setIsLoading(true)}
            className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg ${className}`}
        >
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
                        <span className="animate-pulse text-sm font-medium text-brand-teal">Loading...</span>
                    </div>
                </div>
            )}

            {/* Image Container */}
            <div className="relative aspect-3/4 w-full overflow-hidden bg-brand-teal/5">
                {ebook.coverImage ? (
                    <Image
                        src={ebook.coverImage}
                        alt={ebook.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-brand-teal/5 p-4 text-center text-brand-teal/40">
                        <div className="mb-2 text-4xl">📚</div>
                        <span className="text-sm font-medium">No Cover</span>
                    </div>
                )}

                {/* ID Cross Badge */}
                {ebook.displayId && (
                    <div className="absolute top-0 left-0 z-20 rounded-br-lg border-r border-b border-white/20 bg-brand-teal px-2 py-1 text-[11px] font-black tracking-tighter text-white uppercase shadow-md">
                        <HighlightText text={`${ebook.displayId}`} query={searchQuery} />
                    </div>
                )}

                {/* Badges Container (for others) */}
                <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1.5">
                    {/* Discount Badge */}
                    <DiscountBadge />

                    {/* Combo Badge */}
                    {ebook.isCombo && (
                        <div className="animate-pulse rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 px-2.5 py-1 text-[10px] font-black tracking-wider text-white uppercase shadow-lg shadow-purple-500/20">
                            Combo Pack
                        </div>
                    )}
                </div>
                {/* Pages Badge */}
                {ebook.pages && ebook.pages > 0 && (
                    <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        {ebook.pages} Pages
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="flex flex-1 flex-col p-3">
                {/* Title */}
                <div className="mb-1 min-h-11">
                    <h3 className="line-clamp-2 text-[15px] leading-tight font-bold text-gray-900 transition-colors group-hover:text-brand-teal">
                        <HighlightText text={ebook.title} query={searchQuery} />
                    </h3>
                </div>

                {/* Description */}
                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                    <HighlightText text={stripHtml(ebook.description)} query={searchQuery} />
                </p>

                {/* Flash Sale Timer (Visible only if active) */}
                {isSaleActive && (
                    <div className="mb-3">
                        <SaleTimer />
                    </div>
                )}

                {/* Price Section */}
                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                    <div className="flex flex-col">
                        <span className="mb-1 text-xs leading-none font-bold text-gray-400 line-through decoration-red-400/50">
                            ₹{crossedPrice}
                        </span>
                        <div className={`flex items-center gap-0.5 ${isSaleActive ? 'text-red-600' : 'text-green-600'} text-xl leading-none font-extrabold`}>
                            <span className="text-sm">₹</span>
                            {finalPrice}
                        </div>
                    </div>
                    <div className="flex h-auto min-h-8 max-w-[60%] items-center justify-center rounded-lg bg-brand-teal px-3 py-1 text-center text-[11px] leading-tight font-bold text-white shadow-sm transition-colors group-hover:bg-brand-teal/90">
                        Download / PDF डाऊनलोड करा
                    </div>
                </div>
            </div>
        </Link>
    );
}
