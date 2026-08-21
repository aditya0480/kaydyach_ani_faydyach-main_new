"use client";

import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface PreviewTriggerProps {
    targetId: string;
    count?: number;
    language?: string;
}

const TRIGGER_LABELS = {
    MARATHI: {
        cta: "पहिली ६ पाने मोफत वाचा (Preview)",
        badge: "Free Sample",
    },
    HINDI: {
        cta: "पहले ६ पृष्ठ मुफ्त पढ़ें (Preview)",
        badge: "Free Sample",
    },
    ENGLISH: {
        cta: "Read First 6 Pages Free (Preview)",
        badge: "Free Sample",
    },
} as const;

export function PreviewTrigger({ targetId, count = 6, language = "MARATHI" }: PreviewTriggerProps) {
    const handleScroll = () => {
        const previewEl = document.getElementById(targetId);
        if (previewEl) {
            previewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const labels = TRIGGER_LABELS[(language ?? "MARATHI") as keyof typeof TRIGGER_LABELS] ?? TRIGGER_LABELS.MARATHI;
    const ctaText = count > 0 
        ? (language === "HINDI" ? `पहले ${count} पृष्ठ मुफ्त पढ़ें (Preview)` : language === "ENGLISH" ? `Read First ${count} Pages Free (Preview)` : `पहिली ${count} पाने मोफत वाचा (Preview)`)
        : labels.cta;

    return (
        <div
            className="group/preview cursor-pointer pt-2"
            onClick={handleScroll}
        >
            <div className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/30 bg-amber-50/80 px-3 py-1.5 shadow-xs transition-all duration-300 hover:border-brand-gold hover:bg-amber-100/90 active:scale-98">
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-brand-gold/30" />
                    <BookOpen className="relative z-10 h-4 w-4 text-amber-700" />
                </div>
                <span className="text-xs font-black text-amber-950 sm:text-sm">
                    {ctaText}
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-600 transition-transform group-hover/preview:rotate-12" />
            </div>
        </div>
    );
}
