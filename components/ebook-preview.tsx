"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Eye, ExternalLink } from "lucide-react";

interface EbookPreviewProps {
    previewUrl: string | null;
}

export function EbookPreview({ previewUrl }: EbookPreviewProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const ua = navigator.userAgent;
            const mobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 768;
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    if (!previewUrl) return null;

    return (
        <div className="rounded-lg border bg-muted/30 p-4 sm:p-6">
            <h3 className="mb-3 flex items-center text-sm font-semibold sm:mb-4 sm:text-base">
                <FileText className="mr-2 h-4 w-4" /> Preview / झलक
            </h3>

            {!showPreview ? (
                <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed border-gray-300 bg-white/50 p-6 sm:space-y-4 sm:p-12">
                    <BookPreviewIcon />
                    <p className="max-w-xs text-center text-xs text-muted-foreground sm:text-sm">
                        खरेदी करण्यापूर्वी पुस्तकाचा नमुना पहा.
                        <br />
                        <span className="text-muted-foreground/70">See a glimpse of what&apos;s inside before you buy.</span>
                    </p>
                    <Button onClick={() => setShowPreview(true)} variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" /> Preview पहा
                    </Button>
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {isMobile ? (
                        /* Mobile: open in new tab since iframe PDF doesn't work on most mobile browsers */
                        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-6 text-center">
                            <FileText className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                तुमच्या मोबाइलवर Preview पाहण्यासाठी खालील बटणावर क्लिक करा.
                                <br />
                                <span className="text-muted-foreground/70">(PDF will open in a new tab for best viewing.)</span>
                            </p>
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-md bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-teal/90 active:scale-95"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Preview उघडा (Open Preview)
                            </a>
                        </div>
                    ) : (
                        /* Desktop: inline iframe */
                        <div className="relative aspect-3/4 overflow-hidden rounded border bg-white shadow-sm md:aspect-video">
                            <iframe
                                src={previewUrl}
                                className="absolute inset-0 h-full w-full"
                                title="Preview"
                            ></iframe>
                        </div>
                    )}
                    <Button onClick={() => setShowPreview(false)} variant="ghost" size="sm">
                        Close Preview / बंद करा
                    </Button>
                </div>
            )}
            <p className="mt-3 text-[10px] text-muted-foreground sm:mt-4 sm:text-xs">
                Note: Preview might behave differently depending on your browser&apos;s PDF settings.
            </p>
        </div>
    );
}

function BookPreviewIcon() {
    return (
        <svg
            className="h-10 w-10 text-muted-foreground/30 sm:h-12 sm:w-12"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}
