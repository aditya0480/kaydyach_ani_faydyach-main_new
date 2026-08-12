/**
 * Get the base URL for the application
 * Automatically handles localhost vs production
 */
export function getBaseUrl() {
    if (typeof window !== "undefined") {
        // Client-side
        return window.location.origin;
    }

    // Server-side
    const envUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

    if (envUrl && envUrl.includes("localhost")) {
        return envUrl.replace("https://", "http://").replace("localhost", "127.0.0.1");
    }

    if (envUrl && !envUrl.includes("localhost")) {
        return "https://www.kaydyachaanifaydyach.com";
    }

    return "http://127.0.0.1:2222";
}
