"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 600);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!visible) return null;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="fixed right-4 bottom-36 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal text-white shadow-lg transition-all hover:bg-brand-teal/90 active:scale-95 md:bottom-16"
        >
            <ChevronUp className="h-5 w-5" />
        </button>
    );
}
