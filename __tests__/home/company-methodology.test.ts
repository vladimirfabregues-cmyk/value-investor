import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { makeTranslator } from "@/lib/i18n/translate";
import { VALUATION_MODEL_VERSION } from "@/lib/finance/model-version";

/**
 * Standalone company-methodology page (/methodology/company). Confirms it
 * explains the scoring process in both locales, renders the version from the
 * source-of-truth constant, links nowhere developer-facing, and issues no
 * buy/sell recommendation.
 */
describe("company methodology page", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");
  const compSrc = readFileSync(
    join(process.cwd(), "components/methodology/company-methodology.tsx"),
    "utf8",
  );
  const pageSrc = readFileSync(join(process.cwd(), "app/methodology/company/page.tsx"), "utf8");

  it("explains the four-stage scoring process in both locales", () => {
    for (const t of [en, fr]) {
      for (const key of [
        "companyMethodology.intro",
        "companyMethodology.models.title",
        "companyMethodology.checks.title",
        "companyMethodology.gates.title",
        "companyMethodology.conclusion.title",
        "companyMethodology.provenance.title",
      ]) {
        expect(t(key)).not.toContain("companyMethodology");
        expect(t(key).length).toBeGreaterThan(0);
      }
      // Each valuation model and each check resolves.
      for (const k of ["dcf", "pb", "nav", "ddm"]) {
        expect(t(`companyMethodology.models.${k}.term`)).not.toContain("companyMethodology");
      }
      for (const k of ["resilience", "earnings", "quality"]) {
        expect(t(`companyMethodology.checks.${k}.term`)).not.toContain("companyMethodology");
      }
    }
    expect(en("companyMethodology.title")).toBe("How company analysis works");
    expect(fr("companyMethodology.title")).toBe("Comment fonctionne l'analyse de société");
  });

  it("renders the model version dynamically (not hard-coded)", () => {
    expect(compSrc).toContain("VALUATION_MODEL_VERSION");
    expect(compSrc).not.toMatch(/["']1\.0\.0["']/);
    // sanity: the source-of-truth constant is a semver string
    expect(VALUATION_MODEL_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("has a unique SEO title and description", () => {
    expect(pageSrc).toMatch(/title:\s*"How company analysis works/);
    expect(pageSrc).toMatch(/description:\s*"/);
  });

  it("issues no buy/sell recommendation and no developer commands", () => {
    const publicText = [
      en("companyMethodology.conclusion.body"),
      fr("companyMethodology.conclusion.body"),
      en("companyMethodology.gates.items"),
      en("companyMethodology.provenance.body"),
    ].join("\n");
    for (const word of ["Strong buy", "STRONG_BUY", "\\bBuy\\b", "\\bSell\\b", "\\bHold\\b"]) {
      expect(publicText).not.toMatch(new RegExp(word));
    }
    // Conclusion explicitly frames output as an assessment, not an instruction.
    expect(en("companyMethodology.conclusion.body")).toMatch(/never an instruction to buy or sell/i);
    for (const re of [/npm run/i, /\bnpx\b/i, /prisma\b/i, /gen-icons/i, /\bbacktest\b/i]) {
      expect(compSrc + pageSrc + publicText).not.toMatch(re);
    }
  });
});
