import type { Locale } from "@/lib/i18n/translations";
import type { VerdictLabel } from "@/types/analysis";

/** UI language → BCP-47 tag used for number grouping/decimals. */
const NUMBER_LOCALE: Record<Locale, string> = { en: "en-GB", fr: "fr-FR" };

/**
 * House currency style: ISO code + amount (e.g. "USD 1,234.56"), so it stays
 * unambiguous across markets ($ could be US/CA/AU) and consistent with the
 * screener. The decimal separator follows the UI language — pass the active
 * locale wherever it is available; the default keeps non-localised callers
 * (e.g. the CSV-export builder) in a stable English format.
 */
export function formatCurrency(
  value: number | null | undefined,
  currency = "USD",
  locale: Locale = "en",
  maximumFractionDigits = 2,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "N/A";
  }

  const amount = new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);
  return `${currency} ${amount}`;
}

/** A currency range with the ISO code stated once, e.g. "USD 24.10–28.40". */
export function formatCurrencyRange(
  low: number | null | undefined,
  high: number | null | undefined,
  currency = "USD",
  locale: Locale = "en",
  maximumFractionDigits = 2,
): string {
  if (low === null || low === undefined || !Number.isFinite(low)) return "N/A";
  if (high === null || high === undefined || !Number.isFinite(high)) return "N/A";
  const fmt = (v: number) =>
    new Intl.NumberFormat(NUMBER_LOCALE[locale], {
      minimumFractionDigits: 2,
      maximumFractionDigits,
    }).format(v);
  return `${currency} ${fmt(low)}–${fmt(high)}`;
}

export function formatPercent(
  value: number | null | undefined,
  maximumFractionDigits = 1,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "N/A";
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value)}%`;
}

export function formatNumber(
  value: number | null | undefined,
  maximumFractionDigits = 2,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

export function formatAbbreviatedNumber(
  value: number | null | undefined,
  digits = 1,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(value);
}

/** Compact, currency-aware magnitude for chart axes, e.g. "USD 1.2B". */
export function formatCompactCurrency(
  value: number | null | undefined,
  currency = "USD",
  locale: Locale = "en",
  digits = 1,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "N/A";
  }

  const amount = new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(value);
  return `${currency} ${amount}`;
}

export function verdictClasses(verdict: VerdictLabel): string {
  switch (verdict) {
    case "STRONG_BUY":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
    case "BUY":
      return "border-yellow-500/40 bg-yellow-500/10 text-yellow-200";
    case "WATCH":
      return "border-orange-500/40 bg-orange-500/10 text-orange-200";
    case "HOLD":
      return "border-zinc-500/40 bg-zinc-500/10 text-zinc-200";
    case "AVOID":
      return "border-red-500/40 bg-red-500/10 text-red-200";
    default:
      return "border-zinc-500/40 bg-zinc-500/10 text-zinc-200";
  }
}
