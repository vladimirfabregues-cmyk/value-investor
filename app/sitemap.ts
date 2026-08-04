import type { MetadataRoute } from "next";

const SITE_ORIGIN = "https://value-investor-vladimirfabregues-1828s-projects.vercel.app";

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
    url: `${SITE_ORIGIN}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));
}
