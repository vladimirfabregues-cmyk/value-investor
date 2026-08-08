/**
 * Display-time localisation of the stored `verdict_explanation`.
 *
 * Like the rest of the analysis prose, the panel is regenerated in the viewer's
 * language from the numbers the analysis carries — mirroring
 * `buildVerdictExplanation` — so English is unchanged and French is a faithful
 * translation. The stored hard-gate list is used only to recover which red-flag
 * caps applied (and in what order); their wording is re-rendered from the
 * dictionary.
 */
import { scoreBand } from "@/lib/finance/ratios";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import { CAP_LABELS } from "@/lib/finance/verdict-explanation";
import { proseModelFromAnalysis } from "@/lib/finance/prose";
import type { Translator } from "@/lib/i18n/translate";
import type { CheckStatus, ValueInvestingAnalysis, VerdictExplanation } from "@/types/analysis";

const CAP_LABEL_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(CAP_LABELS).map(([key, label]) => [label, key]),
);

function bandStatus(score: number): CheckStatus {
  if (score >= 70) return "pass";
  if (score >= 55) return "warn";
  return "fail";
}

function sectorWordKey(method: string): string {
  return method === "pbroe" ? "financial" : method === "nav" ? "property" : method === "ddm" ? "utility" : "operating";
}

/** Localise the cap gate names/details; the two structural gates are keyed directly. */
function localizeGate(
  gate: { name: string; detail: string },
  t: Translator,
): { name: string; detail: string } {
  if (gate.name === "Balance-sheet safety") {
    return { name: t("prose.ve.gate.balanceName"), detail: t("prose.ve.gate.balanceDetail") };
  }
  if (gate.name === "Value-trap risk") {
    return { name: t("prose.ve.gate.valueTrapName"), detail: t("prose.ve.gate.valueTrapDetail") };
  }
  const capKey = CAP_LABEL_TO_KEY[gate.name];
  if (capKey) {
    return { name: t(`caps.${capKey}.label`), detail: t(`caps.${capKey}.detail`) + t("prose.ve.gate.capSuffix") };
  }
  return gate; // unknown gate — leave as stored
}

export function localizeVerdictExplanation(
  analysis: ValueInvestingAnalysis,
  t: Translator,
): VerdictExplanation | null {
  const ve = analysis.verdict_explanation;
  if (!ve) return null;

  const m = proseModelFromAnalysis(analysis);
  const gap = describeValuationGap(m.intrinsic.margin_of_safety_pct);

  const checks: VerdictExplanation["checks"] = [
    {
      name: t("prose.ve.name.valuation"),
      status: bandStatus(m.valuation.valuation_score),
      score: Math.round(m.valuation.valuation_score),
      detail: t("prose.ve.detail.valuation", { score: Math.round(m.valuation.valuation_score) }),
    },
    {
      name: t("prose.ve.name.health"),
      status: m.flags.severeBalanceSheet ? "fail" : bandStatus(m.health.health_score),
      score: Math.round(m.health.health_score),
      detail: m.flags.severeBalanceSheet
        ? t("prose.ve.detail.healthSevere")
        : t("prose.ve.detail.health", { score: Math.round(m.health.health_score) }),
    },
    {
      name: t("prose.ve.name.quality"),
      status: m.flags.weakBusiness ? "fail" : bandStatus(m.quality.quality_score),
      score: Math.round(m.quality.quality_score),
      detail: m.flags.weakBusiness
        ? t("prose.ve.detail.qualityWeak")
        : t("prose.ve.detail.quality", { score: Math.round(m.quality.quality_score) }),
    },
    {
      name: gap.kind === "premium" ? t("prose.ve.name.premium") : t("prose.ve.name.margin"),
      status:
        gap.kind === "margin" && (gap.magnitudePct ?? 0) >= 25
          ? "pass"
          : gap.kind === "margin" || gap.kind === "none"
            ? "warn"
            : "fail",
      score: null,
      detail:
        gap.kind === "margin"
          ? t("prose.ve.detail.gapMargin", { v: gap.display })
          : gap.kind === "premium"
            ? t("prose.ve.detail.gapPremium", { v: gap.display })
            : t("prose.ve.detail.gapNone"),
    },
  ];

  const hardGates = ve.hard_gates.map((g) => localizeGate(g, t));

  // ── Plain-language explanation, reassembled in the target language ──
  const sentences: string[] = [];
  sentences.push(
    t("prose.ve.expl.composite", {
      score: ve.overall_score,
      sector: t(`prose.ve.sector.${sectorWordKey(m.intrinsic.method)}`),
    }),
  );

  if (hardGates.length > 0) {
    const first = hardGates[0];
    sentences.push(t("prose.ve.expl.gate", { gate: first.name.toLowerCase(), detail: first.detail }));
    if (hardGates.length > 1) sentences.push(t("prose.ve.expl.further", { n: hardGates.length - 1 }));
  } else {
    const failed = checks.filter((c) => c.status === "fail").map((c) => c.name.toLowerCase());
    const borderline = checks.filter((c) => c.status === "warn");
    if (failed.length > 0) {
      const key = failed.length === 1 ? "prose.ve.expl.failedOne" : "prose.ve.expl.failedOther";
      sentences.push(t(key, { names: failed.join(t("prose.ve.expl.and")) }));
    } else if (borderline.length > 0) {
      // Mirrors gateStatusClause() — a borderline component must never be
      // summarised as "all passed".
      const items = borderline.map((c) =>
        c.score !== null
          ? t("prose.ve.expl.borderlineItem", { name: c.name.toLowerCase(), score: c.score })
          : t("prose.ve.expl.borderlineItemNoScore", { name: c.name.toLowerCase() }),
      );
      sentences.push(t("prose.ve.expl.borderline", { names: items.join(t("prose.ve.expl.and")) }));
    } else {
      sentences.push(t("prose.ve.expl.allPassed"));
    }
  }

  sentences.push(
    gap.kind === "margin"
      ? t("prose.ve.expl.gapMargin", { v: gap.display })
      : gap.kind === "premium"
        ? t("prose.ve.expl.gapPremium", { v: gap.display })
        : t("prose.ve.expl.gapNone"),
  );

  return {
    final_verdict: ve.final_verdict,
    overall_score: ve.overall_score,
    valuation_method: ve.valuation_method,
    valuation_method_label: t(`methods.${ve.valuation_method}`),
    checks,
    hard_gates: hardGates,
    explanation: sentences.join(" "),
  };
}

/** Localised red-flag cap label for the screener (safe fallback for unknown caps). */
export function capLabel(cap: string, t: Translator): string {
  return cap in CAP_LABELS ? t(`caps.${cap}.label`) : cap;
}
