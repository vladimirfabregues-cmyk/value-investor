import { describe, it, expect } from "vitest";

import { costOfEquitySizePremiumPct } from "@/lib/finance/sector-profile";

describe("costOfEquitySizePremiumPct", () => {
  it("adds the most to micro caps and nothing to large/mega", () => {
    expect(costOfEquitySizePremiumPct(150_000_000)).toBe(2.0); // micro (<$300M)
    expect(costOfEquitySizePremiumPct(800_000_000)).toBe(1.5); // small ($300M–$2B)
    expect(costOfEquitySizePremiumPct(5_000_000_000)).toBe(0.5); // mid ($2B–$10B)
    expect(costOfEquitySizePremiumPct(50_000_000_000)).toBe(0); // large
    expect(costOfEquitySizePremiumPct(500_000_000_000)).toBe(0); // mega
  });

  it("applies the premium at the tier boundaries (lower bound is the higher tier)", () => {
    expect(costOfEquitySizePremiumPct(300_000_000)).toBe(1.5); // exactly $300M → small
    expect(costOfEquitySizePremiumPct(2_000_000_000)).toBe(0.5); // exactly $2B → mid
    expect(costOfEquitySizePremiumPct(10_000_000_000)).toBe(0); // exactly $10B → large
  });

  it("treats unknown or invalid size as small-cap risk, never as large", () => {
    expect(costOfEquitySizePremiumPct(null)).toBe(1.5);
    expect(costOfEquitySizePremiumPct(undefined)).toBe(1.5);
    expect(costOfEquitySizePremiumPct(0)).toBe(1.5);
    expect(costOfEquitySizePremiumPct(Number.NaN)).toBe(1.5);
  });
});
