import { SITE_URL } from "./constants/site";

export function getBaseUrl() {
    if (typeof window !== "undefined") {
        // Client-side — always use the browser's actual origin
        return window.location.origin;
    }

    // 1. Production environment: ALWAYS use canonical domain
    if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview") {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
        if (appUrl && !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1")) {
            return appUrl.replace(/\/$/, "");
        }
        return SITE_URL;
    }

    // 2. NextAuth URL (if set and not localhost)
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (nextAuthUrl && !nextAuthUrl.includes("localhost") && !nextAuthUrl.includes("127.0.0.1")) {
        return nextAuthUrl.replace(/\/$/, "");
    }

    // 3. Vercel preview branch deployment
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
        return `https://${vercelUrl}`;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl && !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1")) {
        return appUrl.replace(/\/$/, "");
    }

    // 4. Local development fallback
    return "http://127.0.0.1:2222";
}

