"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from "next/image";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EbookGalleryProps {
    coverImage: string | null;
    sampleImages: string[];
    title: string;
}

export function EbookGallery({ coverImage, sampleImages, title }: EbookGalleryProps) {
    const images = [coverImage, ...sampleImages].filter(Boolean) as string[];
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const [emblaMainRef, emblaMainApi] = useEmblaCarousel(
        { loop: true },
        [Autoplay({ delay: 3000, stopOnInteraction: true })]
    );





    const onSelect = useCallback(() => {
        if (!emblaMainApi) return;
        setSelectedIndex(emblaMainApi.selectedScrollSnap());
    }, [emblaMainApi, setSelectedIndex]);

    useEffect(() => {
        if (!emblaMainApi) return;
        onSelect();
        emblaMainApi.on('select', onSelect);
        emblaMainApi.on('reInit', onSelect);
    }, [emblaMainApi, onSelect]);

    const scrollPrev = useCallback(() => emblaMainApi?.scrollPrev(), [emblaMainApi]);
    const scrollNext = useCallback(() => emblaMainApi?.scrollNext(), [emblaMainApi]);

    if (images.length === 0) return null;

    if (images.length === 1) {
        return (
            <div className="group relative aspect-3/4 overflow-hidden rounded-2xl border-4 border-white shadow-2xl ring-1 ring-gray-100">
                <Image
                    src={images[0]}
                    alt={title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Carousel */}
            <div className="group relative">
                <div
                    className="relative overflow-hidden rounded-2xl border-4 border-white bg-gray-50 shadow-2xl ring-1 ring-gray-100"
                    ref={emblaMainRef}
                    style={{ aspectRatio: '3 / 4', width: '100%', overflow: 'hidden' }}
                >
                    <div
                        className="flex h-full touch-pan-y flex-row flex-nowrap"
                        style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', height: '100%', width: '100%' }}
                    >
                        {images.map((src, index) => (
                            <div
                                className="relative min-w-0 flex-[0_0_100%]"
                                key={index}
                                style={{ flex: '0 0 100%', minWidth: 0, height: '100%', position: 'relative' }}
                            >
                                <Image
                                    src={src}
                                    alt={`${title} - ${index + 1}`}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority={index === 0}
                                    className="object-cover transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    className="absolute top-1/2 left-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white/95 shadow-lg backdrop-blur transition-all hover:bg-white active:scale-90"
                    onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                    aria-label="Previous image"
                >
                    <ChevronLeft className="h-6 w-6 text-brand-teal" />
                </button>
                <button
                    className="absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 animate-pulse items-center justify-center rounded-full border border-gray-100 bg-white/95 shadow-lg backdrop-blur transition-all hover:bg-white active:scale-90 md:animate-none"
                    onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                    aria-label="Next image"
                >
                    <ChevronRight className="h-6 w-6 text-brand-teal" />
                </button>


                {/* Swipe Hint overlay - Mobile only, first slide only */}
                {isMobile && selectedIndex === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center duration-1000">
                        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 backdrop-blur-sm">
                            <span className="text-[10px] font-bold tracking-widest text-white uppercase">स्वाईप करा</span>
                            <div className="flex gap-1">
                                <ChevronRight className="h-3 w-3 animate-pulse text-white" />
                                <ChevronRight className="h-3 w-3 animate-pulse text-white delay-75" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold tracking-widest text-white shadow-lg backdrop-blur">
                    {selectedIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {/* <div className="overflow-hidden px-1" ref={emblaThumbsRef}>
                <div className="flex gap-3">
                    {images.map((src, index) => (
                        <button
                            key={index}
                            onClick={() => onThumbClick(index)}
                            className={cn(
                                "flex-[0_0_20%] min-w-0 aspect-3/4 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                                index === selectedIndex
                                    ? "border-brand-teal ring-2 ring-brand-teal/20 scale-105"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={src}
                                fill
                                sizes="20vw"
                                className="object-cover"
                                alt={`Thumb ${index + 1}`}
                            />
                        </button>
                    ))}
                </div>
            </div> */}

        </div>
    );
}


