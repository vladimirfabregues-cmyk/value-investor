/**
 * Single source of truth for describing the gap between market price and
 * estimated intrinsic value.
 *
 * A negative "margin of safety" is a contradiction in terms — a margin of
 * safety only exists when intrinsic value sits ABOVE the price. When the price
 * is above estimated value the correct term is a premium. This module keeps
 * that terminology consistent everywhere it is displayed.
 */

export type ValuationGapKind = "margin" | "premium" | "none";

export interface ValuationGap {
  kind: ValuationGapKind;
  /** e.g. "Margin of safety" | "Premium to estimated value" | "No margin of safety" */
  label: string;
  /** Always non-negative — the sign is carried by `kind`, not the number */
  magnitudePct: number | null;
  /** Ready-to-render value, e.g. "42.7%" or "533%" or "—" */
  display: string;
  /** Semantic tone for styling; never the sole carrier of meaning */
  tone: "positive" | "negative" | "neutral";
}

/** Below this magnitude the gap is treated as "priced at fair value". */
const NEUTRAL_BAND_PCT = 1;

/**
 * @param marginOfSafetyPct signed figure from the valuation engine, where
 *   positive means intrinsic value exceeds price.
 */
export function describeValuationGap(
  marginOfSafetyPct: number | null | undefined,
): ValuationGap {
  if (
    marginOfSafetyPct === null ||
    marginOfSafetyPct === undefined ||
    !Number.isFinite(marginOfSafetyPct)
  ) {
    return {
      kind: "none",
      label: "Margin of safety",
      magnitudePct: null,
      display: "—",
      tone: "neutral",
    };
  }

  if (Math.abs(marginOfSafetyPct) < NEUTRAL_BAND_PCT) {
    return {
      kind: "none",
      label: "Priced at estimated value",
      magnitudePct: 0,
      display: "~0%",
      tone: "neutral",
    };
  }

  const magnitude = Math.abs(marginOfSafetyPct);
  // Large gaps are noise-dominated; whole numbers read more honestly than decimals.
  const display = magnitude >= 100 ? `${Math.round(magnitude)}%` : `${magnitude.toFixed(1)}%`;

  if (marginOfSafetyPct > 0) {
    return {
      kind: "margin",
      label: "Margin of safety",
      magnitudePct: magnitude,
      display,
      tone: "positive",
    };
  }

  return {
    kind: "premium",
    label: "Premium to estimated value",
    magnitudePct: magnitude,
    display,
    tone: "negative",
  };
}

/** Compact one-line form for dense contexts (tables, history rows). */
export function formatValuationGapShort(
  marginOfSafetyPct: number | null | undefined,
): string {
  const gap = describeValuationGap(marginOfSafetyPct);
  if (gap.kind === "none") return gap.magnitudePct === null ? "—" : "At fair value";
  return gap.kind === "margin"
    ? `${gap.display} margin of safety`
    : `${gap.display} premium`;
}
