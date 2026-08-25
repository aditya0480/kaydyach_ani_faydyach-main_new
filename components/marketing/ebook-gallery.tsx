"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
    ChevronLeft,
    ChevronRight,
    Maximize2,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    BookOpen,
    ExternalLink,
    Loader2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BuyButton } from "@/components/buy-button";
import { PreviewTrigger } from "./preview-trigger";
import { usePdfPages } from "@/hooks/use-pdf-pages";

interface EbookGalleryProps {
    coverImage: string | null;
    sampleImages?: string[];
    title: string;
    ebookId?: string;
    price?: number;
    language?: string;
    totalPages?: number | null;
    previewUrl?: string | null;
}

const GALLERY_LABELS = {
    MARATHI: {
        badge: "मोफत नमुना प्रत",
        readFullscreen: "मोठ्या आकारात वाचा",
        fullscreenTitle: "नमुना प्रत वाचक",
        pageOf: "पान",
        of: "/",
        prevPage: "मागील",
        nextPage: "पुढील",
        zoomIn: "झूम इन",
        zoomOut: "झूम आउट",
        resetZoom: "रिसेट",
        buyNow: "संपूर्ण पुस्तक खरेदी करा",
        swipeText: "स्वाईप करा",
        loadingText: "PDF पाने लोड होत आहेत...",
    },
    HINDI: {
        badge: "मुफ्त सैंपल झलक",
        readFullscreen: "पूरा बड़ा देखें",
        fullscreenTitle: "सैंपल रीडर",
        pageOf: "पृष्ठ",
        of: "/",
        prevPage: "पिछला",
        nextPage: "अगला",
        zoomIn: "ज़ूम इन",
        zoomOut: "ज़ूम आउट",
        resetZoom: "रीसेट",
        buyNow: "पूरी ई-बुक अभी खरीदें",
        swipeText: "स्वाइप करें",
        loadingText: "PDF पृष्ठ लोड हो रहे हैं...",
    },
    ENGLISH: {
        badge: "Free Sample Preview",
        readFullscreen: "Read Fullscreen",
        fullscreenTitle: "Sample Preview Reader",
        pageOf: "Page",
        of: "of",
        prevPage: "Previous",
        nextPage: "Next",
        zoomIn: "Zoom In",
        zoomOut: "Zoom Out",
        resetZoom: "Reset",
        buyNow: "Buy Full Ebook Now",
        swipeText: "Swipe",
        loadingText: "Loading preview pages...",
    },
} as const;

export function EbookGallery({
    coverImage,
    sampleImages = [],
    title,
    ebookId,
    price = 99,
    language = "MARATHI",
    totalPages,
    previewUrl
}: EbookGalleryProps) {
    const { pages: pdfPages, isLoading } = usePdfPages(ebookId, coverImage);

    // Combine PDF rendered pages or fallback to sampleImages / coverImage
    const pages =
        pdfPages.length > 0
            ? pdfPages
            : sampleImages && sampleImages.length > 0
            ? coverImage
                ? [coverImage, ...sampleImages]
                : sampleImages
            : coverImage
            ? [coverImage]
            : [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    const labels =
        GALLERY_LABELS[(language ?? "MARATHI") as keyof typeof GALLERY_LABELS] ??
        GALLERY_LABELS.MARATHI;

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Ensure currentIndex stays within bounds if pages count changes
    useEffect(() => {
        if (currentIndex >= pages.length && pages.length > 0) {
            setCurrentIndex(0);
        }
    }, [pages.length, currentIndex]);

    const goToPrev = useCallback((e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
        setZoomLevel(1);
    }, []);

    const goToNext = useCallback(
        (e?: React.MouseEvent) => {
            if (e) e.stopPropagation();
            setCurrentIndex((prev) => (prev < pages.length - 1 ? prev + 1 : prev));
            setZoomLevel(1);
        },
        [pages.length]
    );

    // Keyboard navigation when in fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isFullscreenOpen) return;
            if (e.key === "ArrowLeft") goToPrev();
            if (e.key === "ArrowRight") goToNext();
            if (e.key === "Escape") setIsFullscreenOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFullscreenOpen, goToPrev, goToNext]);

    // Touch Swipe handling for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartX - touchEndX;

        if (Math.abs(diffX) > 40) {
            if (diffX > 0) {
                // Swiped left -> Next
                if (currentIndex < pages.length - 1) {
                    setCurrentIndex((prev) => prev + 1);
                }
            } else {
                // Swiped right -> Prev
                if (currentIndex > 0) {
                    setCurrentIndex((prev) => prev - 1);
                }
            }
        }
        setTouchStartX(null);
    };

    if (pages.length === 0) return null;

    const previewPageCount = pages.length > 1 ? pages.length : 7;
    const currentImgUrl = pages[currentIndex] || pages[0];

    return (
        <div className="flex flex-col gap-3">
            {/* Main Interactive Book Viewer */}
            <div className="group relative">
                <div
                    className="relative aspect-3/4 w-full cursor-pointer overflow-hidden rounded-2xl border-4 border-white bg-gray-50 shadow-2xl ring-1 ring-gray-200 select-none"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => setIsFullscreenOpen(true)}
                >
                    {/* Watermark / Preview Ribbon */}
                    <div className="pointer-events-none absolute top-3 right-3 z-20 rounded-md bg-[#0A2342]/90 px-2.5 py-1 text-[10px] font-black tracking-widest text-[#FFD301] shadow-xs backdrop-blur-xs">
                        PREVIEW
                    </div>

                    {/* Page Indicator Tag (Top Left) */}
                    <div className="pointer-events-none absolute top-3 left-3 z-20 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                        {labels.pageOf} {currentIndex + 1} {labels.of} {pages.length}
                    </div>

                    {/* Active Page Image */}
                    {currentImgUrl ? (
                        <Image
                            src={currentImgUrl}
                            alt={`${title} - Page ${currentIndex + 1}`}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-50 text-xs text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-teal" />
                            {labels.loadingText}
                        </div>
                    )}

                    {/* Floating Left Arrow Button */}
                    {pages.length > 1 && currentIndex > 0 && (
                        <button
                            type="button"
                            className="absolute top-1/2 left-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-brand-teal shadow-lg backdrop-blur-xs transition-all hover:bg-white hover:scale-110 active:scale-95"
                            onClick={goToPrev}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-6 w-6 text-brand-teal" />
                        </button>
                    )}

                    {/* Floating Right Arrow Button */}
                    {pages.length > 1 && currentIndex < pages.length - 1 && (
                        <button
                            type="button"
                            className="absolute top-1/2 right-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-brand-teal shadow-lg backdrop-blur-xs transition-all hover:bg-white hover:scale-110 active:scale-95"
                            onClick={goToNext}
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-6 w-6 text-brand-teal" />
                        </button>
                    )}



                    {/* Swipe Hint overlay - Mobile only on first slide */}
                    {isMobile && currentIndex === 0 && pages.length > 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-center duration-1000">
                            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-1.5 backdrop-blur-sm">
                                <span className="text-[10px] font-bold tracking-widest text-white uppercase">
                                    {labels.swipeText}
                                </span>
                                <div className="flex gap-1">
                                    <ChevronRight className="h-3 w-3 animate-pulse text-white" />
                                    <ChevronRight className="h-3 w-3 animate-pulse text-white delay-75" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons + Page Indicator Bar */}
            {pages.length > 1 && (
                <div className="flex w-full items-center justify-between gap-2 px-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="h-8.5 gap-1 border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {labels.prevPage}
                    </Button>

                    <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs font-bold text-gray-800 shadow-xs">
                        <span>
                            {labels.pageOf} {currentIndex + 1} {labels.of} {pages.length}
                        </span>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={goToNext}
                        disabled={currentIndex === pages.length - 1}
                        className="h-8.5 gap-1 border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 disabled:opacity-30"
                    >
                        {labels.nextPage}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* "पहिली 7 पाने मोफत वाचा (Preview)" Trigger on Left Side */}
            <PreviewTrigger
                count={previewPageCount}
                language={language}
                onClick={() => setIsFullscreenOpen(true)}
            />

            {/* Action Bar (Fullscreen + PDF Preview) */}
            <div className="flex items-center justify-between gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreenOpen(true)}
                    className="h-8.5 flex-1 gap-1.5 border-brand-teal/25 bg-brand-teal/5 text-xs font-bold text-brand-teal hover:bg-brand-teal/15 hover:text-brand-teal"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                    {labels.readFullscreen}
                </Button>

                {ebookId && (
                    <a
                        href={`/api/preview/${ebookId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8.5 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 shadow-2xs transition-colors hover:bg-gray-50"
                    >
                        <ExternalLink className="h-3.5 w-3.5 text-brand-teal" />
                        PDF Preview
                    </a>
                )}
            </div>

            {/* Thumbnail Strip */}
            {pages.length > 1 && (
                <div className="flex w-full items-center gap-2 overflow-x-auto py-1">
                    {pages.map((imgUrl, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => {
                                setCurrentIndex(idx);
                            }}
                            className={`group relative aspect-3/4 h-14 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                                idx === currentIndex
                                    ? "scale-105 border-brand-teal shadow-md ring-2 ring-brand-teal/30"
                                    : "border-gray-200 opacity-60 hover:opacity-100"
                            }`}
                        >
                            <Image
                                src={imgUrl}
                                alt={`Thumb ${idx + 1}`}
                                fill
                                sizes="60px"
                                unoptimized
                                className="object-cover"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-black/75 text-center text-[8px] font-bold text-white">
                                {idx === 0 ? "कव्हर" : `${idx + 1}`}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* ==================================================== */}
            {/* FULLSCREEN LIGHTBOX / HIGH-RES READER DIALOG */}
            {/* ==================================================== */}
            <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
                <DialogContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                    className="flex h-[92vh] max-h-[92vh] w-[95vw] max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-[#0A2342] p-0 text-white shadow-2xl"
                >
                    <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-white/10 px-4 py-2.5 sm:px-6">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFD301]/20 text-[#FFD301]">
                                <BookOpen className="h-3.5 w-3.5" />
                            </span>
                            <div>
                                <DialogTitle className="line-clamp-1 text-xs font-bold text-white sm:text-sm">
                                    {title}
                                </DialogTitle>
                                <DialogDescription className="text-[10px] text-gray-300">
                                    {labels.fullscreenTitle} — {labels.pageOf} {currentIndex + 1} {labels.of} {pages.length}
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Zoom & Action Controls in Header */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="hidden items-center gap-1 rounded-lg bg-white/10 px-1 py-0.5 sm:flex">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                                    className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                                    title={labels.zoomOut}
                                >
                                    <ZoomOut className="h-3.5 w-3.5" />
                                </Button>
                                <span className="min-w-8 text-center text-[10px] font-mono">
                                    {Math.round(zoomLevel * 100)}%
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                                    className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                                    title={labels.zoomIn}
                                >
                                    <ZoomIn className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setZoomLevel(1)}
                                    className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                                    title={labels.resetZoom}
                                >
                                    <RotateCcw className="h-3 w-3" />
                                </Button>
                            </div>

                            {ebookId && (
                                <div className="hidden sm:block">
                                    <BuyButton
                                        ebookId={ebookId}
                                        price={price}
                                        title={title}
                                        customLabel={`खरेदी करा (₹${price})`}
                                        language={language}
                                    />
                                </div>
                            )}
                        </div>
                    </DialogHeader>

                    {/* High-res page viewer container */}
                    <div
                        className="relative flex flex-1 items-center justify-center overflow-auto bg-black/40 p-2 sm:p-4"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Prev Button */}
                        {pages.length > 1 && (
                            <button
                                type="button"
                                onClick={goToPrev}
                                disabled={currentIndex === 0}
                                className="absolute left-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-xs transition-all hover:bg-black/80 disabled:opacity-20 sm:left-4 sm:h-12 sm:w-12"
                                aria-label="Previous Page"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        )}

                        {/* Image Viewer */}
                        <div
                            className="relative aspect-3/4 h-full max-h-full max-w-full overflow-hidden rounded-lg shadow-2xl transition-transform duration-200"
                            style={{
                                transform: `scale(${zoomLevel})`,
                                transformOrigin: "center center",
                            }}
                        >
                            {pages[currentIndex] && (
                                <Image
                                    src={pages[currentIndex]}
                                    alt={`${title} - Page ${currentIndex + 1}`}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 800px"
                                    unoptimized
                                    priority
                                    className="object-contain"
                                />
                            )}
                        </div>

                        {/* Next Button */}
                        {pages.length > 1 && (
                            <button
                                type="button"
                                onClick={goToNext}
                                disabled={currentIndex === pages.length - 1}
                                className="absolute right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-xs transition-all hover:bg-black/80 disabled:opacity-20 sm:right-4 sm:h-12 sm:w-12"
                                aria-label="Next Page"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        )}
                    </div>

                    {/* Fullscreen Bottom Footer with Thumbnails and CTA */}
                    <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 bg-[#0A2342] p-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3">
                        {/* Thumbnails */}
                        <div className="flex items-center justify-center gap-1.5 overflow-x-auto sm:justify-start">
                            {pages.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setCurrentIndex(idx);
                                        setZoomLevel(1);
                                    }}
                                    className={`relative aspect-3/4 h-10 shrink-0 overflow-hidden rounded border transition-all ${
                                        idx === currentIndex
                                            ? "border-[#FFD301] shadow-md ring-2 ring-[#FFD301]/40"
                                            : "border-white/20 opacity-50 hover:opacity-100"
                                    }`}
                                >
                                    <Image
                                        src={imgUrl}
                                        alt={`Thumb ${idx + 1}`}
                                        fill
                                        sizes="40px"
                                        unoptimized
                                        className="object-cover"
                                    />
                                    <span className="absolute inset-x-0 bottom-0 bg-black/80 text-center text-[7px] font-bold text-white">
                                        {idx + 1}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Buy CTA */}
                        {ebookId && (
                            <div className="w-full sm:w-auto">
                                <BuyButton
                                    ebookId={ebookId}
                                    price={price}
                                    title={title}
                                    customLabel={`संपूर्ण पुस्तक खरेदी करा - ₹${price}`}
                                    language={language}
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
