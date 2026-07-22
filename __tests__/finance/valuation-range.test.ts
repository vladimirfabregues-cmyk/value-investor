import { describe, it, expect } from "vitest";

import { buildValuationRange } from "@/lib/finance/valuation-range";

describe("valuation range", () => {
  it("exposes the spread rather than hiding it behind one blended number", () => {
    // The brief's example: DCF $38.35 vs Graham $3.58, base $28
    const range = buildValuationRange({
      dcf_value_per_share: 38.35,
      graham_value_per_share: 3.58,
      blended_intrinsic_value_per_share: 28,
      intrinsic_method: "dcf",
    });

    expect(range.low).toBeCloseTo(3.58);
    expect(range.high).toBeCloseTo(38.35);
    expect(range.base).toBe(28);
    expect(range.models).toHaveLength(2);
    expect(range.agreement).toBe("Low");
    expect(range.explanation).toMatch(/disagree materially/i);
  });

  it("reports high agreement when models are close", () => {
    const range = buildValuationRange({
      dcf_value_per_share: 100,
      graham_value_per_share: 95,
      blended_intrinsic_value_per_share: 98,
      intrinsic_method: "dcf",
    });
    expect(range.agreement).toBe("High");
    expect(range.spreadRatio).toBeLessThan(0.25);
  });

  it("reports medium agreement for a moderate spread", () => {
    const range = buildValuationRange({
      dcf_value_per_share: 120,
      graham_value_per_share: 85,
      blended_intrinsic_value_per_share: 100,
      intrinsic_method: "dcf",
    });
    expect(range.agreement).toBe("Medium");
  });

  it("flags a single uncorroborated model instead of implying agreement", () => {
    const range = buildValuationRange({
      dcf_value_per_share: 50,
      graham_value_per_share: null,
      blended_intrinsic_value_per_share: 50,
      intrinsic_method: "dcf",
    });
    expect(range.models).toHaveLength(1);
    expect(range.agreement).toBeNull();
    expect(range.explanation).toMatch(/only one model/i);
  });

  it("shows the models relevant to the chosen method", () => {
    const bank = buildValuationRange({
      pbroe_value_per_share: 40,
      graham_value_per_share: 35,
      dcf_value_per_share: 999, // irrelevant for a financial — must be ignored
      blended_intrinsic_value_per_share: 38,
      intrinsic_method: "pbroe",
    });
    const names = bank.models.map((m) => m.name);
    expect(names).toContain("Justified price-to-book");
    expect(names).toContain("Graham number");
    expect(bank.high).toBe(40); // not 999
  });

  it("ignores non-positive or missing model values", () => {
    const range = buildValuationRange({
      dcf_value_per_share: -12,
      graham_value_per_share: 0,
      blended_intrinsic_value_per_share: null,
      intrinsic_method: "dcf",
    });
    expect(range.models).toHaveLength(0);
    expect(range.low).toBeNull();
    expect(range.high).toBeNull();
    expect(range.agreement).toBeNull();
  });

  it("handles a REIT valued on NAV", () => {
    const reit = buildValuationRange({
      nav_value_per_share: 8.82,
      dcf_value_per_share: 0.3,
      blended_intrinsic_value_per_share: 7.77,
      intrinsic_method: "nav",
    });
    expect(reit.models.map((m) => m.name)).toContain("Net asset value");
    expect(reit.agreement).toBe("Low"); // NAV vs a near-zero FCF DCF
  });
});

describe("range coherence", () => {
  it("always brackets the base case", () => {
    // A base produced by a model not in the displayed set must still fall inside
    const range = buildValuationRange({
      pbroe_value_per_share: null,
      graham_value_per_share: 124.12,
      blended_intrinsic_value_per_share: 41.29,
      intrinsic_method: "pbroe",
    });
    expect(range.low).toBeLessThanOrEqual(range.base!);
    expect(range.high).toBeGreaterThanOrEqual(range.base!);
  });

  it("keeps the base inside the span for every method", () => {
    for (const method of ["dcf", "nav", "ddm", "pbroe"] as const) {
      const r = buildValuationRange({
        dcf_value_per_share: 10,
        graham_value_per_share: 90,
        nav_value_per_share: 30,
        ddm_value_per_share: 20,
        pbroe_value_per_share: 45,
        blended_intrinsic_value_per_share: 55,
        intrinsic_method: method,
      });
      if (r.base !== null && r.low !== null && r.high !== null) {
        expect(r.low).toBeLessThanOrEqual(r.base);
        expect(r.high).toBeGreaterThanOrEqual(r.base);
      }
    }
  });
});
