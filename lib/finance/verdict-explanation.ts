/**
 * Builds the single authoritative explanation of how a verdict was reached.
 *
 * Presentation layers must render this object rather than re-deriving verdict
 * logic. That is what keeps the badge, the scores, the checks and the prose
 * from contradicting one another.
 */

import type { ValueMetricsResult } from "@/types/finance";
import type { VerdictExplanation, VerdictCheck } from "@/types/analysis";
import { describeValuationGap } from "@/lib/finance/valuation-gap";

/** Human-readable meaning of each red flag that can cap a verdict. */
export const CAP_LABELS: Record<string, string> = {
  peak_earnings: "Earnings at a cyclical peak",
  declining_revenue: "Revenue in structural decline",
  microcap_illiquidity: "Micro-cap — the screen price is not realisable in size",
  recent_ipo: "Listed under two years",
  heavy_dilution: "Heavy share issuance (over 8% a year)",
  poor_earnings_quality: "Earnings not backed by operating cash",
  unsustainable_dividend: "Dividend exceeds earnings",
  insufficient_data_quality: "Too many gaps in the underlying data",
  uncorroborated_valuation: "Only one valuation model supports this value",
};

/** Why each cap matters, in plain language. */
const CAP_DETAIL: Record<string, string> = {
  peak_earnings:
    "Trailing earnings are more than 1.4× their five-year average, so today's low multiple is likely to normalise upward as earnings fall back.",
  declining_revenue:
    "Revenue has been shrinking, so a low price may reflect a contracting business rather than a bargain.",
  microcap_illiquidity:
    "The company is too small for the quoted price to be achievable in any meaningful size.",
  recent_ipo:
    "There is no full cycle of public history, and insiders chose to list at around this price.",
  heavy_dilution:
    "Share count is growing fast enough to erode per-share value even if the business grows.",
  poor_earnings_quality:
    "Reported profits persistently exceed operating cash flow, a common precursor to write-downs.",
  unsustainable_dividend:
    "The dividend is not covered by earnings, so the payout that underpins the valuation is at risk.",
  insufficient_data_quality:
    "Key figures are missing, so the valuation rests on too little evidence.",
  uncorroborated_valuation:
    "A second, independent valuation method does not agree, so the estimate is not corroborated.",
};

const VALUATION_METHOD_LABEL: Record<string, string> = {
  dcf: "Discounted cash flow, cross-checked against the Graham number",
  nav: "Net asset value (book value ≈ NAV), blended with an FFO capitalisation",
  ddm: "Dividend discount model (Gordon growth)",
  pbroe: "Justified price-to-book from cycle-average return on equity",
};

function bandStatus(score: number): VerdictCheck["status"] {
  if (score >= 70) return "pass";
  if (score >= 55) return "warn";
  return "fail";
}

function statusWord(status: VerdictCheck["status"]): string {
  return status === "pass" ? "Passed" : status === "warn" ? "Borderline" : "Failed";
}

export function buildVerdictExplanation(m: ValueMetricsResult): VerdictExplanation {
  const gap = describeValuationGap(m.intrinsic_value.margin_of_safety_pct);

  // ── Component checks ─────────────────────────────────────────────────────
  const checks: VerdictCheck[] = [
    {
      name: "Valuation",
      status: bandStatus(m.valuation.valuation_score),
      score: Math.round(m.valuation.valuation_score),
      detail: `Scores ${Math.round(m.valuation.valuation_score)}/100 on earnings, book value, sales and cash-flow multiples.`,
    },
    {
      name: "Financial health",
      status: m.financial_health.severe_balance_sheet_weakness
        ? "fail"
        : bandStatus(m.financial_health.health_score),
      score: Math.round(m.financial_health.health_score),
      detail: m.financial_health.severe_balance_sheet_weakness
        ? "Severe balance-sheet weakness: leverage, liquidity or interest cover breached the safety threshold for this sector."
        : `Scores ${Math.round(m.financial_health.health_score)}/100 on leverage, liquidity, interest cover and cash-flow consistency.`,
    },
    {
      name: "Business quality",
      status: m.business_quality.weak_business_profile
        ? "fail"
        : bandStatus(m.business_quality.quality_score),
      score: Math.round(m.business_quality.quality_score),
      detail: m.business_quality.weak_business_profile
        ? "Weak business profile: returns on capital and operating margin are below the level that supports durable compounding."
        : `Scores ${Math.round(m.business_quality.quality_score)}/100 on returns on capital, margins, stability and moat indicators.`,
    },
    {
      name: gap.kind === "premium" ? "Premium to estimated value" : "Margin of safety",
      status:
        gap.kind === "margin" && (gap.magnitudePct ?? 0) >= 25
          ? "pass"
          : gap.kind === "margin"
            ? "warn"
            : gap.kind === "none"
              ? "warn"
              : "fail",
      score: null,
      detail:
        gap.kind === "margin"
          ? `Estimated value is ${gap.display} above the market price.`
          : gap.kind === "premium"
            ? `The market price is ${gap.display} above estimated value, so there is no downside cushion.`
            : "The market price sits at roughly the estimated value.",
    },
  ];

  // ── Hard gates that override the composite score ─────────────────────────
  const hardGates: VerdictExplanation["hard_gates"] = [];

  if (m.financial_health.severe_balance_sheet_weakness) {
    hardGates.push({
      name: "Balance-sheet safety",
      detail:
        "Leverage, liquidity or interest cover breached the threshold considered safe for this sector. This overrides the composite score and forces an Avoid.",
    });
  }
  if (m.diagnostics.value_trap_risk) {
    hardGates.push({
      name: "Value-trap risk",
      detail:
        "The company looks cheap while earnings or cash flow are negative and business quality is weak — the classic value trap. This overrides the composite score and forces an Avoid.",
    });
  }
  for (const cap of m.diagnostics.verdict_caps ?? []) {
    hardGates.push({
      name: CAP_LABELS[cap] ?? cap,
      detail:
        (CAP_DETAIL[cap] ?? "This red flag caps the verdict.") +
        " The verdict is capped at Watch regardless of the composite score.",
    });
  }

  // ── Plain-language explanation ───────────────────────────────────────────
  const overall = Math.round(m.composite_score);
  const failed = checks.filter((c) => c.status === "fail").map((c) => c.name.toLowerCase());
  const sentences: string[] = [];

  sentences.push(
    `The composite score is ${overall}/100, weighted for the ${
      m.intrinsic_value.intrinsic_method === "pbroe"
        ? "financial"
        : m.intrinsic_value.intrinsic_method === "nav"
          ? "property"
          : m.intrinsic_value.intrinsic_method === "ddm"
            ? "utility"
            : "operating-company"
    } sector this business belongs to.`,
  );

  if (hardGates.length > 0) {
    const overriding = hardGates[0];
    sentences.push(
      `However, ${overriding.name.toLowerCase()} triggered a hard gate, which takes precedence over the composite score. ${overriding.detail}`,
    );
    if (hardGates.length > 1) {
      sentences.push(`A further ${hardGates.length - 1} red flag(s) also applied.`);
    }
  } else if (failed.length > 0) {
    sentences.push(`No hard gate was triggered, but ${failed.join(" and ")} did not pass.`);
  } else {
    sentences.push("Every component check passed and no red flag was triggered.");
  }

  sentences.push(
    gap.kind === "margin"
      ? `Estimated value is ${gap.display} above the current price.`
      : gap.kind === "premium"
        ? `The price stands ${gap.display} above estimated value, so the verdict cannot rely on a valuation cushion.`
        : "The price is close to estimated value.",
  );

  return {
    final_verdict: m.suggested_verdict,
    overall_score: overall,
    valuation_method: m.intrinsic_value.intrinsic_method,
    valuation_method_label:
      VALUATION_METHOD_LABEL[m.intrinsic_value.intrinsic_method] ?? "Discounted cash flow",
    checks,
    hard_gates: hardGates,
    explanation: sentences.join(" "),
  };
}
