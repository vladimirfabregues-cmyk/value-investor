/**
 * Data-quality notes are generated in `scoring.ts` from raw statement history
 * that the saved analysis does not keep, so — unlike the rest of the prose —
 * they cannot be regenerated from the stored numbers. They are instead a small,
 * closed set of templates; this module translates a stored (English) note into
 * the active locale, preserving any interpolated figure.
 *
 * An unrecognised note (e.g. from a future engine change) is returned
 * unchanged, so the worst case is an English line, never a broken one. The
 * canonical English set is asserted in the unit tests to catch drift.
 */
import type { Translator } from "@/lib/i18n/translate";

interface NoteRule {
  test: RegExp;
  key: string;
  /** Pull interpolation vars out of the matched English note. */
  vars?: (m: RegExpMatchArray) => Record<string, string | number>;
}

const RULES: NoteRule[] = [
  { test: /^Latest free cash flow is missing\.$/, key: "dataNotes.fcfMissing" },
  { test: /^Five-year free cash flow history is thin\.$/, key: "dataNotes.fcfThin" },
  { test: /^Gross margin is not meaningful or unavailable for this business mix\.$/, key: "dataNotes.grossMargin" },
  { test: /^The latest diluted EPS is non-positive, which weakens multiple-based valuation\.$/, key: "dataNotes.epsNonPositive" },
  {
    test: /^Revenue declining at ([\d.]+)% CAGR — structural contraction risk\.$/,
    key: "dataNotes.revenueDeclining",
    vars: (m) => ({ v: m[1] }),
  },
  { test: /^Operating margin has been compressing over the past 5 years\.$/, key: "dataNotes.marginCompressing" },
  { test: /^FCF has turned negative in recent periods after being positive historically\.$/, key: "dataNotes.fcfNegative" },
  {
    test: /^Share count growing ([\d.]+)%\/yr — moderate dilution drag\.$/,
    key: "dataNotes.dilution",
    vars: (m) => ({ v: m[1] }),
  },
  { test: /^Net income runs ahead of operating cash flow — monitor earnings quality\.$/, key: "dataNotes.earningsQuality" },
];

export function translateDataQualityNote(note: string, t: Translator): string {
  for (const rule of RULES) {
    const match = note.match(rule.test);
    if (match) return t(rule.key, rule.vars?.(match));
  }
  return note;
}
