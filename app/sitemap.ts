import type { MetadataRoute } from "next";

import { BRAND } from "@/lib/brand";

/**
 * Served at /sitemap.xml. Lists the public, indexable pages across both zones —
 * the front door + About, the Companies workspace (/value/*), and the Funds
 * section pages (/etf/*). Per-fund detail pages (/etf/etf/[isin]) are omitted:
 * they live in the separate ETF zone and are reachable via the screener.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.4 },
    { path: "/methodology", priority: 0.6 },
    { path: "/methodology/company", priority: 0.5 },
    { path: "/data-and-coverage", priority: 0.5 },
    { path: "/value", priority: 0.9 },
    { path: "/value/screen", priority: 0.8 },
    { path: "/value/compare", priority: 0.6 },
    { path: "/etf", priority: 0.9 },
    { path: "/etf/screener", priority: 0.8 },
    { path: "/etf/compare", priority: 0.6 },
    { path: "/etf/scenarios", priority: 0.6 },
    { path: "/etf/methodology", priority: 0.5 },
    { path: "/etf/disclaimer", priority: 0.3 },
  ];
  return paths.map(({ path, priority }) => ({
    url: `${BRAND.origin}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));
}
