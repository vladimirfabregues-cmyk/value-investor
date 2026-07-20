import type { VerdictLabel } from "@/types/analysis";

export function formatCurrency(
  value: number | null | undefined,
  currency = "USD",
  maximumFractionDigits = 2,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(value);
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
