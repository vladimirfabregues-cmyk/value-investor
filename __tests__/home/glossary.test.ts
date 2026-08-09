import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { makeTranslator } from "@/lib/i18n/translate";

/**
 * P2-3 / Appendix B: every term of art has a one-line definition in both
 * locales, the glossary page anchors each term, and "conclusion cap" is
 * defined at first appearance on the screener and the result page.
 */
describe("glossary + conclusion-cap affordance", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");
  const TERMS = [
    "conclusionCap",
    "marginOfSafety",
    "baseValue",
    "valueRange",
    "modelAgreement",
    "dataConfidence",
    "peerGroup",
    "justifiedPb",
    "cycleRoe",
    "normalizedEarnings",
    "grahamNumber",
    "ffo",
    "tracking",
    "structure",
  ];

  it("defines all Appendix B terms in both locales", () => {
    for (const t of [en, fr]) {
      for (const key of TERMS) {
        expect(t(`glossary.terms.${key}.term`)).not.toContain("glossary.");
        expect(t(`glossary.terms.${key}.def`).length).toBeGreaterThan(10);
      }
    }
    expect(en("glossary.terms.conclusionCap.term")).toBe("Conclusion cap");
  });

  it("the glossary page anchors conclusion-cap for deep links", () => {
    const src = readFileSync(join(process.cwd(), "components/glossary/glossary-page.tsx"), "utf8");
    expect(src).toContain('slug: "conclusion-cap"');
    expect(src).toContain('id={slug}');
  });

  it("conclusion cap is defined at first appearance on screener + result page", () => {
    const screen = readFileSync(join(process.cwd(), "components/screen/screen-view.tsx"), "utf8");
    const why = readFileSync(join(process.cwd(), "components/analysis/why-this-verdict.tsx"), "utf8");
    for (const src of [screen, why]) {
      expect(src).toContain("/glossary#conclusion-cap");
      expect(src).toContain("glossary.whatIsCap");
    }
  });
});
