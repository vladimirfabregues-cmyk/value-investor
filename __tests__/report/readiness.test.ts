import { describe, expect, it } from "vitest";

import { assessReadiness, gapRange, READY, type LiveStats, type ReadinessInputs } from "@/lib/report/readiness";

const live = (o: Partial<LiveStats> = {}): LiveStats => ({
  weeks: 6,
  vsBenchmark: 0.014,
  vsBenchmarkRange: { mean: 0.012, low: -0.05, high: 0.074, n: 6 },
  weeklyGaps: [0.01, -0.02, 0.015, 0.004, -0.006, 0.009],
  maxDrawdownPct: 0.079,
  risk: { weeks: 6, volatility: 0.14, trackingError: 0.08, beta: 0.9, sharpe: null, sortino: null },
  costsPct: 0.018,
  spreadPct: 0.006,
  ...o,
});

const inputs = (o: Partial<ReadinessInputs> = {}): ReadinessInputs => ({
  mainName: "Top 20, capped",
  mainSinceFixed: -0.034,
  benchSinceFixed: -0.048,
  main: live(),
  bench: live({ vsBenchmark: null, vsBenchmarkRange: null, weeklyGaps: [], maxDrawdownPct: 0.06 }),
  concentration: { holdings: 20, effectiveNames: 20, topSector: "Consumer Discretionary", topSectorWeight: 0.2, regions: { JP: 0.7, US: 0.15, UK: 0.1, EU: 0.05 }, cashWeight: 0, warning: false },
  others: [0.069, 0.059, 0.052, 0.036, 0.025, 0.019, -0.041],
  outcomes: { snapshot: 19751, gap: 3428, trading: 80, takeover: 76, failure: 1, missing: 597, noRun: 0, badPrice: 0 },
  badPrices: 4,
  runWeeks: 2,
  fullRunWeeks: 2,
  fixedLabel: "29 Sept 2026",
  ...o,
});

const row = (r: ReturnType<typeof assessReadiness>, q: string) => r.dashboard.find((d) => d.question.startsWith(q))!;

describe("assessReadiness", () => {
  it("six weeks in: observation only, every answer computed from the figures", () => {
    const r = assessReadiness(inputs());
    expect(r.mainBook).toBe("LAB_TOP20");
    expect(r.conditions).toHaveLength(6);
    expect(r.conditions.map((c) => c.met)).toEqual([false, true, false, false, true, true]);
    expect(r.conditions[1].current).toBe("+1.4 pts less +0.6 pts spreads = +0.8 pts");
    expect(row(r, "Is there").answer).toBe("Not yet — too early");
    expect(row(r, "How much").answer).toBe("6 weeks");
    expect(row(r, "How has").answer).toBe("−3.4% vs benchmark −4.8%");
    expect(row(r, "How has").detail).toContain("95% range");
    expect(row(r, "How has").detail).toContain("6 of 7 alternative rulebooks");
    expect(row(r, "What is the main risk").answer).toBe("Japan 70% of the book");
    expect(row(r, "How confident").answer).toBe("Low");
    expect(row(r, "How reliable").answer).toBe("Fair, improving");
    expect(row(r, "How reliable").detail).toContain("597 of 23,933");
    expect(row(r, "Recommended").answer).toBe("Research and observation — not a validated strategy");
    expect(row(r, "Recommended").detail).toContain("3 of 6");
  });

  it("is ready only when every condition holds", () => {
    const strong = live({
      weeks: 60,
      vsBenchmark: 0.12,
      vsBenchmarkRange: { mean: 0.11, low: 0.04, high: 0.18, n: 60 },
      weeklyGaps: Array.from({ length: 60 }, (_, i) => 0.002 + (i % 2 ? 0.001 : -0.001)),
      maxDrawdownPct: 0.05,
    });
    const r = assessReadiness(inputs({ main: strong, mainSinceFixed: 0.2, benchSinceFixed: 0.08 }));
    expect(r.conditions.every((c) => c.met)).toBe(true);
    expect(row(r, "Is there").answer).toBe("Yes");
    expect(row(r, "Recommended").answer).toBe("Ready for a small real-money trial");

    const concentrated = assessReadiness(inputs({ main: strong, concentration: { ...inputs().concentration!, topSector: "Financials", topSectorWeight: 0.35 } }));
    expect(concentrated.conditions[5].met).toBe(false);
    expect(row(concentrated, "Recommended").answer).toBe("Not ready");
  });

  it("charges spreads against the range, not just the point estimate", () => {
    const m = live({ weeks: READY.weeks, vsBenchmark: 0.03, vsBenchmarkRange: { mean: 0.03, low: 0.004, high: 0.056, n: 52 }, spreadPct: 0.01 });
    const r = assessReadiness(inputs({ main: m }));
    expect(r.conditions[1].met).toBe(true); // +3.0 less 1.0 spreads
    expect(r.conditions[2].met).toBe(false); // range low +0.4 less 1.0 spreads is below zero
  });

  it("copes with no data at all", () => {
    const r = assessReadiness(inputs({ main: null, bench: null, concentration: null, outcomes: null, badPrices: null, runWeeks: 0, fullRunWeeks: 0, mainSinceFixed: null, benchSinceFixed: null, others: [] }));
    expect(r.conditions.every((c) => !c.met)).toBe(true);
    expect(row(r, "How has").answer).toBe("No result yet");
    expect(row(r, "How reliable").answer).toBe("Unknown");
  });
});

describe("gapRange", () => {
  it("centres the weekly range's half-widths on the compounded gap", () => {
    const g = gapRange(live())!;
    expect(g.low).toBeCloseTo(0.014 - 0.062, 9);
    expect(g.high).toBeCloseTo(0.014 + 0.062, 9);
    expect(gapRange(live({ vsBenchmarkRange: null }))).toBeNull();
  });
});
