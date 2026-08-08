import { describe, expect, it } from "vitest";

import { formatDiscountPremium, compareMarginOfSafety } from "@/lib/finance/valuation-gap";

/**
 * P1-7 guard. The discount/premium column must be one signed value type so it
 * sorts meaningfully, and its comparator must place nulls last in both
 * directions.
 */
describe("formatDiscountPremium", () => {
  it("discount is a positive %, premium is parenthesised, null is an em-dash", () => {
    expect(formatDiscountPremium(47)).toBe("47.0%");
    expect(formatDiscountPremium(-30.7)).toBe("(30.7%)");
    expect(formatDiscountPremium(null)).toBe("—");
    expect(formatDiscountPremium(undefined)).toBe("—");
  });

  it("near-zero reads as fair value, not a bare number", () => {
    expect(formatDiscountPremium(0.4)).toBe("~0%");
  });

  it("never emits a raw negative number (the sign is the parentheses)", () => {
    expect(formatDiscountPremium(-62)).not.toContain("-");
  });
});

describe("compareMarginOfSafety", () => {
  it("sorts higher discount first when descending", () => {
    const xs = [10, null, 50, -20].sort((a, b) => compareMarginOfSafety(a, b, "desc"));
    expect(xs).toEqual([50, 10, -20, null]);
  });

  it("keeps nulls last even when ascending", () => {
    const xs = [10, null, 50, -20].sort((a, b) => compareMarginOfSafety(a, b, "asc"));
    expect(xs).toEqual([-20, 10, 50, null]);
  });

  it("treats non-finite as null", () => {
    expect(compareMarginOfSafety(Number.NaN, 5, "desc")).toBe(1);
    expect(compareMarginOfSafety(5, Number.NaN, "desc")).toBe(-1);
  });
});
