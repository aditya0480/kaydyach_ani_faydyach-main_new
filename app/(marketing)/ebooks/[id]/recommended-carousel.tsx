"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, CheckCircle2, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { SALE_CONFIG, getInflatedOriginalPrice } from "@/lib/sale-config";
import { SaleTimer, DiscountBadge } from "@/components/marketing/sale-timer";

interface EbookSummary {
    id: string;
    displayId: number | null;
    title: string;
    price: number;
    coverImage: string | null;
}

interface RecommendedCarouselProps {
    books: EbookSummary[];
}

export function RecommendedCarousel({ books }: RecommendedCarouselProps) {
    const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
        Autoplay({ delay: 3000, stopOnInteraction: false }),
    ]);

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="-ml-4 flex">
                {books.map((book) => (
                    <div className="min-w-0 flex-[0_0_85%] pl-4 sm:flex-[0_0_50%] md:flex-[0_0_40%] lg:flex-[0_0_25%]" key={book.id}>
                        <RecommendedBookCard book={book} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Recommended Book Card Component (Moved from page.tsx)
function RecommendedBookCard({ book }: { book: EbookSummary }) {
    const finalPrice = Number(book.price);
    const crossedPrice = getInflatedOriginalPrice(finalPrice);

    return (
        <Link
            href={`/ebooks/${book.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
            {/* Book Cover */}
            <div className="relative aspect-3/4 shrink-0 overflow-hidden bg-gray-100">
                {book.coverImage ? (
                    <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                        <BookOpen className="h-12 w-12" />
                    </div>
                )}

                {/* Discount Badge */}
                <DiscountBadge className="absolute top-2 right-2" />

                {/* Rating Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-amber-600 shadow-md backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-current" />
                    4.9
                </div>

                {/* Display ID Badge */}
                {book.displayId && (
                    <div className="absolute bottom-2 left-2 rounded-full border border-white/20 bg-brand-teal px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        #{book.displayId}
                    </div>
                )}
            </div>

            {/* Book Details */}
            <div className="flex flex-1 flex-col space-y-3 p-4">
                {/* Title */}
                <h3 className="line-clamp-2 min-h-10 text-sm leading-tight font-bold text-brand-teal transition-colors group-hover:text-brand-gold">
                    {book.title}
                </h3>

                {/* Flash Sale Timer */}
                {SALE_CONFIG.isActive && (
                    <div className="origin-left scale-90">
                        <SaleTimer />
                    </div>
                )}

                {/* Price */}
                <div className="mt-auto flex items-center gap-2">
                    <span className="text-xl font-bold text-green-600">
                        ₹{finalPrice}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                        ₹{crossedPrice}
                    </span>
                </div>

                {/* Buy Button */}
                <div
                    className="flex h-9 w-full items-center justify-center rounded-md bg-brand-teal text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-teal/90"
                >
                    Download Now / PDF डाऊनलोड करा
                </div>

                {/* Verified Badge */}
                <p className="flex items-center justify-center gap-1 pt-1 text-center text-[10px] text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    Verified (प्रमाणित)
                </p>
            </div>
        </Link>
    );
}
