import { describe, it, expect } from "vitest";

import { computeScorecard, findVanished, spearman, type Fate, type ScoreRow } from "@/lib/scorecard/compute";

const row = (over: Partial<ScoreRow>): ScoreRow => ({
  ticker: "T0", index: "SP500", at: "2026-06-01T10:00:00Z", verdict: "HOLD", score: 50, price: 100, caps: null,
  valuationScore: null, healthScore: null, qualityScore: null, moatScore: null, fairValue: null,
  dividendYield: null, marginOfSafety: null, sector: null, ...over,
});

const weekAt = (w: number) => new Date(Date.parse("2026-06-01T10:00:00Z") + w * 7 * 86_400_000).toISOString();

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
    expect(by.BUY.meanExcess).toBeCloseTo(0.27 - 0.145, 9);
    expect(by.AVOID.meanExcess).toBeLessThan(0);
    expect(by.BUY.hitRate).toBe(1);
    expect(four.scoreIc).toEqual({ mean: 1, cohorts: 1 });
    expect(four.outcomes.snapshot).toBe(30);
  });

  it("reads red flags against unflagged names with the same rating", () => {
    const flag = four.flags.find((f) => f.flag === "peak_earnings")!;
    expect(flag.n).toBe(1);
    expect(flag.difference).toBeCloseTo(0.26 - (0.25 + 0.27 + 0.28 + 0.29) / 4, 9);
  });

  it("measures how much of the fair-value gap closed", () => {
    expect(four.fairValue.n).toBe(5);
    expect(four.fairValue.medianGapClosed).toBeCloseTo(0.27, 9);
  });

  it("drops groups too small to average and implausible price jumps", () => {
    const small = computeScorecard(market().filter((r) => Number(r.ticker.slice(1)) < 10));
    expect(small.horizons[0].observations).toBe(0);
    const glitch = computeScorecard([...market(), row({ ticker: "X" }), row({ ticker: "X", at: "2026-06-29T10:00:00Z", price: 10_000 })]);
    expect(glitch.badPrices).toBe(1);
  });

  it("adds the recorded dividend yield over the horizon", () => {
    const flat = (ticker: string, dividendYield: number | null) => [
      row({ ticker, dividendYield }),
      row({ ticker, dividendYield, at: "2026-06-29T10:00:00Z" }),
    ];
    const rows = [...Array.from({ length: 20 }, (_, i) => flat(`N${i}`, null)).flat(), ...flat("PAYER", 0.052)];
    const payer = computeScorecard(rows).horizons[0].byVerdict.find((v) => v.verdict === "HOLD")!;
    expect(payer.n).toBe(21);
    const c = computeScorecard(rows).cases;
    expect(c).toBeNull(); // too few observations for case lists
    // The payer earned 0.4% in dividends over four weeks; the others nothing.
    const withDiv = computeScorecard(rows.map((r) => (r.ticker === "PAYER" ? { ...r, verdict: "BUY" } : r)));
    expect(withDiv.horizons[0].byVerdict.find((v) => v.verdict === "BUY")!.meanExcess).toBeCloseTo(0.004 * (20 / 21), 9);
  });
});

describe("companies that stop being rated", () => {
  /** 25 names rated weekly for 7 weeks; GONE is rated only in weeks 0 and 1. */
  function history(): ScoreRow[] {
    const rows: ScoreRow[] = [];
    for (let w = 0; w < 7; w++) {
      for (let i = 0; i < 25; i++) rows.push(row({ ticker: `T${i}`, at: weekAt(w) }));
      if (w <= 1) rows.push(row({ ticker: "GONE", verdict: "BUY", at: weekAt(w), price: w === 0 ? 100 : 90 }));
    }
    return rows;
  }

  it("spots them once their index has run three times without them", () => {
    expect(findVanished(history())).toEqual([{ ticker: "GONE", lastRated: weekAt(1).slice(0, 10), lastPrice: 90, peakPrice: 100 }]);
    expect(findVanished(history().filter((r) => r.at < weekAt(4)))).toEqual([]);
  });

  const buyOutcome = (fates: Map<string, Fate>) => {
    const four = computeScorecard(history(), fates).horizons[0];
    return { four, buy: four.byVerdict.find((v) => v.verdict === "BUY")! };
  };

  it("counts them as missing until their fate is known", () => {
    const { four, buy } = buyOutcome(new Map());
    expect(buy.n).toBe(0);
    expect(four.outcomes.missing).toBe(2);
  });

  it("treats a failure as a total loss and a takeover as cash at the last price", () => {
    const failed = buyOutcome(new Map([["GONE", { status: "FAILURE", lastRated: "x" } as Fate]]));
    expect(failed.four.outcomes.failure).toBe(2);
    expect(failed.buy.meanExcess).toBeCloseTo(-1 + 1 / 26, 9); // −100% against a cohort that includes it
    const taken = buyOutcome(new Map([["GONE", { status: "TAKEOVER", lastRated: "x" } as Fate]]));
    expect(taken.four.outcomes.takeover).toBe(2);
    expect(taken.buy.n).toBe(2);
  });

  it("uses Yahoo prices when it is still trading", () => {
    const closes = [4, 5].map((w) => ({ date: weekAt(w).slice(0, 10), price: 120 }));
    const { four, buy } = buyOutcome(new Map([["GONE", { status: "TRADING", lastRated: "x", closes } as Fate]]));
    expect(four.outcomes.trading).toBe(2);
    expect(buy.n).toBe(2);
    expect(buy.meanExcess).toBeGreaterThan(0);
  });
});

describe("weekly series", () => {
  /** Buy names gain 1% a week more than Avoid names, for 14 weeks. */
  function weeks(): ScoreRow[] {
    const rows: ScoreRow[] = [];
    for (let w = 0; w < 14; w++) {
      for (let i = 0; i < 30; i++) {
        const verdict = i < 10 ? "BUY" : "AVOID";
        const drift = verdict === "BUY" ? 1.01 : 1;
        rows.push(row({ ticker: `T${i}`, verdict, score: verdict === "BUY" ? 80 : 20, at: weekAt(w), price: 100 * drift ** w, caps: i === 29 ? "declining_revenue" : null }));
      }
    }
    return rows;
  }
  const card = computeScorecard(weeks());

  it("records the Buy-minus-Avoid gap and score consistency every week", () => {
    expect(card.weekly.spread).toHaveLength(13);
    expect(card.weekly.spread[0].value).toBeCloseTo(0.01, 9);
    expect(card.weekly.ic.every((p) => p.value > 0.8)).toBe(true);
  });

  it("keeps each index's weekly average for the return split", () => {
    expect(card.indexWeekly).toHaveLength(13);
    expect(card.indexWeekly[0]).toMatchObject({ index: "SP500", n: 30 });
    expect(card.indexWeekly[0].mean).toBeCloseTo(0.01 / 3, 9);
  });
});

describe("case lists", () => {
  it("lists Buy losers that carried no red flag", () => {
    const rows: ScoreRow[] = [];
    for (let i = 0; i < 60; i++) {
      const verdict = i < 6 ? "BUY" : "HOLD";
      const caps = i === 0 ? "heavy_dilution" : null;
      rows.push(row({ ticker: `T${i}`, verdict, caps, sector: "Financials" }));
      rows.push(row({ ticker: `T${i}`, verdict, caps, at: "2026-06-29T10:00:00Z", price: 100 + i - 30 }));
    }
    const { flaglessLosers, best, worst } = computeScorecard(rows).cases!;
    expect(flaglessLosers.map((c) => c.ticker)).toEqual(["T1", "T2", "T3", "T4", "T5"]);
    expect(best.map((c) => c.ticker)).toEqual(["T5", "T4", "T3"]);
    expect(worst.map((c) => c.ticker)).toEqual(["T0", "T1", "T2"]);
  });
});
