/**
 * Single source of truth for the conclusion (verdict) labels.
 *
 * P2-1: the five labels were previously ordered/ranked and their display
 * strings copied across the result page, sticky summary, screener, history and
 * compare. This module centralises the ordering and rank; the display strings
 * live once in the i18n dictionary (`verdict.*`) and are read through
 * `verdictText()`. A future rename (planned) is then a one-place change.
 *
 * The display strings themselves are intentionally unchanged in this pass
 * (Appendix D): Strong buy / Buy / Watch / Hold / Avoid.
 */
import type { VerdictLabel } from "@/types/analysis";
import type { Translator } from "@/lib/i18n/translate";

/** The five labels, ordered most → least favourable. */
export const VERDICT_LABELS: readonly VerdictLabel[] = [
  "STRONG_BUY",
  "BUY",
  "WATCH",
  "HOLD",
  "AVOID",
] as const;

/**
 * Ordinal rank, higher = more favourable. Derived from VERDICT_LABELS so the
 * order and the rank can never drift apart.
 */
export const VERDICT_RANK: Record<VerdictLabel, number> = VERDICT_LABELS.reduce(
  (acc, label, i) => {
    acc[label] = VERDICT_LABELS.length - 1 - i;
    return acc;
  },
  {} as Record<VerdictLabel, number>,
);

/** Comparator that sorts most-favourable first (Strong buy → Avoid). */
export function compareVerdictDesc(a: VerdictLabel, b: VerdictLabel): number {
  return (VERDICT_RANK[b] ?? -1) - (VERDICT_RANK[a] ?? -1);
}

/** Localised display label for a verdict — the only accessor the UI should use. */
export function verdictText(label: string, t: Translator): string {
  return t(`verdict.${label}`);
}

/** Localised one-line definition (why the label means what it means). */
export function verdictDefinition(label: string, t: Translator): string {
  return t(`verdictDef.${label}`);
}
