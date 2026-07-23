/**
 * Builds a side-by-side comparison of two saved analyses.
 *
 * Two principles drive the shape of this module.
 *
 * First, priority: a comparison is read top-down, so rows are grouped as
 * verdict and valuation, then health and quality, then the principal risks,
 * and only then the model, period, currency and source differences that
 * qualify everything above.
 *
 * Second, honesty about comparability. Two companies valued by different
 * methods, reported in different currencies, or analysed months apart are not
 * like-for-like, and the difference between their numbers can be meaningless.
 * This module surfaces those caveats explicitly and deliberately refuses to
 * name an overall "winner" — that judgement belongs to the reader, not to a
 * subtraction.
 */

import { exchangeByCode } from "@/lib/finance/exchanges";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { formatIsoDate } from "@/lib/utils/dates";
import type { SavedAnalysisRecord } from "@/types/analysis";

/** How a value should be rendered, and how a difference in it should read. */
export type ComparisonUnit = "currency" | "percent" | "ratio" | "score" | "text";

export interface ComparisonRow {
  id: string;
  label: string;
  unit: ComparisonUnit;
  left: string;
  right: string;
  leftValue: number | null;
  rightValue: number | null;
  /** e.g. "+3.4pp", "+$12.40", "+8" — right relative to left */
  absoluteDelta: string | null;
  /** e.g. "+12.4%" — right relative to left; null when left is zero */
  relativeDelta: string | null;
  /**
   * Which side this single metric favours. Never aggregated into an overall
   * verdict: a company can win most rows and still be the worse investment.
   */
  favours: "left" | "right" | null;
  /** True when neither side has a value, so the row can be hidden */
  empty: boolean;
  /** Why this particular row may not be directly comparable */
  note?: string;
}

export interface ComparisonSection {
  id: string;
  title: string;
  description: string;
  rows: ComparisonRow[];
}

export interface ComparabilityWarning {
  id: string;
  /** "caution": read the numbers carefully. "blocking": do not subtract them. */
  level: "caution" | "blocking";
  title: string;
  detail: string;
}

export interface Comparison {
  sections: ComparisonSection[];
  warnings: ComparabilityWarning[];
}

// ── Formatting ──────────────────────────────────────────────────────────────

function formatValue(
  value: number | null,
  unit: ComparisonUnit,
  currency: string,
): string {
  if (value === null || !Number.isFinite(value)) return "—";
  switch (unit) {
    case "currency":
      return formatCurrency(value, currency);
    case "percent":
      return `${formatNumber(value, 1)}%`;
    case "score":
      return `${formatNumber(value, 0)}/100`;
    case "ratio":
      return formatNumber(value, 2);
    default:
      return String(value);
  }
}

function signed(value: number, digits: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatNumber(Math.abs(value), digits)}`;
}

function formatDelta(
  delta: number,
  unit: ComparisonUnit,
  currency: string,
): string {
  switch (unit) {
    case "currency": {
      const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
      return `${sign}${formatCurrency(Math.abs(delta), currency)}`;
    }
    // Percentages and scores differ by *points*, not by percent — saying a
    // 12% margin is "50% higher" than an 8% one invites misreading.
    case "percent":
      return `${signed(delta, 1)}pp`;
    case "score":
      return `${signed(delta, 0)}`;
    default:
      return signed(delta, 2);
  }
}

// ── Row construction ────────────────────────────────────────────────────────

interface NumericRowInput {
  id: string;
  label: string;
  unit: Exclude<ComparisonUnit, "text">;
  left: number | null;
  right: number | null;
  betterWhen: "higher" | "lower" | null;
  /** Currency-denominated rows are only differenced when both sides share one */
  currency?: { left: string; right: string };
  note?: string;
}

function numericRow(input: NumericRowInput): ComparisonRow {
  const { left, right, unit, betterWhen } = input;
  const leftCurrency = input.currency?.left ?? "USD";
  const rightCurrency = input.currency?.right ?? leftCurrency;
  const sameCurrency = leftCurrency === rightCurrency;
  const comparable = unit !== "currency" || sameCurrency;

  const bothPresent =
    left !== null && right !== null && Number.isFinite(left) && Number.isFinite(right);

  const delta = bothPresent && comparable ? right - left : null;

  /**
   * A relative difference is only meaningful on a ratio scale — a quantity
   * with a true zero where "twice as much" means something. Margin of safety
   * is not one: it is signed, and a base near zero makes the ratio explode
   * (−3% against −62% is not "1,967% worse", it is 59 points worse). Requiring
   * both sides to be strictly positive keeps this column honest.
   */
  const relative =
    delta !== null && (left as number) > 0 && (right as number) > 0
      ? (delta / (left as number)) * 100
      : null;

  let favours: ComparisonRow["favours"] = null;
  if (delta !== null && betterWhen && delta !== 0) {
    const rightIsBetter = betterWhen === "higher" ? delta > 0 : delta < 0;
    favours = rightIsBetter ? "right" : "left";
  }

  return {
    id: input.id,
    label: input.label,
    unit,
    left: formatValue(left, unit, leftCurrency),
    right: formatValue(right, unit, rightCurrency),
    leftValue: left,
    rightValue: right,
    absoluteDelta: delta !== null ? formatDelta(delta, unit, leftCurrency) : null,
    relativeDelta: relative !== null ? `${signed(relative, 1)}%` : null,
    favours,
    empty: left === null && right === null,
    note:
      input.note ??
      (unit === "currency" && !sameCurrency && bothPresent
        ? `Reported in ${leftCurrency} and ${rightCurrency}; not directly comparable.`
        : undefined),
  };
}

function textRow(
  id: string,
  label: string,
  left: string,
  right: string,
  note?: string,
): ComparisonRow {
  return {
    id,
    label,
    unit: "text",
    left: left.trim() || "—",
    right: right.trim() || "—",
    leftValue: null,
    rightValue: null,
    absoluteDelta: null,
    relativeDelta: null,
    favours: null,
    empty: !left.trim() && !right.trim(),
    note,
  };
}

function listRow(id: string, label: string, left: string[], right: string[]): ComparisonRow {
  return textRow(id, label, left.join(" • "), right.join(" • "));
}

/** "22.0% margin" / "62.0% premium" / "—", in the project's shared vocabulary. */
function formatGap(marginOfSafetyPct: number | null): string {
  const gap = describeValuationGap(marginOfSafetyPct);
  if (gap.magnitudePct === null) return "—";
  if (gap.kind === "none") return "At estimated value";
  return `${gap.display} ${gap.kind === "premium" ? "premium" : "margin"}`;
}

// ── Comparability ───────────────────────────────────────────────────────────

/** Beyond this the two analyses describe different market conditions. */
const STALE_GAP_DAYS = 30;

function daysBetween(left: string, right: string): number | null {
  const a = Date.parse(left);
  const b = Date.parse(right);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.abs(a - b) / (24 * 60 * 60 * 1000);
}

function buildWarnings(
  left: SavedAnalysisRecord,
  right: SavedAnalysisRecord,
): ComparabilityWarning[] {
  const warnings: ComparabilityWarning[] = [];
  const leftAnalysis = left.fullJson;
  const rightAnalysis = right.fullJson;

  if (leftAnalysis.currency !== rightAnalysis.currency) {
    warnings.push({
      id: "currency",
      level: "blocking",
      title: "Different reporting currencies",
      detail: `${left.ticker} is reported in ${leftAnalysis.currency} and ${right.ticker} in ${rightAnalysis.currency}. Prices and per-share values are shown in their own currency and are not subtracted; ratios, scores and percentages remain comparable.`,
    });
  }

  const leftMethod = leftAnalysis.verdict_explanation?.valuation_method;
  const rightMethod = rightAnalysis.verdict_explanation?.valuation_method;
  if (leftMethod && rightMethod && leftMethod !== rightMethod) {
    warnings.push({
      id: "method",
      level: "caution",
      title: "Valued by different models",
      detail: `${left.ticker} is valued using ${leftAnalysis.verdict_explanation!.valuation_method_label.toLowerCase()}, ${right.ticker} using ${rightAnalysis.verdict_explanation!.valuation_method_label.toLowerCase()}. Each suits its sector, but the resulting estimates of value are not like-for-like.`,
    });
  }

  const leftSector = leftAnalysis.sector;
  const rightSector = rightAnalysis.sector;
  if (leftSector && rightSector && leftSector !== rightSector) {
    warnings.push({
      id: "sector",
      level: "caution",
      title: "Different sectors",
      detail: `${leftSector} and ${rightSector} carry structurally different multiples, margins and balance-sheet norms. A higher score on one row does not make one company the better investment.`,
    });
  }

  const gap = daysBetween(left.analysisDate, right.analysisDate);
  if (gap !== null && gap > STALE_GAP_DAYS) {
    warnings.push({
      id: "dates",
      level: "caution",
      title: "Analysed at different times",
      detail: `These analyses are ${Math.round(gap)} days apart (${formatIsoDate(left.analysisDate)} and ${formatIsoDate(right.analysisDate)}). Prices, and any figure derived from them, reflect different market conditions.`,
    });
  }

  if (!leftAnalysis.verdict_explanation || !rightAnalysis.verdict_explanation) {
    const older = !leftAnalysis.verdict_explanation ? left.ticker : right.ticker;
    warnings.push({
      id: "explanation",
      level: "caution",
      title: "Incomplete verdict record",
      detail: `The analysis of ${older} predates structured verdict explanations, so its checks and valuation model cannot be compared row by row.`,
    });
  }

  return warnings;
}

// ── Assembly ────────────────────────────────────────────────────────────────

export interface BuildComparisonOptions {
  /** Drop rows where neither company has a figure */
  hideUnavailable?: boolean;
}

export function buildComparison(
  left: SavedAnalysisRecord,
  right: SavedAnalysisRecord,
  { hideUnavailable = true }: BuildComparisonOptions = {},
): Comparison {
  const l = left.fullJson;
  const r = right.fullJson;
  const currency = { left: l.currency, right: r.currency };

  const sections: ComparisonSection[] = [
    {
      id: "verdict",
      title: "Verdict and valuation",
      description: "What each analysis concluded, and the gap between price and estimated value.",
      rows: [
        textRow("verdict", "Verdict", l.final_verdict.label.replace("_", " "), r.final_verdict.label.replace("_", " ")),
        textRow("reason", "Main reason", left.verdictReason, right.verdictReason),
        textRow("one-liner", "In one line", l.final_verdict.one_line_verdict, r.final_verdict.one_line_verdict),
        numericRow({ id: "confidence", label: "Confidence", unit: "percent", left: l.final_verdict.confidence_pct, right: r.final_verdict.confidence_pct, betterWhen: "higher" }),
        numericRow({ id: "price", label: "Current price", unit: "currency", left: l.current_price, right: r.current_price, betterWhen: null, currency }),
        numericRow({ id: "intrinsic", label: "Estimated value per share", unit: "currency", left: l.intrinsic_value.blended_intrinsic_value_per_share, right: r.intrinsic_value.blended_intrinsic_value_per_share, betterWhen: null, currency }),
        {
          // Differenced as percentage points, but rendered through the shared
          // valuation-gap vocabulary so a negative figure is never mislabelled
          // as a "margin of safety".
          ...numericRow({ id: "margin", label: "Margin of safety or premium", unit: "percent", left: l.intrinsic_value.margin_of_safety_pct, right: r.intrinsic_value.margin_of_safety_pct, betterWhen: "higher" }),
          left: formatGap(l.intrinsic_value.margin_of_safety_pct),
          right: formatGap(r.intrinsic_value.margin_of_safety_pct),
        },
        numericRow({ id: "valuation-score", label: "Valuation score", unit: "score", left: l.valuation.valuation_score, right: r.valuation.valuation_score, betterWhen: "higher" }),
        numericRow({ id: "pe", label: "Price / earnings", unit: "ratio", left: l.valuation.pe, right: r.valuation.pe, betterWhen: "lower" }),
        numericRow({ id: "pb", label: "Price / book", unit: "ratio", left: l.valuation.pb, right: r.valuation.pb, betterWhen: "lower" }),
        numericRow({ id: "ps", label: "Price / sales", unit: "ratio", left: l.valuation.ps, right: r.valuation.ps, betterWhen: "lower" }),
        numericRow({ id: "ev-ebitda", label: "EV / EBITDA", unit: "ratio", left: l.valuation.ev_ebitda, right: r.valuation.ev_ebitda, betterWhen: "lower" }),
        numericRow({ id: "price-fcf", label: "Price / free cash flow", unit: "ratio", left: l.valuation.price_fcf, right: r.valuation.price_fcf, betterWhen: "lower" }),
      ],
    },
    {
      id: "fundamentals",
      title: "Financial health and business quality",
      description: "Balance-sheet resilience, and whether the business earns its cost of capital.",
      rows: [
        numericRow({ id: "health-score", label: "Financial health score", unit: "score", left: l.financial_health.health_score, right: r.financial_health.health_score, betterWhen: "higher" }),
        numericRow({ id: "debt-equity", label: "Debt / equity", unit: "ratio", left: l.financial_health.debt_equity, right: r.financial_health.debt_equity, betterWhen: "lower" }),
        numericRow({ id: "current-ratio", label: "Current ratio", unit: "ratio", left: l.financial_health.current_ratio, right: r.financial_health.current_ratio, betterWhen: "higher" }),
        numericRow({ id: "interest-cover", label: "Interest coverage", unit: "ratio", left: l.financial_health.interest_coverage, right: r.financial_health.interest_coverage, betterWhen: "higher" }),
        numericRow({ id: "fcf-consistency", label: "Cash-flow consistency", unit: "score", left: l.financial_health.fcf_consistency_score, right: r.financial_health.fcf_consistency_score, betterWhen: "higher" }),
        numericRow({ id: "quality-score", label: "Business quality score", unit: "score", left: l.business_quality.quality_score, right: r.business_quality.quality_score, betterWhen: "higher" }),
        numericRow({ id: "roe", label: "Return on equity", unit: "percent", left: l.business_quality.roe_pct, right: r.business_quality.roe_pct, betterWhen: "higher" }),
        numericRow({ id: "roic", label: "Return on invested capital", unit: "percent", left: l.business_quality.roic_pct, right: r.business_quality.roic_pct, betterWhen: "higher" }),
        numericRow({ id: "gross-margin", label: "Gross margin", unit: "percent", left: l.business_quality.gross_margin_pct, right: r.business_quality.gross_margin_pct, betterWhen: "higher" }),
        numericRow({ id: "operating-margin", label: "Operating margin", unit: "percent", left: l.business_quality.operating_margin_pct, right: r.business_quality.operating_margin_pct, betterWhen: "higher" }),
        numericRow({ id: "revenue-stability", label: "Revenue stability", unit: "score", left: l.business_quality.revenue_stability_score, right: r.business_quality.revenue_stability_score, betterWhen: "higher" }),
        numericRow({ id: "moat", label: "Moat indicators", unit: "score", left: l.business_quality.moat_score, right: r.business_quality.moat_score, betterWhen: "higher" }),
      ],
    },
    {
      id: "risks",
      title: "Principal risks",
      description: "What would have to go wrong, and what already looks wrong.",
      rows: [
        textRow("key-risk", "Key risk", l.thesis.key_risk, r.thesis.key_risk),
        listRow("red-flags", "Red flags", l.thesis.red_flags, r.thesis.red_flags),
        listRow("bear", "Bear case", l.thesis.bear_case, r.thesis.bear_case),
        listRow("bull", "Bull case", l.thesis.bull_case, r.thesis.bull_case),
      ],
    },
    {
      id: "provenance",
      title: "Model, period and sources",
      description: "The differences that qualify everything above.",
      rows: [
        textRow(
          "method",
          "Valuation model",
          l.verdict_explanation?.valuation_method_label ?? "Not recorded",
          r.verdict_explanation?.valuation_method_label ?? "Not recorded",
        ),
        textRow("analysis-date", "Analysis date", formatIsoDate(left.analysisDate), formatIsoDate(right.analysisDate)),
        textRow("currency", "Reporting currency", l.currency, r.currency),
        textRow(
          "market",
          "Market",
          exchangeByCode(left.exchange)?.name ?? left.exchange,
          exchangeByCode(right.exchange)?.name ?? right.exchange,
        ),
        textRow("sector", "Sector", l.sector ?? "", r.sector ?? ""),
        textRow(
          "sources",
          "Data sources",
          l.sources.map((source) => source.title).join(" • "),
          r.sources.map((source) => source.title).join(" • "),
        ),
      ],
    },
  ];

  return {
    sections: hideUnavailable
      ? sections.map((section) => ({
          ...section,
          rows: section.rows.filter((row) => !row.empty),
        }))
      : sections,
    warnings: buildWarnings(left, right),
  };
}

/** How many rows were dropped because neither company had a figure. */
export function countUnavailableRows(
  left: SavedAnalysisRecord,
  right: SavedAnalysisRecord,
): number {
  return buildComparison(left, right, { hideUnavailable: false })
    .sections.flatMap((section) => section.rows)
    .filter((row) => row.empty).length;
}
