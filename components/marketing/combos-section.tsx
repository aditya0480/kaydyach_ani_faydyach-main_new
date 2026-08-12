"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { EbookCard } from "./ebook-card";

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

interface CombosSectionProps {
    combos: Ebook[];
}

export function CombosSection({ combos }: CombosSectionProps) {


    // Duplicate items if there are few, to ensure smooth infinite loop
    const shouldDuplicate = combos.length > 0 && combos.length < 8;
    const carouselItems = shouldDuplicate
        ? [...combos, ...combos, ...combos] // Triple it to be safe for wide screens
        : combos;

    const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" }, [
        Autoplay({ delay: 3500, stopOnInteraction: false })
    ]);

    if (combos.length === 0) return null;

    return (
        <section id="combos" className="overflow-hidden bg-brand-teal/5 py-8 md:py-16">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-8 space-y-3 text-center">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-gold/10 px-3 py-1 text-[10px] font-bold tracking-wider text-brand-gold uppercase">
                        Special Packages
                    </div>
                    <h2 className="relative inline-block text-xl font-extrabold text-brand-teal md:text-4xl">
                        कायदेशीर कॉम्बो पॅक्स (Combos)
                    </h2>
                    <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
                        एकापेक्षा जास्त पुस्तकांचे संच आता आकर्षक सवलतीत उपलब्ध. संपूर्ण माहिती एकाच ठिकाणी.
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
                                        <EbookCard ebook={ebook} className="h-full shadow-md" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Button asChild variant="outline" size="lg" className="rounded-full border-2 border-brand-teal px-8 text-base font-bold text-brand-teal transition-colors hover:bg-brand-teal hover:text-white">
                        <Link href="/combos">सर्व कॉम्बो पॅक्स पहा <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
