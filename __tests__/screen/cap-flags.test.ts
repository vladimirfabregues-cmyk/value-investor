import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { makeTranslator } from "@/lib/i18n/translate";

/**
 * P1-2 guard. The cap badge must render the count exactly once. The bug was a
 * visible (aria-hidden) digit sitting beside an sr-only sentence that also
 * started with the digit, so the text/accessibility tree read "11 conclusion
 * cap: …".
 */
describe("screener cap flags", () => {
  const en = makeTranslator("en");
  const fr = makeTranslator("fr");
  const src = readFileSync(join(process.cwd(), "components/screen/screen-view.tsx"), "utf8");

  it("the cap sentence leads with the count exactly once (1, 2, 3 caps)", () => {
    const cases = [
      { n: 1, list: "Earnings at a cyclical peak", key: "screen.cappedCountOne" },
      { n: 2, list: "Revenue in structural decline · Too many gaps", key: "screen.cappedCountOther" },
      { n: 3, list: "A · B · C", key: "screen.cappedCountOther" },
    ];
    for (const { n, list, key } of cases) {
      const s = en(key, { n, list });
      // starts with the count, and the count digit appears only once
      expect(s.startsWith(`${n} `)).toBe(true);
      expect((s.match(new RegExp(`\\b${n}\\b`, "g")) ?? []).length).toBe(1);
    }
    expect(fr("screen.cappedCountOne", { n: 1, list: "X" })).toContain("1 ");
  });

  it("the badge no longer pairs an aria-hidden digit with an sr-only count", () => {
    const cap = src.slice(src.indexOf("function CapFlags"), src.indexOf("function VerdictBadge"));
    expect(cap).toContain("aria-label={label}");
    // No sr-only count duplicate inside the badge markup.
    expect(cap).not.toContain('className="sr-only"');
    expect(cap).not.toContain('aria-hidden="true">{list.length}');
  });
});
