import { describe, it, expect } from "vitest";

import { parseLastSplit } from "@/lib/finance/splits";
import { capturedSplits, mergeSplits } from "@/lib/scorecard/compute";

describe("parseLastSplit", () => {
  it("reads Yahoo's new:old factor and epoch-second date", () => {
    // MQ: 1-for-4 reverse split, lastSplitDate 1782864000 (1 Jul 2026).
    expect(parseLastSplit("1:4", 1782864000)).toEqual({ at: "2026-07-01T12:00:00.000Z", ratio: 0.25 });
    expect(parseLastSplit("2:1", new Date("2026-09-28T00:00:00Z"))).toEqual({ at: "2026-09-28T12:00:00.000Z", ratio: 2 });
  });
  it("ignores missing or meaningless values", () => {
    expect(parseLastSplit(null, 1782864000)).toBeNull();
    expect(parseLastSplit("1:1", 1782864000)).toBeNull();
    expect(parseLastSplit("abc", 1782864000)).toBeNull();
    expect(parseLastSplit("2:1", undefined)).toBeNull();
  });
});

describe("split sources", () => {
  it("dedupes captured splits and lets Yahoo-confirmed histories win", () => {
    const captured = capturedSplits([
      { ticker: "A", lastSplitAt: "2026-07-01T12:00:00.000Z", lastSplitRatio: 0.25 },
      { ticker: "A", lastSplitAt: "2026-07-01T12:00:00.000Z", lastSplitRatio: 0.25 },
      { ticker: "B", lastSplitAt: "2026-09-28T12:00:00.000Z", lastSplitRatio: 2 },
      { ticker: "C", lastSplitAt: null, lastSplitRatio: null },
    ]);
    expect(captured.get("A")).toHaveLength(1);
    expect(captured.has("C")).toBe(false);
    const merged = mergeSplits(new Map([["A", [{ at: "2026-07-01T13:30:00.000Z", ratio: 0.25 }]]]), captured);
    expect(merged.get("A")![0].at).toBe("2026-07-01T13:30:00.000Z");
    expect(merged.get("B")![0].ratio).toBe(2);
  });
});
