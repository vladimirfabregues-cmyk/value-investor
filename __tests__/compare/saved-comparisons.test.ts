import { describe, it, expect } from "vitest";

import {
  MAX_SAVED_COMPARISONS,
  SAVED_COMPARISONS_KEY,
  comparisonKey,
  isComparisonSaved,
  readSavedComparisons,
  removeComparison,
  saveComparison,
  writeSavedComparisons,
} from "@/lib/compare/saved-comparisons";

function makeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    _data: data,
  };
}

const now = new Date("2026-07-22T10:00:00.000Z");

describe("comparisonKey", () => {
  it("is direction-independent, so A vs B is the same pair as B vs A", () => {
    expect(comparisonKey("a", "b")).toBe(comparisonKey("b", "a"));
  });
});

describe("saveComparison", () => {
  it("adds a pair to the front", () => {
    const saved = saveComparison([], { leftId: "a", rightId: "b", label: "A vs B" }, now);
    expect(saved).toHaveLength(1);
    expect(saved[0].label).toBe("A vs B");
    expect(saved[0].savedAt).toBe(now.toISOString());
  });

  it("moves an existing pair to the front rather than duplicating it", () => {
    const first = saveComparison([], { leftId: "a", rightId: "b", label: "A vs B" }, now);
    const second = saveComparison(first, { leftId: "c", rightId: "d", label: "C vs D" }, now);
    const again = saveComparison(second, { leftId: "a", rightId: "b", label: "A vs B" }, now);

    expect(again).toHaveLength(2);
    expect(again[0].label).toBe("A vs B");
  });

  it("treats a swapped pair as the same comparison", () => {
    const first = saveComparison([], { leftId: "a", rightId: "b", label: "A vs B" }, now);
    const swapped = saveComparison(first, { leftId: "b", rightId: "a", label: "B vs A" }, now);

    expect(swapped).toHaveLength(1);
    expect(swapped[0].label).toBe("B vs A");
  });

  it("caps the list so storage can never fill up", () => {
    let saved = saveComparison([], { leftId: "seed", rightId: "seed2", label: "seed" }, now);
    for (let index = 0; index < MAX_SAVED_COMPARISONS + 5; index += 1) {
      saved = saveComparison(saved, { leftId: `l${index}`, rightId: `r${index}`, label: `#${index}` }, now);
    }

    expect(saved).toHaveLength(MAX_SAVED_COMPARISONS);
    expect(saved[0].label).toBe(`#${MAX_SAVED_COMPARISONS + 4}`);
  });

  it("does not mutate the list it is given", () => {
    const before: ReturnType<typeof saveComparison> = [];
    saveComparison(before, { leftId: "a", rightId: "b", label: "A vs B" }, now);
    expect(before).toHaveLength(0);
  });
});

describe("removeComparison and isComparisonSaved", () => {
  const saved = saveComparison([], { leftId: "a", rightId: "b", label: "A vs B" }, now);

  it("recognises a saved pair in either direction", () => {
    expect(isComparisonSaved(saved, "a", "b")).toBe(true);
    expect(isComparisonSaved(saved, "b", "a")).toBe(true);
    expect(isComparisonSaved(saved, "a", "c")).toBe(false);
  });

  it("removes by id", () => {
    expect(removeComparison(saved, saved[0].id)).toEqual([]);
    expect(removeComparison(saved, "missing")).toEqual(saved);
  });
});

describe("storage", () => {
  it("round-trips through storage", () => {
    const storage = makeStorage();
    const saved = saveComparison([], { leftId: "a", rightId: "b", label: "A vs B" }, now);

    writeSavedComparisons(saved, storage);
    expect(readSavedComparisons(storage)).toEqual(saved);
    expect(storage._data.has(SAVED_COMPARISONS_KEY)).toBe(true);
  });

  it("discards corrupt or wrongly-shaped stored entries", () => {
    expect(readSavedComparisons(makeStorage({ [SAVED_COMPARISONS_KEY]: "{not json" }))).toEqual([]);
    expect(readSavedComparisons(makeStorage({ [SAVED_COMPARISONS_KEY]: '{"a":1}' }))).toEqual([]);
    expect(
      readSavedComparisons(
        makeStorage({ [SAVED_COMPARISONS_KEY]: JSON.stringify([{ leftId: "a" }, null, 7]) }),
      ),
    ).toEqual([]);
  });

  it("never throws when storage is unavailable or hostile", () => {
    const hostile = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };

    expect(readSavedComparisons(null)).toEqual([]);
    expect(readSavedComparisons(hostile)).toEqual([]);
    expect(() => writeSavedComparisons([], null)).not.toThrow();
    expect(() => writeSavedComparisons([], hostile)).not.toThrow();
  });
});
