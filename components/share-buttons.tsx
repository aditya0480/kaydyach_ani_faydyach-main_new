"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaWhatsapp, FaFacebook, FaInstagram, FaLink } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Send, Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
    title: string;
    text?: string;
    url?: string;
    className?: string;
    variant?: "default" | "minimal";
}

export function ShareButtons({ title, text, url, className, variant = "default" }: ShareButtonsProps) {
    const [currentUrl, setCurrentUrl] = useState(url || "");
    const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

    useEffect(() => {
        if (!url && typeof window !== 'undefined') {
            const href = window.location.href;
            const timer = setTimeout(() => setCurrentUrl(href), 0);
            return () => clearTimeout(timer);
        }
    }, [url]);

    const encodedUrl = encodeURIComponent(currentUrl);
    const shareText = text || `हे पुस्तक नक्की वाचा: ${title}`;
    const encodedText = encodeURIComponent(shareText);

    const handleShare = (platform: string) => {
        let shareLink = "";

        switch (platform) {
            case "native": {
                if (typeof navigator !== 'undefined' && 'share' in navigator) {
                    navigator.share({
                        title: title,
                        text: shareText,
                        url: currentUrl,
                    }).catch(() => {
                        // User cancelled or share failed - silently ignore
                    });
                }
                return;
            }
            case "whatsapp":
                shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
                break;
            case "facebook":
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case "instagram":
                if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(currentUrl);
                    toast.success("Link copied! Paste it in your Instagram story.");
                }
                return;
            case "copy":
                if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(currentUrl);
                    toast.success("Link copied to clipboard!");
                }
                return;
            default:
                return;
        }

        if (shareLink && typeof window !== 'undefined') {
            window.open(shareLink, '_blank', 'noopener,noreferrer');
        }
    };

    if (variant === "minimal") {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-[#25D366] hover:bg-[#25D366]/10"
                    onClick={() => handleShare("whatsapp")}
                >
                    <FaWhatsapp className="h-5 w-5" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-50"
                    onClick={() => handleShare("facebook")}
                >
                    <FaFacebook className="h-5 w-5" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100"
                    onClick={() => handleShare("copy")}
                >
                    <FaLink className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-3 sm:p-4", className)}>
            <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[11px] font-black tracking-widest text-gray-400 uppercase">
                    <Send className="h-3.5 w-3.5" /> मित्रांना शेअर करा (Share link)
                </p>
            </div>

            {/* Native Share Button (mobile) + Social buttons */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
                {canNativeShare && (
                    <Button
                        size="icon"
                        onClick={() => handleShare("native")}
                        className="h-12 w-12 rounded-full bg-brand-teal text-white shadow-lg transition-all hover:bg-brand-teal/90 active:scale-90"
                    >
                        <Share2 className="h-6 w-6" />
                    </Button>
                )}
                {/* WhatsApp */}
                <Button
                    size="icon"
                    onClick={() => handleShare("whatsapp")}
                    className="h-12 w-12 rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/20 transition-all hover:bg-[#20bd5a] active:scale-90"
                >
                    <FaWhatsapp className="h-6 w-6" />
                </Button>

                {/* Facebook */}
                <Button
                    size="icon"
                    onClick={() => handleShare("facebook")}
                    className="h-12 w-12 rounded-full bg-[#1877F2] text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#166fe5] active:scale-90"
                >
                    <FaFacebook className="h-6 w-6" />
                </Button>

                {/* Instagram / Copy */}
                <Button
                    size="icon"
                    onClick={() => handleShare("instagram")}
                    className="h-12 w-12 rounded-full bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-lg shadow-pink-500/20 transition-all hover:opacity-90 active:scale-90"
                >
                    <FaInstagram className="h-6 w-6" />
                </Button>

                {/* Simple Copy */}
                <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleShare("copy")}
                    className="h-12 w-12 rounded-full border-2 border-gray-100 text-gray-500 transition-all hover:bg-gray-100 active:scale-90"
                >
                    <Copy className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
