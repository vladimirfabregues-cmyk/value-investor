/**
 * "What changed since the previous analysis" for a history entry.
 *
 * Two analyses belong to the same series only when they share a full security
 * identity — market *and* ticker. Keying on the ticker alone would happily
 * compare a London listing against an unrelated US company that happens to use
 * the same symbol.
 */

import { entrySecurityKey } from "@/lib/history/history-filters";
import { VERDICT_RANK } from "@/lib/finance/verdict";
import { makeTranslator } from "@/lib/i18n/translate";
import type { SavedAnalysisSummary, VerdictLabel } from "@/types/analysis";

/** History deltas are English-only prose; read the label from the one dict. */
const enT = makeTranslator("en");

export interface HistoryChange {
  previousId: string;
  previousVerdict: VerdictLabel;
  /** ISO timestamp of the earlier analysis */
  previousDate: string;
  verdictChanged: boolean;
  /**
   * Change in the signed margin-of-safety figure, in percentage points.
   * Positive means the security became cheaper relative to estimated value.
   * Null when either analysis lacked a figure.
   */
  marginDeltaPct: number | null;
}

/**
 * Map every entry that has an earlier analysis of the same security to what
 * changed, keyed by analysis id.
 *
 * @param items summaries in any order; sorted internally
 */
export function buildChangeIndex(
  items: SavedAnalysisSummary[],
): Map<string, HistoryChange> {
  const bySecurity = new Map<string, SavedAnalysisSummary[]>();
  for (const item of items) {
    const key = entrySecurityKey(item);
    const series = bySecurity.get(key);
    if (series) series.push(item);
    else bySecurity.set(key, [item]);
  }

  const changes = new Map<string, HistoryChange>();

  for (const series of bySecurity.values()) {
    // Newest first, so each entry's successor in the array is its predecessor
    // in time. Ties fall back to id to keep the order deterministic.
    const ordered = [...series].sort((a, b) => {
      const delta = Date.parse(b.createdAt) - Date.parse(a.createdAt);
      return delta !== 0 ? delta : a.id.localeCompare(b.id);
    });

    for (let index = 0; index < ordered.length - 1; index += 1) {
      const current = ordered[index];
      const previous = ordered[index + 1];

      changes.set(current.id, {
        previousId: previous.id,
        previousVerdict: previous.finalVerdictLabel,
        previousDate: previous.analysisDate,
        verdictChanged: previous.finalVerdictLabel !== current.finalVerdictLabel,
        marginDeltaPct:
          current.marginOfSafetyPct !== null && previous.marginOfSafetyPct !== null
            ? current.marginOfSafetyPct - previous.marginOfSafetyPct
            : null,
      });
    }
  }

  return changes;
}

export interface ChangeDescription {
  text: string;
  /** Semantic tone; never the sole carrier of meaning */
  tone: "positive" | "negative" | "neutral";
}

/** Previous-versus-current verdict, e.g. "Upgraded from Watch". */
export function describeVerdictChange(
  current: VerdictLabel,
  change: HistoryChange | undefined,
): ChangeDescription | null {
  if (!change) return null;

  if (!change.verdictChanged) {
    return { text: `Unchanged from the previous run`, tone: "neutral" };
  }

  const direction =
    VERDICT_RANK[current] > VERDICT_RANK[change.previousVerdict] ? "Upgraded" : "Downgraded";

  return {
    text: `${direction} from ${enT(`verdict.${change.previousVerdict}`)}`,
    tone: direction === "Upgraded" ? "positive" : "negative",
  };
}

/**
 * Movement in the valuation gap between runs, in percentage points.
 *
 * Deliberately silent about small drifts: a couple of points is price noise
 * between two runs, not a change worth drawing the eye to.
 */
const MATERIAL_SHIFT_PP = 2;

export function describeMarginShift(
  change: HistoryChange | undefined,
): ChangeDescription | null {
  if (!change || change.marginDeltaPct === null) return null;

  const delta = change.marginDeltaPct;
  if (Math.abs(delta) < MATERIAL_SHIFT_PP) return null;

  const magnitude = Math.abs(delta) >= 100 ? Math.round(Math.abs(delta)) : Number(Math.abs(delta).toFixed(1));

  return delta > 0
    ? { text: `${magnitude}pp cheaper against estimated value`, tone: "positive" }
    : { text: `${magnitude}pp dearer against estimated value`, tone: "negative" };
}
