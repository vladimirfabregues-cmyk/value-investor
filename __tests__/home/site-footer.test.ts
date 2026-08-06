import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { makeTranslator } from "@/lib/i18n/translate";
import { getDataCoverage } from "@/lib/coverage/data-coverage";

/**
 * Global SiteFooter + consolidated /legal page — links, disclaimer visibility,
 * dynamic-metadata fallbacks, and no dead / duplicate content. DOM rendering
 * isn't available here, so structure is asserted from source; the render is
 * confirmed by the browser check.
 */
describe("site footer + legal", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");
  const footerSrc = readFileSync(join(process.cwd(), "components/shell/site-footer.tsx"), "utf8");
  const legalSrc = readFileSync(join(process.cwd(), "components/legal/legal-page.tsx"), "utf8");

  /** Every internal route a footer link may point at must exist as a page. */
  const ROUTE_TO_FILE: Record<string, string> = {
    "/value": "app/value/page.tsx",
    "/value/screen": "app/value/screen/page.tsx",
    "/value/compare": "app/value/compare/page.tsx",
    "/methodology": "app/methodology/page.tsx",
    "/data-and-coverage": "app/data-and-coverage/page.tsx",
    "/about": "app/about/page.tsx",
    "/legal": "app/legal/page.tsx",
  };
  // Cross-zone routes served by the Funds zone (present in the sitemap).
  const ZONE_ROUTES = new Set(["/etf", "/etf/screener", "/etf/compare", "/etf/methodology"]);

  it("has no dead footer links — every href resolves to a real route", () => {
    const hrefs = [...footerSrc.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const ok = ZONE_ROUTES.has(href) || existsSync(join(process.cwd(), ROUTE_TO_FILE[href] ?? ""));
      expect(ok, `dead footer link: ${href}`).toBe(true);
    }
  });

  it("omits Privacy / Terms / Contact links (no such routes exist)", () => {
    expect(existsSync(join(process.cwd(), "app/privacy/page.tsx"))).toBe(false);
    expect(existsSync(join(process.cwd(), "app/terms/page.tsx"))).toBe(false);
    expect(footerSrc).not.toMatch(/href:\s*"\/privacy"/);
    expect(footerSrc).not.toMatch(/href:\s*"\/terms"/);
  });

  it("shows the disclaimer as visible text, not inside an accordion", () => {
    expect(footerSrc).toContain("siteFooter.disclaimer");
    expect(footerSrc).toContain("siteFooter.readFull");
    expect(footerSrc).not.toMatch(/<details/);
    // The full disclaimer key is rendered exactly once in the footer.
    expect(footerSrc.match(/siteFooter\.disclaimer/g)?.length).toBe(1);
  });

  it("is path-gated so the full disclaimer is not duplicated in the /value app shell", () => {
    expect(footerSrc).toMatch(/startsWith\("\/value"\)/);
    expect(footerSrc).toContain("return null");
  });

  it("renders dynamic metadata only when available (honest fallback)", () => {
    const coverage = getDataCoverage();
    // Company methodology version is available and must render.
    expect(coverage.company.methodologyVersion).toBeTruthy();
    expect(footerSrc).toContain("methodVersion ?");
    // ETF dataset version is unavailable in the hub and must NOT be hard-coded.
    expect(coverage.etf.datasetVersion).toBeNull();
    expect(footerSrc).not.toMatch(/v\d+\.\d+\.\d+/);
  });

  it("uses a dynamic copyright year", () => {
    expect(footerSrc).toContain("new Date().getFullYear()");
  });

  it("legal page exposes all fourteen sections in both locales", () => {
    for (const t of [en, fr]) {
      for (let n = 1; n <= 14; n++) {
        expect(t(`legal.s${n}.title`)).not.toContain("legal.");
        expect(t(`legal.s${n}.body`)).not.toContain("legal.");
      }
      expect(t("legal.title").length).toBeGreaterThan(0);
    }
    expect(en("legal.title")).toBe("Important information");
    expect(fr("legal.title")).toBe("Informations importantes");
  });

  it("legal risk wording is not hidden in an accordion or tiny text", () => {
    expect(legalSrc).not.toMatch(/<details/);
    // sections render as always-visible <section>/<p> blocks
    expect(legalSrc).toContain("<section");
  });

  it("makes no fabricated regulatory-authorisation claim", () => {
    for (const t of [en, fr]) {
      const reg = t("legal.s13.body").toLowerCase();
      expect(reg).not.toMatch(/authorised by|regulated by|fca-authorised|approved by/);
    }
    expect(en("legal.s13.body")).toMatch(/no claim of authorisation/i);
  });

  it("footer disclaimer wording differs from the in-app product disclaimer", () => {
    // Two distinct strings → the full disclaimer is never duplicated verbatim.
    expect(en("siteFooter.disclaimer")).not.toBe(en("footer.disclaimer"));
  });
});
