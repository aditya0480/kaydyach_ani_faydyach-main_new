"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    FileText,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Lock,
    Sparkles,
    BookOpen,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Loader2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { BuyButton } from "@/components/buy-button";
import { usePdfPages } from "@/hooks/use-pdf-pages";

interface EbookPreviewProps {
    previewUrl?: string | null;
    sampleImages?: string[];
    coverImage?: string | null;
    title?: string;
    price?: number;
    ebookId?: string;
    totalPages?: number | null;
    language?: string;
}

const PREVIEW_LABELS = {
    MARATHI: {
        badge: "मोफत नमुना प्रत",
        title: "पुस्तकाची पहिली पाने मोफत वाचा",
        subtitle: "खरेदी करण्यापूर्वी पुस्तकाची मांडणी आणि महत्त्वाची पाने तपासा",
        pageOf: "पान",
        of: "/",
        totalPagesText: "संपूर्ण पुस्तकात एकूण",
        pagesText: "पाने आहेत",
        readFullscreen: "मोठ्या आकारात वाचा",
        fullscreenTitle: "नमुना प्रत वाचक",
        prevPage: "मागील",
        nextPage: "पुढील",
        endNoticeTitle: "🔒 नमुना वाचन समाप्त",
        endNoticeSubtitle: "संपूर्ण पुस्तक मिळवण्यासाठी आत्ताच खरेदी करा. पेमेंटनंतर लगेच WhatsApp आणि ईमेलवर PDF मिळेल.",
        buyNow: "संपूर्ण पुस्तक खरेदी करा",
        openPdfTab: "PDF नवीन टॅबमध्ये उघडा",
        closeFullscreen: "बंद करा",
        zoomIn: "झूम इन",
        zoomOut: "झूम आउट",
        resetZoom: "रिसेट",
        previewNotice: "टीप: हे केवळ नमुना वाचन आहे. खरेदीनंतर संपूर्ण मूळ PDF मिळेल.",
        loadingText: "PDF पाने लोड होत आहेत...",
    },
    HINDI: {
        badge: "मुफ्त सैंपल झलक",
        title: "पुस्तक के पहले पृष्ठ मुफ्त पढ़ें",
        subtitle: "खरीदने से पहले पुस्तक की गुणवत्ता और महत्वपूर्ण सामग्री देखें",
        pageOf: "पृष्ठ",
        of: "/",
        totalPagesText: "संपूर्ण पुस्तक में कुल",
        pagesText: "पृष्ठ हैं",
        readFullscreen: "पूरा बड़ा देखें",
        fullscreenTitle: "सैंपल रीडर",
        prevPage: "पिछला",
        nextPage: "अगला",
        endNoticeTitle: "🔒 सैंपल वाचन समाप्त",
        endNoticeSubtitle: "पूरी पुस्तक पढ़ने के लिए अभी खरीदें। भुगतान के तुरंत बाद WhatsApp और ईमेल पर PDF मिलेगी।",
        buyNow: "पूरी ई-बुक अभी खरीदें",
        openPdfTab: "PDF नए टैब में खोलें",
        closeFullscreen: "बंद करें",
        zoomIn: "ज़ूम इन",
        zoomOut: "ज़ूम आउट",
        resetZoom: "रीसेट",
        previewNotice: "नोट: यह केवल सैंपल झलक है। खरीद के बाद आपको संपूर्ण ओरिजिनल PDF मिलेगी।",
        loadingText: "PDF पृष्ठ लोड हो रहे हैं...",
    },
    ENGLISH: {
        badge: "Free Sample Preview",
        title: "Read First Pages For Free",
        subtitle: "Check the contents, index and preview pages before purchasing",
        pageOf: "Page",
        of: "of",
        totalPagesText: "Total Book Pages:",
        pagesText: "Pages",
        readFullscreen: "Read Fullscreen",
        fullscreenTitle: "Sample Preview Reader",
        prevPage: "Previous",
        nextPage: "Next",
        endNoticeTitle: "🔒 Sample Preview Ended",
        endNoticeSubtitle: "Buy the full ebook to unlock all pages. Get instant access via WhatsApp & Email after payment.",
        buyNow: "Buy Full Ebook Now",
        openPdfTab: "Open PDF in New Tab",
        closeFullscreen: "Close",
        zoomIn: "Zoom In",
        zoomOut: "Zoom Out",
        resetZoom: "Reset",
        previewNotice: "Note: This is a sample preview. You will receive the complete unwatermarked PDF after purchase.",
        loadingText: "Loading PDF preview pages...",
    },
} as const;

export function EbookPreview({
    previewUrl,
    sampleImages = [],
    coverImage,
    title = "E-Book",
    price = 99,
    ebookId,
    totalPages,
    language = "MARATHI",
}: EbookPreviewProps) {
    const hasSampleImages = Boolean(sampleImages && sampleImages.length > 0);
    const { pages: pdfPages, isLoading } = usePdfPages(
        hasSampleImages ? undefined : ebookId,
        coverImage
    );

    // Prefer uploaded sample images, then dynamically rendered PDF pages, then coverImage
    const pages = hasSampleImages
        ? coverImage && !sampleImages.includes(coverImage)
            ? [coverImage, ...sampleImages]
            : sampleImages
        : pdfPages.length > 0
        ? pdfPages
        : coverImage
        ? [coverImage]
        : [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    const labels =
        PREVIEW_LABELS[(language ?? "MARATHI") as keyof typeof PREVIEW_LABELS] ??
        PREVIEW_LABELS.MARATHI;

    useEffect(() => {
        const checkMobile = () => {
            const ua = navigator.userAgent;
            const mobile =
                /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
                    ua
                ) || window.innerWidth < 768;
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
        setZoomLevel(1);
    }, []);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < pages.length - 1 ? prev + 1 : prev));
        setZoomLevel(1);
    }, [pages.length]);

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
                // Swipe Left -> Next
                goToNext();
            } else {
                // Swipe Right -> Prev
                goToPrev();
            }
        }
        setTouchStartX(null);
    };

    // If neither sample images nor previewUrl are provided and no pages available
    if (pages.length === 0 && !previewUrl && !ebookId) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-brand-teal/20 bg-linear-to-b from-brand-teal/5 via-white to-gray-50/50 p-3 shadow-md sm:p-6">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-amber-900 sm:text-xs">
                            <Sparkles className="h-3 w-3 text-amber-600" />
                            {labels.badge} ({pages.length > 0 ? pages.length : 6} {labels.pagesText})
                        </span>
                        {totalPages && totalPages > 0 && (
                            <span className="text-[11px] font-medium text-gray-500">
                                {labels.totalPagesText} {totalPages} {labels.pagesText}
                            </span>
                        )}
                    </div>
                    <h3 className="mt-1.5 text-base font-black text-brand-teal sm:text-lg">
                        {labels.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                        {labels.subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {ebookId && (
                        <a
                            href={`/api/preview/${ebookId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50"
                        >
                            <ExternalLink className="h-3.5 w-3.5 text-brand-teal" />
                            PDF
                        </a>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFullscreenOpen(true)}
                        className="h-8 gap-1.5 border-brand-teal/30 text-xs font-bold text-brand-teal hover:bg-brand-teal/10 hover:text-brand-teal"
                    >
                        <Maximize2 className="h-3.5 w-3.5" />
                        {labels.readFullscreen}
                    </Button>
                </div>
            </div>

            {/* Main Interactive Book Viewer */}
            <div className="relative mx-auto flex max-w-lg flex-col items-center">
                {/* Page Card Container */}
                <div
                    className="group relative aspect-3/4 w-full max-w-md cursor-zoom-in overflow-hidden rounded-xl border-2 border-white bg-white shadow-xl ring-1 ring-gray-200"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => setIsFullscreenOpen(true)}
                >
                    {/* Watermark/Sample Ribbon */}
                    <div className="pointer-events-none absolute top-3 right-3 z-10 rounded-md bg-[#0A2342]/80 px-2.5 py-1 text-[10px] font-black tracking-widest text-[#FFD301] backdrop-blur-xs">
                        PREVIEW
                    </div>

                    {/* Page Image */}
                    {pages[currentIndex] ? (
                        <Image
                            src={pages[currentIndex]}
                            alt={`${title} - Preview Page ${currentIndex + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 500px"
                            unoptimized
                            priority={currentIndex === 0}
                            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-50 text-xs text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-teal" />
                            {labels.loadingText}
                        </div>
                    )}

                    {/* Hover Fullscreen Prompt */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-gray-900 shadow-md backdrop-blur-xs">
                            <Maximize2 className="h-3.5 w-3.5 text-brand-teal" />
                            {labels.readFullscreen}
                        </span>
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="mt-3 flex w-full max-w-md items-center justify-between gap-2 px-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="h-8 gap-1 border-gray-200 bg-white px-2.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {labels.prevPage}
                    </Button>

                    {/* Page Pill Counter */}
                    <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-800 shadow-xs">
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
                        className="h-8 gap-1 border-gray-200 bg-white px-2.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 disabled:opacity-40"
                    >
                        {labels.nextPage}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Thumbnail Strip */}
                {pages.length > 1 && (
                    <div className="mt-3.5 flex w-full max-w-md items-center justify-center gap-2 overflow-x-auto px-1 py-1">
                        {pages.map((imgUrl, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
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
                                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-center text-[8px] font-bold text-white">
                                    {idx === 0 ? "कव्हर" : `${idx + 1}`}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* End of Preview Lock Banner & Buy Button */}
            <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-amber-800">
                            <Lock className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-amber-900 sm:text-sm">
                                {labels.endNoticeTitle}
                            </h4>
                            <p className="text-[11px] leading-relaxed text-amber-800">
                                {labels.endNoticeSubtitle}
                            </p>
                        </div>
                    </div>

                    {ebookId && (
                        <div className="w-full sm:w-auto sm:min-w-48">
                            <BuyButton
                                ebookId={ebookId}
                                price={price}
                                title={title}
                                customLabel={`${labels.buyNow} - ₹${price}`}
                                language={language}
                            />
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-2.5 text-center text-[10px] text-muted-foreground">
                {labels.previewNotice}
            </p>

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

                        {/* Zoom & Page Controls in Header */}
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
                        {/* Prev Button Overlay */}
                        <button
                            type="button"
                            onClick={goToPrev}
                            disabled={currentIndex === 0}
                            className="absolute left-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-xs transition-all hover:bg-black/80 disabled:opacity-20 sm:left-4 sm:h-12 sm:w-12"
                            aria-label="Previous Page"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>

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

                        {/* Next Button Overlay */}
                        <button
                            type="button"
                            onClick={goToNext}
                            disabled={currentIndex === pages.length - 1}
                            className="absolute right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-xs transition-all hover:bg-black/80 disabled:opacity-20 sm:right-4 sm:h-12 sm:w-12"
                            aria-label="Next Page"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
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
                                    <span className="absolute bottom-0 inset-x-0 bg-black/80 text-center text-[7px] font-bold text-white">
                                        {idx + 1}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Mobile / Desktop Action CTA */}
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
