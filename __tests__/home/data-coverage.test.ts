import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { makeTranslator } from "@/lib/i18n/translate";
import {
  getDataCoverage,
  sourceFamilies,
  formatCoverageDate,
} from "@/lib/coverage/data-coverage";
import { EXCHANGES } from "@/lib/finance/exchanges";
import { VALUATION_MODEL_VERSION } from "@/lib/finance/model-version";

describe("data-coverage adapter", () => {
  const cov = getDataCoverage();

  it("counts and versions come from source-of-truth registries, not literals", () => {
    expect(cov.company.marketCount).toBe(EXCHANGES.length);
    expect(cov.company.methodologyVersion).toBe(VALUATION_MODEL_VERSION);
    // The component copy must not hard-code the count or version.
    const homeSrc = readFileSync(join(process.cwd(), "components/home/data-coverage.tsx"), "utf8");
    expect(homeSrc).not.toMatch(new RegExp(`\\b${EXCHANGES.length}\\b`));
    expect(homeSrc).not.toMatch(/["']1\.0\.0["']/);
  });

  it("ETF figures come from a dated snapshot synced from the Funds zone (P1-4)", () => {
    expect(cov.etf.available).toBe(true);
    expect(cov.etf.fundCount).toBe(54);
    expect(cov.etf.exposureGroupCount).toBe(33);
    expect(cov.etf.datasetVersion).toBe("2026.06");
    expect(cov.etf.methodologyVersion).toBe("1.0.0");
    // A snapshot is always dated — never surfaced without an as-of date.
    expect(cov.etf.priceHistoryAsOf).toBeTruthy();
    // The "-demo" placeholder must never ship in the dataset version.
    expect(cov.etf.datasetVersion).not.toContain("demo");
    expect(cov.etf.href).toMatch(/^\/etf/);
  });

  it("the homepage no longer renders the placeholder strings (P1-4)", () => {
    const homeSrc = readFileSync(join(process.cwd(), "components/home/data-coverage.tsx"), "utf8");
    expect(homeSrc).not.toContain("labels.unavailableHere");
    expect(homeSrc).not.toContain("labels.onDemand");
  });

  it("uses per-type cadences, not one global freshness threshold", () => {
    const cadences = new Set(cov.company.sources.map((s) => s.cadence));
    expect(cadences.size).toBeGreaterThan(1);
    expect(sourceFamilies(cov.company.sources)).toContain("Yahoo Finance");
    expect(sourceFamilies(cov.company.sources)).toContain("SEC EDGAR");
  });

  it("missing dates render an honest fallback, never today's date", () => {
    const today = new Date().toISOString().slice(0, 10);
    // A null date returns the given fallback token, not a substituted date.
    expect(formatCoverageDate(null, "en", "On-demand")).toBe("On-demand");
    expect(formatCoverageDate(null, "en", "On-demand")).not.toContain(today.slice(0, 4));
  });

  it("formats dates consistently per locale", () => {
    expect(formatCoverageDate("2026-04-24", "en", "—")).toBe("24 Apr 2026");
    expect(formatCoverageDate("2026-04-24", "fr", "—")).toBe("24 avr. 2026");
  });
});

describe("data-coverage content + hygiene", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");
  const homeSrc = readFileSync(join(process.cwd(), "components/home/data-coverage.tsx"), "utf8");
  const pageComp = readFileSync(join(process.cwd(), "components/coverage/coverage-page.tsx"), "utf8");
  const pageRoute = readFileSync(join(process.cwd(), "app/data-and-coverage/page.tsx"), "utf8");

  it("renders English and French labels", () => {
    expect(en("coverage.h2")).toBe("Know what the evidence covers—and what it does not.");
    expect(fr("coverage.h2")).toBe("Savoir ce que les preuves couvrent — et ce qu'elles ne couvrent pas.");
    for (const t of [en, fr]) {
      for (const key of [
        "coverage.labels.asOf",
        "coverage.labels.dataset",
        "coverage.labels.method",
        "coverage.labels.curatedCoverage",
        "coverage.cards.company",
        "coverage.cards.etf",
        "coverage.cards.sources",
        "coverage.cards.dates",
        "coverage.cards.versions",
      ]) {
        expect(t(key)).not.toContain("coverage.");
      }
    }
  });

  it("all nine coverage-page sections resolve in both locales", () => {
    const sections = [
      "whatCovered",
      "companySources",
      "etfSources",
      "cadence",
      "curatedVsLive",
      "missingData",
      "limitations",
      "versions",
      "verification",
    ];
    for (const t of [en, fr]) {
      for (const s of sections) {
        expect(t(`coverage.page.${s}.title`)).not.toContain("coverage.page");
        expect(t(`coverage.page.${s}.body`)).not.toContain("coverage.page");
      }
    }
  });

  it("uses text status, not a glowing green 'live' indicator", () => {
    // Status is textual; no green/emerald fill and no animated pulsing dot.
    for (const src of [homeSrc, pageComp]) {
      expect(src).not.toMatch(/bg-(emerald|green)-\d/);
      expect(src).not.toMatch(/animate-pulse/);
    }
    // Explicit labels are present in the dictionary.
    expect(en("coverage.labels.asOf")).toBe("As of");
    expect(en("coverage.labels.curatedCoverage")).toBe("Curated coverage");
  });

  it("exposes no internal developer commands in public coverage output", () => {
    const publicText = [
      en("coverage.page.companySources.body"),
      en("coverage.page.cadence.body"),
      en("coverage.page.versions.body"),
      en("coverage.page.verification.body"),
      fr("coverage.page.verification.body"),
    ].join("\n");
    const surfaces = [homeSrc, pageComp, pageRoute, publicText].join("\n");
    for (const re of [/npm run/i, /\bnpx\b/i, /prisma\b/i, /db:generate/i, /gen-icons/i, /\bbacktest\b/i, /\.env\b/i]) {
      expect(surfaces).not.toMatch(re);
    }
  });

  it("has a unique SEO title and description", () => {
    expect(pageRoute).toMatch(/title:\s*"Data and coverage/);
    expect(pageRoute).toMatch(/description:\s*"/);
  });
});
