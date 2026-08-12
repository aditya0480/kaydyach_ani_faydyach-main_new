"use client";

import { Analytics } from "@vercel/analytics/next";

export function AnalyticsWrapper() {
    return (
        <Analytics
            beforeSend={(event) => {
                if (event.url.includes("/dashboard")) return null;
                if (event.url.includes("/api/")) return null;
                return event;
            }}
        />
    );
}
