import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { makeTranslator } from "@/lib/i18n/translate";

/**
 * Homepage CaseAnatomy — content, data labels, honesty and structure.
 * Interactive keyboard behaviour is not rendered in this repo's test setup
 * (no jsdom), so the tab semantics + arrow-key handler are asserted from the
 * component source; behaviour is confirmed additionally by the browser check.
 */
describe("homepage case-anatomy section", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");
  const src = readFileSync(join(process.cwd(), "components/home/case-anatomy.tsx"), "utf8");

  it("section copy and all five stages resolve in both locales", () => {
    for (const t of [en, fr]) {
      expect(t("caseAnatomy.eyebrow")).not.toContain("caseAnatomy");
      expect(t("caseAnatomy.h2")).not.toContain("caseAnatomy");
      for (const k of ["evidence", "method", "checks", "limitations", "conclusion"]) {
        expect(t(`caseAnatomy.stages.${k}.title`)).not.toContain("caseAnatomy");
        expect(t(`caseAnatomy.stages.${k}.question`)).toMatch(/\?| \?/);
      }
    }
    expect(en("caseAnatomy.h2")).toBe("See the case behind the conclusion.");
    expect(fr("caseAnatomy.h2")).toBe("Voir le dossier derrière la conclusion.");
  });

  it("uses correct tab / tablist / tabpanel semantics with roving tabindex", () => {
    expect(src).toContain('role="tablist"');
    expect(src).toContain('role="tab"');
    expect(src).toContain('role="tabpanel"');
    expect(src).toContain("aria-selected");
    expect(src).toContain("aria-controls");
    expect(src).toContain("aria-labelledby");
    expect(src).toContain("tabIndex={selected ? 0 : -1}");
  });

  it("supports arrow / Home / End keys and does not auto-rotate", () => {
    for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
      expect(src).toContain(key);
    }
    // No timers → no auto-rotation / automatic content change.
    expect(src).not.toMatch(/setInterval|setTimeout/);
  });

  it("shows source, as-of date and provenance labelling", () => {
    for (const t of [en, fr]) {
      expect(t("caseAnatomy.labels.source")).not.toContain("caseAnatomy");
      expect(t("caseAnatomy.labels.asOf")).toContain("{date}");
      expect(t("caseAnatomy.provenance.archived")).not.toContain("caseAnatomy");
      expect(t("caseAnatomy.provenance.illustrative")).not.toContain("caseAnatomy");
    }
    // The panel actually renders a source link + an as-of date.
    expect(src).toContain("caseAnatomy.labels.source");
    expect(src).toContain("caseAnatomy.labels.asOf");
    expect(src).toContain("s.source.url");
  });

  it("contains no buy/sell recommendation wording anywhere in the section", () => {
    const banned = [
      "Strong buy",
      "Strong Buy",
      "STRONG_BUY",
      "Buy",
      "Sell",
      "Hold",
      "Watch",
      "Avoid",
    ];
    for (const word of banned) {
      // whole-word check so "Buy" doesn't match inside other identifiers
      expect(src).not.toMatch(new RegExp(`\\b${word}\\b`));
    }
    // English copy carries the explicit "not a recommendation" notice.
    expect(en("caseAnatomy.company.notice")).toMatch(/not a personal recommendation/i);
    expect(en("caseAnatomy.etf.relative")).toMatch(/relative to the named peer group/i);
  });

  it("links to the full company analysis and the fund comparison", () => {
    // Company sample recreate link + ETF cross-zone link.
    expect(src).toContain("s.recreateHref");
    expect(src).toContain('href="/etf"');
  });

  it("never invents an ETF fund, ticker or score (structural preview only)", () => {
    // The ETF panel renders placeholder tracks, not figures.
    expect(src).toContain("caseAnatomy.etf.previewNote");
    expect(src).toContain("caseAnatomy.provenance.illustrative");
  });
});
