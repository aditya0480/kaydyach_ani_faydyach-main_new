import type { MetadataRoute } from "next";
import { prisma_db } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/ebooks`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ebooks/hindi`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/ebooks/english`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/combos`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cancellation-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/shipping-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/data-deletion`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  let ebookRoutes: MetadataRoute.Sitemap = [];
  try {
    const ebooks = await prisma_db.ebook.findMany({
      where: { isEnabled: true },
      select: { id: true, updatedAt: true, coverImage: true, title: true },
      orderBy: { updatedAt: "desc" },
    });
    ebookRoutes = ebooks.map((e) => ({
      url: `${SITE_URL}/ebooks/${e.id}`,
      lastModified: e.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.85,
      images: e.coverImage ? [e.coverImage] : undefined,
    }));
  } catch {
    // DB unavailable at build — return static routes only
  }

  return [...staticRoutes, ...ebookRoutes];
}
