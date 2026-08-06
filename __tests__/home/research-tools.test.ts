import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { BRAND } from "@/lib/brand";
import { makeTranslator } from "@/lib/i18n/translate";

/**
 * Homepage "Research tools" section — content, destinations and heading
 * hierarchy. DOM/render assertions would need React Testing Library / jsdom,
 * which this repo does not use; the heading-level guard therefore reads the
 * component source (it must sit under the page <h1> as <h2>/<h3>, never <h1>).
 */
describe("homepage research-tools section", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");
  const src = readFileSync(
    join(process.cwd(), "components/home/research-tools.tsx"),
    "utf8",
  );

  it("section copy resolves in both locales", () => {
    for (const t of [en, fr]) {
      expect(t("researchTools.eyebrow")).not.toContain("researchTools");
      expect(t("researchTools.h2")).not.toContain("researchTools");
      expect(t("researchTools.lead")).not.toContain("researchTools");
    }
    expect(en("researchTools.h2")).toBe("Two questions. One standard of evidence.");
    expect(fr("researchTools.h2")).toBe("Deux questions. Une seule exigence de preuve.");
  });

  it("both cards expose label, heading, description, three points, CTA and methodology link", () => {
    for (const t of [en, fr]) {
      for (const card of ["company", "etf"] as const) {
        for (const key of [
          "label",
          "heading",
          "description",
          "point1",
          "point2",
          "point3",
          "cta",
          "methodology",
        ]) {
          const val = t(`researchTools.${card}.${key}`);
          expect(val.length).toBeGreaterThan(0);
          expect(val).not.toContain("researchTools");
        }
      }
    }
  });

  it("preview labels resolve without inventing numbers (structural only)", () => {
    for (const t of [en, fr]) {
      for (const key of ["valuation", "resilience", "earnings", "limitation"]) {
        expect(t(`researchTools.company.preview.${key}`)).not.toContain("researchTools");
      }
      for (const key of ["peerGroup", "cost", "tracking", "liquidity", "structure", "warning"]) {
        expect(t(`researchTools.etf.preview.${key}`)).not.toContain("researchTools");
      }
    }
  });

  it("destinations point at the existing entry + methodology routes", () => {
    expect(BRAND.products.companies.path).toBe("/value");
    expect(BRAND.products.funds.path).toBe("/etf");
    // Company primary → analysis entry; methodology → dedicated methodology page.
    expect(src).toContain('href="/methodology/company"');
    // ETF primary → funds zone; methodology → existing /etf/methodology route.
    expect(src).toContain("BRAND.products.funds.path}/methodology");
  });

  it("uses the section anchor and a valid heading hierarchy (h2/h3, never h1)", () => {
    expect(src).toContain('id="research-tools"');
    expect(src).toContain('id="research-tools-heading"');
    expect(src).toContain("<h2");
    expect(src).toContain("<h3");
    expect(src).not.toContain("<h1");
  });

  it("does not turn the whole card into a nested link", () => {
    // The <article> wrapper must not itself be an anchor/Link.
    expect(src).not.toMatch(/<(a|Link)[^>]*>\s*<article/);
    expect(src).toContain("<article");
  });
});
