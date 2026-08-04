import type { MetadataRoute } from "next";

const SITE_ORIGIN = "https://value-investor-vladimirfabregues-1828s-projects.vercel.app";

/**
 * Served at /robots.txt. The hub owns the origin, so this governs crawling of
 * both zones (Companies at /value/*, Funds at /etf/*) and points at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  };
}
