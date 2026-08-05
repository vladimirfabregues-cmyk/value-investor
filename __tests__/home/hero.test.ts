import { describe, expect, it } from "vitest";

import { BRAND } from "@/lib/brand";
import { makeTranslator } from "@/lib/i18n/translate";

/**
 * Homepage hero — content + destination guards. DOM/responsive-order assertions
 * would need a component-rendering harness (React Testing Library / jsdom),
 * which this repo does not use; those are covered by manual browser checks.
 */
describe("homepage hero", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");

  it("H1 is the tagline in both locales", () => {
    expect(en("hero.h1")).toBe("Every conclusion has a case.");
    expect(fr("hero.h1")).toBe("Chaque conclusion s'appuie sur un dossier.");
  });

  it("micro-disclaimer states the risk in both locales", () => {
    expect(en("hero.microDisclaimer")).toContain("Capital at risk");
    expect(fr("hero.microDisclaimer")).toContain("Capital à risque");
  });

  it("CTAs point at the existing product entry routes", () => {
    // Primary → company analysis; secondary → ETF research. The hero links use
    // these same constants, so this pins both CTA destinations.
    expect(BRAND.products.companies.path).toBe("/value");
    expect(BRAND.products.funds.path).toBe("/etf");
  });

  it("case-file chapters resolve (evidence → conclusion, no unresolved keys)", () => {
    for (const chapter of ["evidence", "method", "checks", "limitations", "conclusion"]) {
      expect(en(`hero.caseFile.${chapter}.title`)).not.toContain("hero.caseFile");
      expect(fr(`hero.caseFile.${chapter}.title`)).not.toContain("hero.caseFile");
    }
  });
});
