/**
 * Central brand configuration — the single source of truth for The Investment
 * Casebook's name, taglines, canonical origin, SEO defaults and social links.
 * Import from here instead of hardcoding brand strings in components/metadata.
 *
 * Scope note: user-facing UI chrome that must be localised (navigation labels,
 * section titles, page copy) lives in the i18n dictionaries
 * (lib/i18n/translations.ts) — not here. This module holds brand-level
 * constants that are language-neutral (proper nouns, URLs) plus the canonical
 * EN/FR taglines and SEO defaults used in non-localised contexts (metadata).
 */
export const BRAND = {
  /** Full brand name (proper noun — identical in every language). */
  name: "The Investment Casebook",
  /** Without the leading article, for tighter contexts. */
  shortName: "Investment Casebook",
  /** Home-screen / PWA short name. */
  appShortName: "Casebook",

  /** Canonical taglines. EN/FR match the deployed chooser copy. */
  tagline: {
    en: "Every conclusion has a case.",
    fr: "Chaque conclusion a son dossier.",
  },

  /**
   * The two workspaces under the master brand. Display/section labels are
   * localised ("Companies"/"Sociétés", "Funds"/"Fonds") in the i18n
   * dictionaries; only the stable routes live here.
   */
  products: {
    companies: { path: "/value" },
    funds: { path: "/etf" },
  },

  /**
   * Permanent public origin. The hub owns the domain; the Funds zone is served
   * at /etf via a Multi-Zones rewrite. Used for metadataBase, robots, sitemap
   * and structured data.
   */
  origin: "https://value-investor-vladimirfabregues-1828s-projects.vercel.app",

  /** Legal short description — informational framing, no advice claims. */
  description:
    "Independent investment research — company analysis and ETF research, with the reasoning behind every conclusion. Informational only; not investment advice.",

  seo: {
    title: "The Investment Casebook",
    /** OG/Twitter headline: brand + tagline. */
    ogTitle: "The Investment Casebook — Every conclusion has a case.",
  },

  social: {
    linkedin: "https://www.linkedin.com/in/vladimir-fabregues/",
  },
} as const;
