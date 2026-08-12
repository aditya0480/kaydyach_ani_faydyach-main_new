"use client";

import { useEffect } from "react";

export function BackPrevention() {
    useEffect(() => {
        // 1. BACK BUTTON PREVENTION
        // Push a state so that back button pops this state instead of going back
        window.history.pushState(null, '', window.location.href);

        const handlePopState = (_event: PopStateEvent) => {
            // If user hits back, we just push the state again to stay here
            window.history.pushState(null, '', window.location.href);
            // We can't easily show a 'confirm' dialog on back button in modern browsers 
            // without browser-specific hacks, but staying on the page is the goal.
        };

        window.addEventListener('popstate', handlePopState);

        // 2. REFRESH / RELOAD / TAB CLOSE PREVENTION
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Modern browsers require setting the returnValue to show a generic warning
            e.preventDefault();
            e.returnValue = "तुमची डाउनलोड लिंक हरवू शकते. तुम्ही खात्रीने हे पेज सोडू इच्छिता?";
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return null;
}
