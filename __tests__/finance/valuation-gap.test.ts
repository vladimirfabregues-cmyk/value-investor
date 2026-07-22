import { describe, it, expect } from "vitest";

import { describeValuationGap, formatValuationGapShort } from "@/lib/finance/valuation-gap";

describe("describeValuationGap", () => {
  it("labels a positive gap as a margin of safety", () => {
    const gap = describeValuationGap(42.7);
    expect(gap.kind).toBe("margin");
    expect(gap.label).toBe("Margin of safety");
    expect(gap.display).toBe("42.7%");
    expect(gap.tone).toBe("positive");
  });

  it("never reports a negative margin of safety — it is a premium", () => {
    const gap = describeValuationGap(-532.8);
    expect(gap.kind).toBe("premium");
    expect(gap.label).toBe("Premium to estimated value");
    // magnitude is positive; the sign lives in `kind`, not the number
    expect(gap.magnitudePct).toBeGreaterThan(0);
    expect(gap.display).not.toContain("-");
    expect(gap.display).not.toContain("−");
  });

  it("rounds large premiums to whole numbers (the -532.8% MoS case)", () => {
    // The brief's example: "−532.8% MoS" must render as "533% premium to estimated value"
    const gap = describeValuationGap(-532.8);
    expect(gap.display).toBe("533%");
    expect(formatValuationGapShort(-532.8)).toBe("533% premium");
  });

  it("treats a near-zero gap as fairly valued rather than a tiny margin", () => {
    const gap = describeValuationGap(0.4);
    expect(gap.kind).toBe("none");
    expect(gap.tone).toBe("neutral");
  });

  it("handles missing values without inventing a figure", () => {
    for (const value of [null, undefined, NaN, Infinity]) {
      const gap = describeValuationGap(value as number | null);
      expect(gap.magnitudePct).toBeNull();
      expect(gap.display).toBe("—");
    }
  });

  it("keeps one decimal place for ordinary magnitudes", () => {
    expect(describeValuationGap(12.34).display).toBe("12.3%");
    expect(describeValuationGap(-45.67).display).toBe("45.7%");
  });

  it("produces a readable short form for both directions", () => {
    expect(formatValuationGapShort(30)).toBe("30.0% margin of safety");
    expect(formatValuationGapShort(-30)).toBe("30.0% premium");
  });
});
