/**
 * Display-time localisation of a built `Comparison`.
 *
 * `buildComparison` stays English — it feeds the CSV export and its unit tests,
 * which are locale-neutral. This wrapper translates the structure for the
 * screen: section titles and descriptions and row labels by their stable id,
 * the generated narrative values (verdict, reason, thesis, model) by
 * regenerating them per company through the shared prose module, and the
 * comparability warnings by re-deriving their detail from the two analyses.
 */
import { exchangeByCode } from "@/lib/finance/exchanges";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import { formatIsoDate } from "@/lib/utils/dates";
import { analysisProse, oneLineVerdictFrom, proseModelFromAnalysis, translateSector } from "@/lib/finance/prose";
import { deriveVerdictReasonToken, renderVerdictReason } from "@/lib/history/verdict-reason";
import type { Translator } from "@/lib/i18n/translate";
import type { Comparison, ComparisonRow } from "@/lib/compare/comparison";
import type { SavedAnalysisRecord, ValueInvestingAnalysis } from "@/types/analysis";

const KNOWN_SECTIONS = new Set(["verdict", "fundamentals", "risks", "provenance"]);
const KNOWN_WARNINGS = new Set(["currency", "method", "sector", "dates", "explanation"]);

/** All row ids `comparison.ts` emits — anything else falls back to its stored label. */
const KNOWN_ROWS = new Set([
  "verdict", "reason", "one-liner", "confidence", "price", "intrinsic", "margin",
  "valuation-score", "pe", "pb", "ps", "ev-ebitda", "price-fcf",
  "health-score", "debt-equity", "current-ratio", "interest-cover", "fcf-consistency",
  "quality-score", "roe", "roic", "gross-margin", "operating-margin", "revenue-stability", "moat",
  "key-risk", "red-flags", "bear", "bull",
  "method", "analysis-date", "currency", "market", "sector", "sources",
]);

function localizedGap(marginOfSafetyPct: number | null, t: Translator): string {
  const gap = describeValuationGap(marginOfSafetyPct);
  if (gap.magnitudePct === null) return "—";
  if (gap.kind === "none") return t("compare.gap.atValue");
  return t(gap.kind === "premium" ? "compare.gap.premium" : "compare.gap.margin", { v: gap.display });
}

function methodLabel(a: ValueInvestingAnalysis, t: Translator): string {
  return a.verdict_explanation ? t(`methods.${a.verdict_explanation.valuation_method}`) : t("common.notRecorded");
}

/** The generated per-company values, keyed by row id. Numeric rows aren't listed. */
function localizedValues(
  rec: SavedAnalysisRecord,
  t: Translator,
): Record<string, string> {
  const a = rec.fullJson;
  const prose = analysisProse(proseModelFromAnalysis(a), t);
  const oneLine = oneLineVerdictFrom(a.final_verdict.label, a.intrinsic_value.margin_of_safety_pct, a.company_name, t);
  return {
    verdict: t(`verdict.${a.final_verdict.label}`),
    reason: renderVerdictReason(rec.verdictReasonToken ?? deriveVerdictReasonToken(a), oneLine, t),
    "one-liner": oneLine,
    "key-risk": prose.keyRisk,
    "red-flags": prose.redFlags.join(" • "),
    bear: prose.bearCase.join(" • "),
    bull: prose.bullCase.join(" • "),
    margin: localizedGap(a.intrinsic_value.margin_of_safety_pct, t),
    method: methodLabel(a, t),
    sector: a.sector ? translateSector(a.sector, t) : "—",
  };
}

function localizeRow(
  row: ComparisonRow,
  left: Record<string, string>,
  right: Record<string, string>,
  t: Translator,
): ComparisonRow {
  const label = KNOWN_ROWS.has(row.id) ? t(`compare.rows.${row.id}`) : row.label;
  // Cross-currency note is the only note comparison.ts emits.
  const note = row.note ? t("compare.rowNote.currency", currencyVars(row)) : undefined;
  return {
    ...row,
    label,
    left: left[row.id] ?? row.left,
    right: right[row.id] ?? row.right,
    note,
  };
}

/** Pull the two currency codes back out of the stored English note. */
function currencyVars(row: ComparisonRow): Record<string, string> {
  const m = row.note?.match(/Reported in (\S+) and (\S+);/);
  return { left: m?.[1] ?? "", right: m?.[2] ?? "" };
}

function localizeWarningDetail(
  id: string,
  left: SavedAnalysisRecord,
  right: SavedAnalysisRecord,
  t: Translator,
): string | null {
  const l = left.fullJson;
  const r = right.fullJson;
  switch (id) {
    case "currency":
      return t("compare.warnings.currencyDetail", { left: left.ticker, right: right.ticker, leftCur: l.currency, rightCur: r.currency });
    case "method":
      return t("compare.warnings.methodDetail", {
        left: left.ticker,
        right: right.ticker,
        leftMethod: methodLabel(l, t).toLowerCase(),
        rightMethod: methodLabel(r, t).toLowerCase(),
      });
    case "sector":
      return t("compare.warnings.sectorDetail", {
        left: l.sector ? translateSector(l.sector, t) : "",
        right: r.sector ? translateSector(r.sector, t) : "",
      });
    case "dates": {
      const a = Date.parse(left.analysisDate);
      const b = Date.parse(right.analysisDate);
      const days = Number.isNaN(a) || Number.isNaN(b) ? 0 : Math.round(Math.abs(a - b) / 86_400_000);
      return t("compare.warnings.datesDetail", { days, left: formatIsoDate(left.analysisDate), right: formatIsoDate(right.analysisDate) });
    }
    case "explanation": {
      const older = !l.verdict_explanation ? left.ticker : right.ticker;
      return t("compare.warnings.explanationDetail", { ticker: older });
    }
    default:
      return null;
  }
}

export function localizeComparison(
  comparison: Comparison,
  left: SavedAnalysisRecord,
  right: SavedAnalysisRecord,
  t: Translator,
): Comparison {
  const leftValues = localizedValues(left, t);
  const rightValues = localizedValues(right, t);

  // Exchange (market) names are proper nouns, kept as stored.
  leftValues.market = exchangeByCode(left.exchange)?.name ?? left.exchange;
  rightValues.market = exchangeByCode(right.exchange)?.name ?? right.exchange;

  return {
    sections: comparison.sections.map((section) => ({
      ...section,
      title: KNOWN_SECTIONS.has(section.id) ? t(`compare.sections.${section.id}`) : section.title,
      description: KNOWN_SECTIONS.has(section.id) ? t(`compare.descriptions.${section.id}`) : section.description,
      rows: section.rows.map((row) => localizeRow(row, leftValues, rightValues, t)),
    })),
    warnings: comparison.warnings.map((w) => ({
      ...w,
      title: KNOWN_WARNINGS.has(w.id) ? t(`compare.warningTitles.${w.id}`) : w.title,
      detail: localizeWarningDetail(w.id, left, right, t) ?? w.detail,
    })),
  };
}
