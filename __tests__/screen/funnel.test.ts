import { describe, expect, it } from "vitest";

import { computeScreenFunnel } from "@/lib/screener/funnel";

/**
 * P1-3 guard. Every count on the screener must derive from one funnel, and the
 * verdict pills must sum to the stated "screened" figure.
 */
describe("computeScreenFunnel", () => {
  // Mirrors the audited Russell 2000 state.
  const meta = {
    totalScreened: 1539,
    totalErrors: 403,
    verdictCounts: { STRONG_BUY: 1, BUY: 13, WATCH: 49, HOLD: 55, AVOID: 1421 },
  };

  it("universe = screened + errored", () => {
    expect(computeScreenFunnel(meta).universe).toBe(1942);
  });

  it("pill totals sum exactly to the screened figure", () => {
    const sum = Object.values(meta.verdictCounts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(meta.totalScreened);
    expect(computeScreenFunnel(meta).screened).toBe(sum);
  });

  it("passed all gates = Strong buy + Buy (no Strong-buy/Buy conflation)", () => {
    const f = computeScreenFunnel(meta);
    expect(f.passedAllGates).toBe(14);
    // The pill for BUY alone stays 13 — the 14 is passed-all-gates, not "Buy".
    expect(meta.verdictCounts.BUY).toBe(13);
  });

  it("candidate total = passed all gates + on watch", () => {
    const f = computeScreenFunnel(meta);
    expect(f.onWatch).toBe(49);
    expect(f.candidateTotal).toBe(63);
  });

  it("tolerates missing verdict counts", () => {
    const f = computeScreenFunnel({ totalScreened: 0, totalErrors: 0 });
    expect(f).toEqual({ universe: 0, screened: 0, passedAllGates: 0, onWatch: 0, candidateTotal: 0 });
  });
});
