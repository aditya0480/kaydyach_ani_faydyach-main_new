"use client";

import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface PreviewTriggerProps {
    targetId?: string;
    count?: number;
    language?: string;
    onClick?: () => void;
    className?: string;
}

const TRIGGER_LABELS = {
    MARATHI: {
        cta: "पहिली 7 पाने मोफत वाचा (Preview)",
        badge: "Free Sample",
    },
    HINDI: {
        cta: "पहले 7 पृष्ठ मुफ्त पढ़ें (Preview)",
        badge: "Free Sample",
    },
    ENGLISH: {
        cta: "Read First 7 Pages Free (Preview)",
        badge: "Free Sample",
    },
} as const;

export function PreviewTrigger({ targetId, count = 7, language = "MARATHI", onClick, className = "" }: PreviewTriggerProps) {
    const handleClick = () => {
        if (onClick) {
            onClick();
            return;
        }
        if (targetId) {
            const previewEl = document.getElementById(targetId);
            if (previewEl) {
                previewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const labels = TRIGGER_LABELS[(language ?? "MARATHI") as keyof typeof TRIGGER_LABELS] ?? TRIGGER_LABELS.MARATHI;
    const ctaText = count > 0 
        ? (language === "HINDI" ? `पहले ${count} पृष्ठ मुफ्त पढ़ें (Preview)` : language === "ENGLISH" ? `Read First ${count} Pages Free (Preview)` : `पहिली ${count} पाने मोफत वाचा (Preview)`)
        : labels.cta;

    return (
        <div
            className={`group/preview cursor-pointer ${className}`}
            onClick={handleClick}
        >
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-gold/40 bg-amber-50/90 px-3.5 py-2 shadow-xs transition-all duration-300 hover:border-brand-gold hover:bg-amber-100 hover:shadow-md active:scale-98">
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-brand-gold/40" />
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
