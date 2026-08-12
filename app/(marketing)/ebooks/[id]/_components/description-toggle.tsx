"use client";

import { useState } from "react";

interface Props {
    html: string;
    maxLines?: number;
    showMoreLabel?: string;
    showLessLabel?: string;
}

export function DescriptionToggle({
    html,
    showMoreLabel = "अधिक वाचा (Read More) ▾",
    showLessLabel = "कमी करा (Show Less) ▴",
}: Props) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div>
            <div
                className={`prose-headings:text-brand-teal prose-strong:text-foreground text-xs leading-relaxed sm:text-sm [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 ${
                    !expanded ? "line-clamp-6 overflow-hidden" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
            <button
                onClick={() => setExpanded((p) => !p)}
                className="mt-2 text-[11px] font-semibold text-brand-teal underline-offset-2 hover:underline"
            >
                {expanded ? showLessLabel : showMoreLabel}
            </button>
        </div>
    );
}
