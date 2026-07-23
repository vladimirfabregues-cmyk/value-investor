import { describe, it, expect } from "vitest";

import {
  buildChangeIndex,
  describeMarginShift,
  describeVerdictChange,
} from "@/lib/history/history-changes";
import type { SavedAnalysisSummary, VerdictLabel } from "@/types/analysis";

function summary(overrides: Partial<SavedAnalysisSummary> & { id: string }): SavedAnalysisSummary {
  return {
    ticker: "AAPL",
    exchange: "US",
    companyName: "Apple Inc.",
    analysisDate: overrides.createdAt ?? "2026-07-20T00:00:00.000Z",
    finalVerdictLabel: "HOLD" as VerdictLabel,
    confidencePct: 70,
    marginOfSafetyPct: 10,
    oneLineVerdict: "Fairly priced",
    verdictReason: "All checks passed",
    createdAt: "2026-07-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildChangeIndex", () => {
  it("links an analysis to the previous run of the same security", () => {
    const current = summary({
      id: "new",
      createdAt: "2026-07-20T00:00:00.000Z",
      finalVerdictLabel: "AVOID",
      marginOfSafetyPct: -5,
    });
    const previous = summary({
      id: "old",
      createdAt: "2026-04-02T00:00:00.000Z",
      finalVerdictLabel: "BUY",
      marginOfSafetyPct: 20,
    });

    const index = buildChangeIndex([current, previous]);
    const change = index.get("new")!;

    expect(change.previousId).toBe("old");
    expect(change.previousVerdict).toBe("BUY");
    expect(change.verdictChanged).toBe(true);
    expect(change.marginDeltaPct).toBe(-25);
  });

  it("leaves the oldest run of a security without a change entry", () => {
    const index = buildChangeIndex([
      summary({ id: "new", createdAt: "2026-07-20T00:00:00.000Z" }),
      summary({ id: "old", createdAt: "2026-04-02T00:00:00.000Z" }),
    ]);

    expect(index.has("old")).toBe(false);
  });

  it("never compares across markets, even for an identical ticker", () => {
    const index = buildChangeIndex([
      summary({ id: "us", ticker: "ABC", exchange: "US", createdAt: "2026-07-20T00:00:00.000Z" }),
      summary({ id: "paris", ticker: "ABC", exchange: "XPAR", createdAt: "2026-04-02T00:00:00.000Z" }),
    ]);

    expect(index.size).toBe(0);
  });

  it("chains three runs of the same security to their immediate predecessor", () => {
    const index = buildChangeIndex([
      summary({ id: "c", createdAt: "2026-07-20T00:00:00.000Z" }),
      summary({ id: "b", createdAt: "2026-05-20T00:00:00.000Z" }),
      summary({ id: "a", createdAt: "2026-01-20T00:00:00.000Z" }),
    ]);

    expect(index.get("c")!.previousId).toBe("b");
    expect(index.get("b")!.previousId).toBe("a");
  });

  it("orders by date regardless of the order supplied", () => {
    const index = buildChangeIndex([
      summary({ id: "a", createdAt: "2026-01-20T00:00:00.000Z" }),
      summary({ id: "c", createdAt: "2026-07-20T00:00:00.000Z" }),
      summary({ id: "b", createdAt: "2026-05-20T00:00:00.000Z" }),
    ]);

    expect(index.get("c")!.previousId).toBe("b");
  });

  it("reports no margin delta when either run lacked a figure", () => {
    const index = buildChangeIndex([
      summary({ id: "new", createdAt: "2026-07-20T00:00:00.000Z", marginOfSafetyPct: null }),
      summary({ id: "old", createdAt: "2026-04-02T00:00:00.000Z", marginOfSafetyPct: 20 }),
    ]);

    expect(index.get("new")!.marginDeltaPct).toBeNull();
  });
});

describe("describeVerdictChange", () => {
  const change = {
    previousId: "old",
    previousVerdict: "WATCH" as VerdictLabel,
    previousDate: "2026-04-02T00:00:00.000Z",
    verdictChanged: true,
    marginDeltaPct: null,
  };

  it("says nothing when there is no previous analysis", () => {
    expect(describeVerdictChange("BUY", undefined)).toBeNull();
  });

  it("reports an upgrade", () => {
    expect(describeVerdictChange("BUY", change)).toEqual({
      text: "Upgraded from Watch",
      tone: "positive",
    });
  });

  it("reports a downgrade", () => {
    expect(describeVerdictChange("AVOID", change)).toEqual({
      text: "Downgraded from Watch",
      tone: "negative",
    });
  });

  it("reports an unchanged verdict neutrally", () => {
    const description = describeVerdictChange("WATCH", { ...change, verdictChanged: false });
    expect(description).toEqual({ text: "Unchanged from the previous run", tone: "neutral" });
  });
});

describe("describeMarginShift", () => {
  function withDelta(marginDeltaPct: number | null) {
    return {
      previousId: "old",
      previousVerdict: "BUY" as VerdictLabel,
      previousDate: "2026-04-02T00:00:00.000Z",
      verdictChanged: false,
      marginDeltaPct,
    };
  }

  it("says nothing without a previous analysis or a delta", () => {
    expect(describeMarginShift(undefined)).toBeNull();
    expect(describeMarginShift(withDelta(null))).toBeNull();
  });

  it("stays silent about price noise between runs", () => {
    expect(describeMarginShift(withDelta(1.4))).toBeNull();
    expect(describeMarginShift(withDelta(-1.9))).toBeNull();
  });

  it("reports a widening gap as cheaper", () => {
    expect(describeMarginShift(withDelta(12.34))).toEqual({
      text: "12.3pp cheaper against estimated value",
      tone: "positive",
    });
  });

  it("reports a narrowing gap as dearer", () => {
    expect(describeMarginShift(withDelta(-8))).toEqual({
      text: "8pp dearer against estimated value",
      tone: "negative",
    });
  });

  it("drops decimals on very large moves, which are noise-dominated", () => {
    expect(describeMarginShift(withDelta(147.6))!.text).toBe(
      "148pp cheaper against estimated value",
    );
  });
});
