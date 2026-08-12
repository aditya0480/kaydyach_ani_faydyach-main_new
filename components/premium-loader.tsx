"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PremiumLoaderProps {
    marathiText?: string;
    englishText?: string;
    fullScreen?: boolean;
}

export function PremiumLoader({
    marathiText = "लोड होत आहे...",
    englishText = "Loading Knowledge",
    fullScreen = false
}: PremiumLoaderProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) return 0;
                const diff = Math.random() * 15;
                return Math.min(oldProgress + diff, 100);
            });
        }, 150);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className={`flex flex-col items-center justify-center p-4 ${fullScreen ? 'min-h-screen bg-linear-to-b from-white to-gray-50/50' : 'h-full w-full py-12'}`}>
            <div className="animate-in fade-in zoom-in relative flex w-full max-w-xs flex-col items-center gap-8 duration-700">

                {/* Glow Effect */}
                <div className="absolute -z-10 h-32 w-32 rounded-full bg-brand-gold/10 blur-3xl" />

                {/* Logo with Pulse Animation */}
                <div className="group relative">
                    <Image
                        src="/logo.png"
                        alt="Kaydyanchanifaydyach"
                        width={200}
                        height={80}
                        className="h-20 w-auto animate-pulse object-contain duration-2000"
                    />
                </div>

                <div className="flex w-full flex-col items-center gap-4">
                    {/* Custom Progress Bar Container */}
                    <div className="font-marathi h-1.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
                        <div
                            className="h-full rounded-full bg-linear-to-r from-brand-teal via-brand-teal/80 to-brand-gold shadow-[0_0_8px_rgba(45,212,191,0.4)] transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Bilingual Loading Text */}
                    <div className="flex flex-col items-center gap-1.5 text-center">
                        <h3 className="animate-pulse text-lg font-bold tracking-tight text-brand-teal">
                            {marathiText}
                        </h3>
                        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase opacity-70">
                            {englishText}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
