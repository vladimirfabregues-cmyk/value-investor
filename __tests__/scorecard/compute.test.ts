import { describe, it, expect } from "vitest";

import { computeScorecard, spearman, type ScoreRow } from "@/lib/scorecard/compute";

const row = (over: Partial<ScoreRow>): ScoreRow => ({
  ticker: "T0", index: "SP500", at: "2026-06-01T10:00:00Z", verdict: "HOLD", score: 50, price: 100, caps: null,
  valuationScore: null, healthScore: null, qualityScore: null, moatScore: null, fairValue: null, ...over,
});

/** 30 names in one index; names with a higher score rise more over four weeks. */
function market(): ScoreRow[] {
  const rows: ScoreRow[] = [];
  for (let i = 0; i < 30; i++) {
    const verdict = i >= 25 ? "BUY" : i < 5 ? "AVOID" : "HOLD";
    const caps = i === 26 ? "peak_earnings" : null;
    rows.push(row({ ticker: `T${i}`, verdict, score: i, caps, fairValue: verdict === "BUY" ? 200 : null }));
    rows.push(row({ ticker: `T${i}`, verdict, score: i, at: "2026-06-29T10:00:00Z", price: 100 + i }));
  }
  return rows;
}

describe("spearman", () => {
  it("is +1 for the same order and −1 for the reverse", () => {
    expect(spearman([1, 2, 3, 4], [10, 20, 30, 40])).toBeCloseTo(1, 9);
    expect(spearman([1, 2, 3, 4], [4, 3, 2, 1])).toBeCloseTo(-1, 9);
  });
});

describe("computeScorecard", () => {
  const card = computeScorecard(market());
  const four = card.horizons.find((h) => h.weeks === 4)!;

  it("grades ratings against the same week's index average", () => {
    const by = Object.fromEntries(four.byVerdict.map((v) => [v.verdict, v]));
    expect(four.observations).toBe(30);
    expect(by.BUY.n).toBe(5);
    expect(by.BUY.meanExcess).toBeCloseTo(0.27 - 0.145, 9); // avg of 25..29 vs avg of 0..29, in %
    expect(by.AVOID.meanExcess).toBeLessThan(0);
    expect(by.BUY.hitRate).toBe(1);
    expect(four.scoreIc).toEqual({ mean: 1, cohorts: 1 });
  });

  it("reads red flags against unflagged names with the same rating", () => {
    const flag = four.flags.find((f) => f.flag === "peak_earnings")!;
    expect(flag.n).toBe(1);
    expect(flag.difference).toBeCloseTo(0.26 - (0.25 + 0.27 + 0.28 + 0.29) / 4, 9);
  });

  it("measures how much of the fair-value gap closed", () => {
    expect(four.fairValue.n).toBe(5);
    expect(four.fairValue.medianGapClosed).toBeCloseTo(0.27, 9); // +27 of a 100 gap
  });

  it("drops groups too small to average and implausible price jumps", () => {
    const small = computeScorecard(market().filter((r) => Number(r.ticker.slice(1)) < 10));
    expect(small.horizons[0].observations).toBe(0);
    const glitch = computeScorecard([...market(), row({ ticker: "X" }), row({ ticker: "X", at: "2026-06-29T10:00:00Z", price: 10_000 })]);
    expect(glitch.badPrices).toBe(1);
  });
});
