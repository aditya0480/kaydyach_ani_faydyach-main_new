/**
 * Get the base URL for the application
 * Automatically handles localhost vs production
 *
 * Priority:
 * 1. Client-side: window.location.origin (always correct)
 * 2. Server-side: NEXTAUTH_URL (if set and not localhost)
 * 3. Server-side: VERCEL_URL (auto-set by Vercel on deployments)
 * 4. Server-side: NEXT_PUBLIC_APP_URL
 * 5. Hardcoded production domain
 * 6. Fallback to localhost for local dev
 */
export function getBaseUrl() {
    if (typeof window !== "undefined") {
        // Client-side — always use the browser's actual origin
        return window.location.origin;
    }

    // Server-side: prefer explicit production URL
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (nextAuthUrl && !nextAuthUrl.includes("localhost") && !nextAuthUrl.includes("127.0.0.1")) {
        return nextAuthUrl;
    }

    // Vercel auto-sets VERCEL_URL (without protocol) on all deployments
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
        return `https://${vercelUrl}`;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl && !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1")) {
        return appUrl;
    }

    // If we're clearly in production (NODE_ENV), use the known domain
    if (process.env.NODE_ENV === "production") {
        return "https://www.kaydyachaanifaydyach.com";
    }

    // Local development fallback
    return "http://127.0.0.1:2222";
}

