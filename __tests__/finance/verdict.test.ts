import { describe, expect, it } from "vitest";

import { VERDICT_LABELS, VERDICT_RANK, compareVerdictDesc, verdictText } from "@/lib/finance/verdict";
import { makeTranslator } from "@/lib/i18n/translate";

/**
 * P2-1/P2-2 guard: the verdict order and rank come from one module, and the
 * display strings from the one dictionary.
 */
describe("verdict module", () => {
  it("orders labels most → least favourable", () => {
    expect(VERDICT_LABELS).toEqual(["STRONG_BUY", "BUY", "WATCH", "HOLD", "AVOID"]);
  });

  it("rank is higher for more favourable labels; Watch outranks Hold", () => {
    expect(VERDICT_RANK.STRONG_BUY).toBeGreaterThan(VERDICT_RANK.BUY);
    expect(VERDICT_RANK.BUY).toBeGreaterThan(VERDICT_RANK.WATCH);
    expect(VERDICT_RANK.WATCH).toBeGreaterThan(VERDICT_RANK.HOLD);
    expect(VERDICT_RANK.HOLD).toBeGreaterThan(VERDICT_RANK.AVOID);
  });

  it("compareVerdictDesc sorts most-favourable first", () => {
    const shuffled = ["AVOID", "STRONG_BUY", "HOLD", "WATCH", "BUY"] as const;
    expect([...shuffled].sort(compareVerdictDesc)).toEqual([
      "STRONG_BUY",
      "BUY",
      "WATCH",
      "HOLD",
      "AVOID",
    ]);
  });

  it("verdictText reads the display string from the dictionary (unchanged wording)", () => {
    const en = makeTranslator("en");
    const fr = makeTranslator("fr");
    expect(verdictText("STRONG_BUY", en)).toBe("Strong buy");
    expect(verdictText("WATCH", en)).toBe("Watch");
    expect(verdictText("STRONG_BUY", fr)).toBe("Achat fort");
  });
});
