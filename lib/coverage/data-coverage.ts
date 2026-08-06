/**
 * Central, typed data-coverage adapter — the single source of truth the public
 * website reads for "what the evidence covers".
 *
 * Design rules honoured here:
 *  - No counts, versions or dates are hard-coded in UI copy. Everything a card
 *    or page shows comes from this adapter.
 *  - The adapter reports only what this repository can actually attest to.
 *    Company coverage is fully known here (supported markets, data sources,
 *    valuation-model version). ETF reference/price/macro datasets, fund and
 *    exposure-group counts and the ETF dataset/methodology versions are owned
 *    by the separate Funds zone, which is their source of truth — so those
 *    fields are reported as `unavailable` with a pointer, never invented.
 *  - Freshness is cadence-aware: prices, filings and macro data update on
 *    different rhythms, so each source carries its own cadence rather than
 *    being judged against one arbitrary threshold.
 *  - A field with no known date is `null` and must render an honest fallback —
 *    it is never silently replaced with "today".
 */
import { EXCHANGES } from "@/lib/finance/exchanges";
import { VALUATION_MODEL_VERSION } from "@/lib/finance/model-version";

/** How often the underlying data naturally changes. */
export type UpdateCadence = "on-demand" | "daily" | "quarterly" | "as-filed" | "monthly" | "unknown";

/** Coverage state of a single source, in words (never colour alone). */
export type SourceStatus = "current" | "update-due" | "archived" | "unavailable";

/** Stable category ids; the UI maps these to localised labels. */
export type SourceCategory =
  | "prices"
  | "fundamentals"
  | "filings"
  | "reference"
  | "priceHistory"
  | "macro";

export interface SourceRecord {
  /** Proper-noun provider name — not translated. */
  label: string;
  category: SourceCategory;
  /** ISO date the data is current to, or null when fetched on demand / unknown. */
  asOfDate: string | null;
  cadence: UpdateCadence;
  status: SourceStatus;
  /** Category-scoped note id the UI localises; null when no note applies. */
  noteId: string | null;
}

export interface CompanyCoverage {
  /** Number of supported markets, derived from the exchange registry. */
  marketCount: number;
  /** A few representative country names (for a summary line). */
  marketExamples: string[];
  sources: SourceRecord[];
  methodologyVersion: string;
}

export interface EtfCoverage {
  /** False in the hub: these figures live in the Funds zone (source of truth). */
  available: boolean;
  fundCount: number | null;
  exposureGroupCount: number | null;
  priceHistoryCount: number | null;
  referenceAsOf: string | null;
  priceHistoryAsOf: string | null;
  macroAsOf: string | null;
  datasetVersion: string | null;
  methodologyVersion: string | null;
  sources: SourceRecord[];
  /** Where the ETF coverage figures are actually published. */
  href: string;
}

export interface DataCoverage {
  company: CompanyCoverage;
  etf: EtfCoverage;
}

/** Distinct source provider names across a set of records (order-preserving). */
export function sourceFamilies(records: SourceRecord[]): string[] {
  return [...new Set(records.map((r) => r.label))];
}

/**
 * Build the coverage snapshot. Pure and synchronous: it reads in-repo
 * registries/constants only — no database, no network — so it is safe on the
 * landing page's critical render path.
 */
export function getDataCoverage(): DataCoverage {
  const company: CompanyCoverage = {
    marketCount: EXCHANGES.length,
    marketExamples: ["United States", "United Kingdom", "France", "Germany", "Japan"],
    methodologyVersion: VALUATION_MODEL_VERSION,
    sources: [
      // Company data is pulled live at analysis time, so there is no stored
      // as-of date — cadence describes the underlying data's natural rhythm.
      {
        label: "Yahoo Finance",
        category: "prices",
        asOfDate: null,
        cadence: "daily",
        status: "current",
        noteId: "onDemand",
      },
      {
        label: "Yahoo Finance",
        category: "fundamentals",
        asOfDate: null,
        cadence: "quarterly",
        status: "current",
        noteId: "onDemand",
      },
      {
        label: "SEC EDGAR",
        category: "filings",
        asOfDate: null,
        cadence: "as-filed",
        status: "current",
        noteId: "onDemand",
      },
    ],
  };

  // ETF figures are maintained by the Funds zone; the hub does not hold them.
  const etf: EtfCoverage = {
    available: false,
    fundCount: null,
    exposureGroupCount: null,
    priceHistoryCount: null,
    referenceAsOf: null,
    priceHistoryAsOf: null,
    macroAsOf: null,
    datasetVersion: null,
    methodologyVersion: null,
    sources: [],
    href: "/etf/methodology",
  };

  return { company, etf };
}

/**
 * Locale-consistent date formatting for every coverage surface. Returns the
 * honest-fallback token when there is no date — it never substitutes today.
 */
export function formatCoverageDate(
  iso: string | null,
  locale: "en" | "fr",
  fallback: string,
): string {
  if (!iso) return fallback;
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
