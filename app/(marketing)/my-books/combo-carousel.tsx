"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Star, Zap, ChevronRight, Loader2 } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { getInflatedOriginalPrice } from "@/lib/sale-config";

interface Ebook {
    id: string;
    displayId: number | null;
    title: string;
    price: string | number;
    coverImage: string | null;
}

export function ComboCarousel() {
    const [books, setBooks] = useState<Ebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
        Autoplay({ delay: 4000, stopOnInteraction: false }),
    ]);

    useEffect(() => {
        async function fetchCombos() {
            try {
                const res = await fetch("/api/combos");
                if (res.ok) {
                    const data = await res.json();
                    setBooks(data);
                }
            } catch (error) {
                console.error("Failed to fetch combos:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCombos();
    }, []);

    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-brand-teal opacity-50" />
            </div>
        );
    }

    if (books.length === 0) return null;

    return (
        <section className="mt-12 mb-8">
            <div className="mb-6 flex items-center justify-between px-2">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-black text-brand-teal">
                        <Zap className="h-5 w-5 fill-brand-gold text-brand-gold" />
                        Best Value Combos
                    </h2>
                    <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">कायदेशीर कॉम्बो पॅक्स</p>
                </div>
                <Link href="/combos" className="flex items-center gap-1 text-xs font-bold text-brand-teal hover:underline">
                    View All <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
                <div className="-ml-3 flex">
                    {books.map((book) => (
                        <div className="min-w-0 flex-[0_0_80%] pl-3 sm:flex-[0_0_45%] md:flex-[0_0_33%]" key={book.id}>
                            <ComboCard book={book} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ComboCard({ book }: { book: Ebook }) {
    const finalPrice = typeof book.price === 'string' ? parseFloat(book.price) : book.price;
    const crossedPrice = getInflatedOriginalPrice(finalPrice);

    return (
        <Link
            href={`/ebooks/${book.id}`}
            className="group relative block overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all active:scale-[0.98]"
        >
            <div className="flex gap-3">
                {/* Compact Cover */}
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50 shadow-inner">
                    {book.coverImage ? (
                        <Image
                            src={book.coverImage}
                            alt={book.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-200">
                            <BookOpen className="h-6 w-6" />
                        </div>
                    )}
                    <div className="absolute top-0 right-0 p-1">
                         <div className="rounded-full bg-brand-gold p-0.5 text-[8px] font-black text-brand-teal shadow-sm">SALE</div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                    <div>
                        <h3 className="line-clamp-2 text-xs leading-tight font-black text-gray-900 group-hover:text-brand-teal">
                            {book.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-600">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            4.9 (प्रमाणित)
                        </div>
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-black text-green-600">₹{finalPrice}</span>
                        <span className="text-[10px] font-bold text-gray-400 line-through">₹{crossedPrice}</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-3 flex items-center justify-center rounded-xl bg-brand-teal/5 py-2 transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <span className="text-[10px] font-extrabold text-brand-teal group-hover:text-white">Check Details / अधिक माहिती</span>
            </div>
        </Link>
    );
}
