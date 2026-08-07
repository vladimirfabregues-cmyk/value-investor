import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { makeTranslator } from "@/lib/i18n/translate";

/**
 * Global SiteHeader — nav destinations, path-gating, and mobile-menu a11y.
 * DOM rendering isn't available here, so structure is asserted from source;
 * behaviour is confirmed by the browser check.
 */
describe("global site header", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");
  const src = readFileSync(join(process.cwd(), "components/shell/site-header.tsx"), "utf8");

  const ROUTE_TO_FILE: Record<string, string> = {
    "/value": "app/value/page.tsx",
    "/value/compare": "app/value/compare/page.tsx",
    "/methodology": "app/methodology/page.tsx",
    "/about": "app/about/page.tsx",
  };
  const ZONE_ROUTES = new Set(["/etf"]);

  it("nav labels resolve in both locales", () => {
    for (const t of [en, fr]) {
      for (const k of ["stocks", "etfs", "methodology", "about"]) {
        expect(t(`siteNav.${k}`)).not.toContain("siteNav");
      }
    }
    expect(en("siteNav.stocks")).toBe("Stocks");
    expect(fr("siteNav.stocks")).toBe("Actions");
  });

  it("has no dead nav links — every href resolves to a real route", () => {
    const hrefs = [...src.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(["/value", "/etf", "/methodology", "/about"]);
    for (const href of hrefs) {
      const ok = ZONE_ROUTES.has(href) || existsSync(join(process.cwd(), ROUTE_TO_FILE[href] ?? ""));
      expect(ok, `dead nav link: ${href}`).toBe(true);
    }
  });

  it("is path-gated off the /value app workspace (which has its own topbar)", () => {
    expect(src).toMatch(/startsWith\("\/value"\)/);
    expect(src).toContain("return null");
  });

  it("mobile menu uses accessible trigger semantics and Escape-to-close", () => {
    expect(src).toContain("aria-expanded={open}");
    expect(src).toContain('aria-controls="site-mobile-menu"');
    expect(src).toContain('id="site-mobile-menu"');
    expect(src).toContain('e.key === "Escape"');
  });

  it("carries a labelled EN/FR control (not colour-alone, not flags)", () => {
    expect(src).toContain("aria-pressed={active}");
    expect(src).toContain('t("language.change")');
    expect(src).not.toMatch(/🇬🇧|🇫🇷/);
  });
});
