import type { MetadataRoute } from "next";

import { BRAND } from "@/lib/brand";

/**
 * Served at /robots.txt. The hub owns the origin, so this governs crawling of
 * both zones (Companies at /value/*, Funds at /etf/*) and points at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BRAND.origin}/sitemap.xml`,
    host: BRAND.origin,
  };
}
