import { describe, it, expect } from "vitest";

import { analyzeTicker } from "@/lib/claude/analyze-stock";
import { analysisProse, proseModelFromAnalysis } from "@/lib/finance/prose";
import { localizeVerdictExplanation } from "@/lib/finance/verdict-explanation-prose";
import { makeTranslator } from "@/lib/i18n/translate";

/**
 * Single-source guard. The result page regenerates prose from the stored
 * numbers via `proseModelFromAnalysis`; the engine stores it via
 * `proseModelFromMetrics`. In English the two must produce identical text —
 * otherwise the display has drifted from what was saved.
 */
const enT = makeTranslator("en");
const frT = makeTranslator("fr");
const TICKERS = ["AAPL", "BRK-B", "INTC", "MSFT"];

describe("analysis prose: English display regeneration matches stored strings", () => {
  for (const ticker of TICKERS) {
    it(`${ticker} regenerates identically in English`, async () => {
      const a = await analyzeTicker(ticker);
      const p = analysisProse(proseModelFromAnalysis(a), enT);

      expect(p.valuationSummary).toBe(a.valuation.summary);
      expect(p.healthSummary).toBe(a.financial_health.summary);
      expect(p.qualitySummary).toBe(a.business_quality.summary);
      expect(p.intrinsicSummary).toBe(a.intrinsic_value.summary);
      expect(p.bullCase).toEqual(a.thesis.bull_case);
      expect(p.bearCase).toEqual(a.thesis.bear_case);
      expect(p.redFlags).toEqual(a.thesis.red_flags);
      expect(p.keyRisk).toBe(a.thesis.key_risk);
      expect(p.oneLineVerdict).toBe(a.final_verdict.one_line_verdict);
      expect(p.reasoning).toBe(a.final_verdict.reasoning);

      // Verdict-explanation panel regenerates identically in English.
      const ve = localizeVerdictExplanation(a, enT);
      expect(ve).toEqual(a.verdict_explanation);
    });

    it(`${ticker} produces different, non-empty French text`, async () => {
      const a = await analyzeTicker(ticker);
      const p = analysisProse(proseModelFromAnalysis(a), frT);

      // French renders and is genuinely translated (not the English fallback).
      expect(p.valuationSummary.length).toBeGreaterThan(0);
      expect(p.valuationSummary).not.toBe(a.valuation.summary);
      expect(p.keyRisk).not.toBe(a.thesis.key_risk);
      // No unresolved dot-path keys leaked through.
      expect(p.reasoning).not.toMatch(/prose\.|bands\./);
      expect(p.intrinsicSummary).not.toMatch(/prose\.|bands\./);
    });
  }
});
