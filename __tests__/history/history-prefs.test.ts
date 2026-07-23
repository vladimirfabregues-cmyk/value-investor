import { describe, it, expect } from "vitest";

import {
  EMPTY_PREFS,
  HISTORY_PREFS_KEY,
  MAX_NOTE_LENGTH,
  isArchived,
  isPinned,
  noteFor,
  readHistoryPrefs,
  setNote,
  toggleArchived,
  togglePinned,
  writeHistoryPrefs,
} from "@/lib/history/history-prefs";

/** Minimal in-memory stand-in for localStorage. */
function makeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    _data: data,
  };
}

describe("history preferences storage", () => {
  it("starts empty when nothing is stored", () => {
    expect(readHistoryPrefs(makeStorage())).toEqual(EMPTY_PREFS);
  });

  it("round-trips pins, notes and archived runs", () => {
    const storage = makeStorage();
    const prefs = {
      pinned: ["XLON:DPLM.L"],
      notes: { "US:AAPL": "Check the buyback" },
      archived: ["analysis-1"],
    };

    writeHistoryPrefs(prefs, storage);
    expect(readHistoryPrefs(storage)).toEqual(prefs);
    expect(storage._data.has(HISTORY_PREFS_KEY)).toBe(true);
  });

  it("recovers from corrupt stored data rather than leaving the panel broken", () => {
    expect(readHistoryPrefs(makeStorage({ [HISTORY_PREFS_KEY]: "{not json" }))).toEqual(EMPTY_PREFS);
    expect(readHistoryPrefs(makeStorage({ [HISTORY_PREFS_KEY]: "[]" }))).toEqual(EMPTY_PREFS);
    expect(readHistoryPrefs(makeStorage({ [HISTORY_PREFS_KEY]: "null" }))).toEqual(EMPTY_PREFS);
  });

  it("discards wrongly-typed entries inside otherwise valid data", () => {
    const storage = makeStorage({
      [HISTORY_PREFS_KEY]: JSON.stringify({
        pinned: ["US:AAPL", 42, null, ""],
        notes: { "US:AAPL": "keep", "US:MSFT": 7, "US:INTC": "   " },
        archived: "not an array",
      }),
    });

    expect(readHistoryPrefs(storage)).toEqual({
      pinned: ["US:AAPL"],
      notes: { "US:AAPL": "keep" },
      archived: [],
    });
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

    expect(readHistoryPrefs(null)).toEqual(EMPTY_PREFS);
    expect(() => writeHistoryPrefs(EMPTY_PREFS, null)).not.toThrow();
    expect(readHistoryPrefs(hostile)).toEqual(EMPTY_PREFS);
    expect(() => writeHistoryPrefs(EMPTY_PREFS, hostile)).not.toThrow();
  });
});

describe("pinning", () => {
  it("toggles a security on and off", () => {
    const pinned = togglePinned(EMPTY_PREFS, "XLON:DPLM.L");
    expect(isPinned(pinned, "XLON:DPLM.L")).toBe(true);

    const unpinned = togglePinned(pinned, "XLON:DPLM.L");
    expect(isPinned(unpinned, "XLON:DPLM.L")).toBe(false);
  });

  it("keys on market plus ticker, so the same symbol elsewhere is unaffected", () => {
    const prefs = togglePinned(EMPTY_PREFS, "US:ABC");
    expect(isPinned(prefs, "XPAR:ABC")).toBe(false);
  });

  it("does not mutate the preferences it is given", () => {
    const before = { ...EMPTY_PREFS, pinned: [] as string[] };
    togglePinned(before, "US:AAPL");
    expect(before.pinned).toEqual([]);
  });
});

describe("archiving", () => {
  it("toggles a single run, not the company", () => {
    const prefs = toggleArchived(EMPTY_PREFS, "analysis-1");
    expect(isArchived(prefs, "analysis-1")).toBe(true);
    expect(isArchived(prefs, "analysis-2")).toBe(false);
    expect(isArchived(toggleArchived(prefs, "analysis-1"), "analysis-1")).toBe(false);
  });
});

describe("notes", () => {
  it("stores and reads a note against a security", () => {
    const prefs = setNote(EMPTY_PREFS, "US:AAPL", "Check the buyback");
    expect(noteFor(prefs, "US:AAPL")).toBe("Check the buyback");
    expect(noteFor(prefs, "US:MSFT")).toBe("");
  });

  it("removes the note when it is cleared, so blanks never accumulate", () => {
    const prefs = setNote(setNote(EMPTY_PREFS, "US:AAPL", "temporary"), "US:AAPL", "   ");
    expect(prefs.notes).toEqual({});
  });

  it("caps note length so a note can never exhaust the storage quota", () => {
    const prefs = setNote(EMPTY_PREFS, "US:AAPL", "x".repeat(MAX_NOTE_LENGTH + 250));
    expect(noteFor(prefs, "US:AAPL")).toHaveLength(MAX_NOTE_LENGTH);
  });

  it("trims surrounding whitespace", () => {
    expect(noteFor(setNote(EMPTY_PREFS, "US:AAPL", "  spaced  "), "US:AAPL")).toBe("spaced");
  });
});
