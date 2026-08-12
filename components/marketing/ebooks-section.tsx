"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface Ebook {
    id: string;
    displayId: number;
    title: string;
    description: string;
    price: string | number;
    coverImage: string | null;
    isCombo?: boolean;
    pages?: number | null;
}

interface EbooksSectionProps {
    ebooks: Ebook[];
}

import { EbookCard } from "./ebook-card";

export function EbooksSection({ ebooks }: EbooksSectionProps) {
    // Duplicate items if there are few, to ensure smooth infinite loop
    const shouldDuplicate = ebooks.length > 0 && ebooks.length < 8;
    const carouselItems = shouldDuplicate
        ? [...ebooks, ...ebooks, ...ebooks] // Triple it to be safe for wide screens
        : ebooks;

    const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" }, [
        Autoplay({ delay: 3000, stopOnInteraction: false })
    ]);

    return (
        <section id="ebooks" className="overflow-hidden bg-gray-50/50 py-8 md:py-16">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-8 space-y-3 text-center">
                    <h2 className="relative inline-block text-xl font-extrabold text-brand-teal md:text-4xl">
                        सर्वाधिक विक्री होणारी पुस्तके
                    </h2>
                    <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
                        तुमच्या कायदेशीर गरजांसाठी खास निवडलेली आणि तज्ञांनी लिहिलेली पुस्तके.
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative mx-auto max-w-6xl">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="-ml-4 flex touch-pan-y">
                            {carouselItems.map((ebook, index) => {
                                // Use index in key to allow duplicates
                                const uniqueKey = `${ebook.id}-${index}`;
                                return (
                                    <div key={uniqueKey} className="min-w-0 flex-[0_0_75%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_25%]">
                                        <EbookCard ebook={ebook} className="h-full" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Button asChild variant="outline" size="lg" className="rounded-full border-2 border-brand-teal px-8 text-base font-bold text-brand-teal transition-colors hover:bg-brand-teal hover:text-white">
                        <Link href="/ebooks">सर्व पुस्तके पहा <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
