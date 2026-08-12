import { prisma_db } from "./prisma";
import { customAlphabet } from "nanoid";

// Use a custom alphabet that is URL-friendly and readable (no confusing characters like 0/O, 1/l)
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

/**
 * Creates a short link for a given long URL
 * @param url The long URL to shorten
 * @param expiresDays Optional expiration in days
 * @returns The short code (e.g. "AB12CD34")
 */
export async function createShortLink(url: string, expiresDays: number = 30): Promise<string> {
    const shortCode = nanoid();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    await prisma_db.shortLink.create({
        data: {
            shortCode,
            url,
            expiresAt,
        },
    });

    return shortCode;
}

/**
 * Creates multiple short links in bulk
 * @param urls Array of long URLs to shorten
 * @param expiresDays Optional expiration in days
 * @returns Array of objects containing { url, shortCode }
 */
export async function createShortLinksBulk(urls: string[], expiresDays: number = 30): Promise<{ url: string; shortCode: string }[]> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    const data = urls.map(url => ({
        shortCode: nanoid(),
        url,
        expiresAt,
    }));

    if (data.length > 0) {
        await prisma_db.shortLink.createMany({
            data: data.map(d => ({ url: d.url, shortCode: d.shortCode, expiresAt: d.expiresAt })),
            skipDuplicates: true,
        });
    }

    return data.map(d => ({ url: d.url, shortCode: d.shortCode }));
}

/**
 * Resolves a short code to its original URL
 * @param shortCode The short code to resolve
 * @returns The long URL or null if not found/expired
 */
export async function resolveShortLink(shortCode: string): Promise<string | null> {
    const link = await prisma_db.shortLink.findUnique({
        where: { shortCode },
    });

    if (!link) return null;

    if (link.expiresAt && link.expiresAt < new Date()) {
        return null;
    }

    return link.url;
}
