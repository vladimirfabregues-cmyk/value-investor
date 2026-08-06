import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { BRAND } from "@/lib/brand";
import { makeTranslator } from "@/lib/i18n/translate";

/**
 * Homepage FinalCta — copy, CTA destinations and tone guards. DOM rendering
 * isn't available in this repo's test setup, so destinations are asserted from
 * source; the render is confirmed by the browser check.
 */
describe("homepage final-cta section", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");
  const src = readFileSync(join(process.cwd(), "components/home/final-cta.tsx"), "utf8");

  it("renders the copy in both locales", () => {
    expect(en("finalCta.h2")).toBe("Start with a question. Leave with a case.");
    expect(fr("finalCta.h2")).toBe("Commencez par une question. Repartez avec un dossier.");
    for (const t of [en, fr]) {
      for (const k of ["body", "ctaCompany", "ctaEtf"]) {
        expect(t(`finalCta.${k}`)).not.toContain("finalCta");
        expect(t(`finalCta.${k}`).length).toBeGreaterThan(0);
      }
    }
  });

  it("uses the same destinations as the hero / product-pathway CTAs", () => {
    expect(BRAND.products.companies.path).toBe("/value");
    expect(BRAND.products.funds.path).toBe("/etf");
    expect(src).toContain("BRAND.products.companies.path");
    expect(src).toContain("BRAND.products.funds.path");
  });

  it("renders no email-capture or newsletter form", () => {
    // Structural: no form, no inputs — this is a two-link CTA, nothing else.
    expect(src).not.toMatch(/<form\b/);
    expect(src).not.toMatch(/<input\b/);
    expect(src).not.toMatch(/type=["']email["']/);
  });

  it("uses no scarcity or hype wording in the rendered copy", () => {
    // Scan the copy that actually renders (not the file's own comments).
    const copy = [
      en("finalCta.h2"),
      en("finalCta.body"),
      en("finalCta.ctaCompany"),
      en("finalCta.ctaEtf"),
      fr("finalCta.h2"),
      fr("finalCta.body"),
      fr("finalCta.ctaCompany"),
      fr("finalCta.ctaEtf"),
    ].join("\n");
    const banned = [
      /subscribe/i,
      /newsletter/i,
      /limited time/i,
      /act now/i,
      /don'?t miss/i,
      /start winning/i,
      /find the next winner/i,
      /beat the market/i,
    ];
    for (const re of banned) {
      expect(copy).not.toMatch(re);
    }
  });

  it("sits before the page foot on the homepage", () => {
    const page = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
    expect(page).toContain("<FinalCta />");
    expect(page.indexOf("<FinalCta />")).toBeLessThan(page.indexOf('href="/about"'));
  });
});
