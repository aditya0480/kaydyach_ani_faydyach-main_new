import { generateOgImage, OgImageSize } from '@/lib/og-utils';
import { prisma_db } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const runtime = 'nodejs';
export const alt = 'Ebook Cover';
export const size = OgImageSize;
export const contentType = 'image/png';
export const revalidate = 604800; // Cache for 1 week

// Cache the ebook data fetch for 1 hour to reduce DB hits on viral sharing
const getCachedEbook = unstable_cache(
    async (id: string) => prisma_db.ebook.findUnique({
        where: { id },
        select: { title: true, price: true, coverImage: true }
    }),
    ['ebook-og-data'],
    { revalidate: 3600 }
);

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch Ebook Data (Cached)
    const ebook = await getCachedEbook(id);


    if (!ebook) {
        return generateOgImage({
            title: 'Kaydyanch Ani Faydyach',
            subtitle: 'Legal Knowledge Center',
            tag: 'Learn & Grow'
        });
    }

    return generateOgImage({
        title: ebook.title,
        price: ebook.price,
        coverImageUrl: ebook.coverImage,
        subtitle: 'Premium Legal Guide',
        tag: 'Instant PDF Download'
    });
}

