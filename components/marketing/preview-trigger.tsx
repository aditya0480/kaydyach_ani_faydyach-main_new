"use client";

import React from 'react';
import { BookOpen } from 'lucide-react';

interface PreviewTriggerProps {
    targetId: string;
}

export function PreviewTrigger({ targetId }: PreviewTriggerProps) {
    const handleScroll = () => {
        const previewEl = document.getElementById(targetId);
        if (previewEl) {
            previewEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div
            className="group/preview cursor-pointer pt-2"
            onClick={handleScroll}
        >
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-teal transition-colors group-hover/preview:text-brand-gold md:mb-3 md:text-base">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-brand-gold/20" />
                    <BookOpen className="relative z-10 h-4 w-4 text-brand-gold" />
                </div>
                पुस्तकाची झलक पहा (Preview)
            </h3>
        </div>
    );
}
