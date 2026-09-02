import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/auth/", "/_next/", "/my-books/"],
      },
      {
        userAgent: [
          "Bytespider",
          "CCBot",
          "Claude-Web",
          "Amazonbot",
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
          "PetalBot",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
