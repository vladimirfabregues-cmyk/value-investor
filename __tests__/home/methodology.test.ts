import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { makeTranslator } from "@/lib/i18n/translate";
import { VALUATION_MODEL_VERSION } from "@/lib/finance/model-version";

/**
 * Homepage MethodologyPrinciples section + the unified /methodology hub —
 * content, links, dynamic version rendering and public-output hygiene. DOM
 * rendering isn't available in this repo's test setup, so component structure
 * is asserted from source; behaviour is confirmed by the browser check.
 */
describe("methodology principles + hub", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");
  const principlesSrc = readFileSync(
    join(process.cwd(), "components/home/methodology-principles.tsx"),
    "utf8",
  );
  const hubSrc = readFileSync(
    join(process.cwd(), "components/methodology/methodology-hub.tsx"),
    "utf8",
  );
  const pageSrc = readFileSync(join(process.cwd(), "app/methodology/page.tsx"), "utf8");

  it("renders all six principles with a title and body in both locales", () => {
    for (const t of [en, fr]) {
      for (const n of [1, 2, 3, 4, 5, 6]) {
        expect(t(`methodologyPrinciples.p${n}.title`)).not.toContain("methodologyPrinciples");
        expect(t(`methodologyPrinciples.p${n}.body`)).not.toContain("methodologyPrinciples");
      }
    }
    expect(en("methodologyPrinciples.h2")).toBe("Built for scrutiny, not persuasion.");
    expect(fr("methodologyPrinciples.h2")).toBe("Conçu pour l'examen critique, pas pour convaincre.");
  });

  it("the homepage CTA points at /methodology", () => {
    expect(principlesSrc).toContain('href="/methodology"');
    expect(en("methodologyPrinciples.cta")).toBe("Read the methodology");
  });

  it("the hub links to both product methodologies", () => {
    expect(hubSrc).toContain('href="/methodology/company"');
    expect(hubSrc).toContain('href="/etf/methodology"');
  });

  it("renders the company methodology version dynamically (not hard-coded)", () => {
    // The version must come from the source-of-truth constant, not a literal.
    expect(hubSrc).toContain("VALUATION_MODEL_VERSION");
    expect(hubSrc).not.toContain(`v${VALUATION_MODEL_VERSION}"`);
    expect(hubSrc).not.toMatch(/["']1\.0\.0["']/);
  });

  it("has a unique SEO title and meta description", () => {
    expect(pageSrc).toMatch(/title:\s*"Methodology/);
    expect(pageSrc).toMatch(/description:\s*"/);
  });

  it("exposes no internal developer commands in public methodology output", () => {
    const banned = [
      /npm run/i,
      /\bnpx\b/i,
      /yarn /i,
      /pnpm /i,
      /prisma\b/i,
      /db:generate/i,
      /gen-icons/i,
      /\bbacktest\b/i,
    ];
    const surfaces = [
      principlesSrc,
      hubSrc,
      pageSrc,
      // The strings that actually render to the public page:
      JSON.stringify([
        en("methodologyHub.company.body"),
        en("methodologyHub.etf.body"),
        en("methodologyHub.etf.versionNote"),
        ...["sourceDates", "missingData", "changes", "gates", "forecasts"].map((k) =>
          en(`methodologyHub.disclosures.${k}.desc`),
        ),
      ]),
    ].join("\n");
    for (const re of banned) {
      expect(surfaces).not.toMatch(re);
    }
  });
});
