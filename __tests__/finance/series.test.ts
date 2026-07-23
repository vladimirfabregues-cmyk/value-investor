import { describe, it, expect } from "vitest";

import { deriveSeries } from "@/lib/finance/series";
import type { FinancialHistory5Y } from "@/types/finance";

function history(overrides: Partial<FinancialHistory5Y> = {}): FinancialHistory5Y {
  return {
    revenue: [null, null, null, null, null],
    free_cash_flow: [null, null, null, null, null],
    diluted_eps: [null, null, null, null, null],
    gross_margin_pct: [],
    operating_margin_pct: [null, null, null, null, null],
    roe_pct: [],
    roic_pct: [null, null, null, null, null],
    ...overrides,
  };
}

describe("deriveSeries", () => {
  it("returns undefined when not one of the five charted metrics has data", () => {
    expect(deriveSeries(history(), "2025-12-31", "2026-01-01")).toBeUndefined();
    // gross_margin/roe having data is not enough — they aren't charted
    expect(
      deriveSeries(history({ gross_margin_pct: [40, 41, 42], roe_pct: [10, 11] }), undefined, "2026-01-01"),
    ).toBeUndefined();
  });

  it("labels the periods as fiscal years counting back from the latest statement", () => {
    const s = deriveSeries(
      history({ revenue: [100, 110, 120, 130, 140] }),
      "2025-12-31",
      "2026-03-01",
    );
    expect(s?.period_labels).toEqual(["2021", "2022", "2023", "2024", "2025"]);
    expect(s?.revenue).toEqual([100, 110, 120, 130, 140]);
  });

  it("falls back to the analysis-date year when the statement period is absent or unparseable", () => {
    const expected = ["2022", "2023", "2024", "2025", "2026"];
    expect(
      deriveSeries(history({ revenue: [1, 2, 3, 4, 5] }), undefined, "2026-06-01")?.period_labels,
    ).toEqual(expected);
    expect(
      deriveSeries(history({ revenue: [1, 2, 3, 4, 5] }), "not-a-date", "2026-06-01")?.period_labels,
    ).toEqual(expected);
  });

  it("right-aligns shorter metrics with leading nulls so the latest year lines up", () => {
    const s = deriveSeries(
      history({ revenue: [100, 110, 120, 130, 140], diluted_eps: [4, 5] }),
      "2025-12-31",
      "2026-01-01",
    );
    // eps has only 2 years — they are the two most recent
    expect(s?.diluted_eps).toEqual([null, null, null, 4, 5]);
    expect(s?.period_labels).toHaveLength(5);
  });

  it("scrubs non-finite values to null", () => {
    const s = deriveSeries(
      history({ revenue: [Infinity, NaN, 120, 130, 140] as number[] }),
      "2025-12-31",
      "2026-01-01",
    );
    expect(s?.revenue).toEqual([null, null, 120, 130, 140]);
  });
});
