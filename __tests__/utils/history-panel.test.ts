import { describe, it, expect } from "vitest";

import {
  HISTORY_COLLAPSED_KEY,
  historyLabel,
  readHistoryCollapsed,
  writeHistoryCollapsed,
} from "@/lib/utils/history-panel";

/** Minimal in-memory stand-in for localStorage. */
function makeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    _data: data,
  };
}

describe("history panel preference", () => {
  it("defaults to expanded when nothing is stored", () => {
    expect(readHistoryCollapsed(makeStorage())).toBe(false);
  });

  it("round-trips the collapsed preference", () => {
    const storage = makeStorage();
    writeHistoryCollapsed(true, storage);
    expect(storage._data.get(HISTORY_COLLAPSED_KEY)).toBe("true");
    expect(readHistoryCollapsed(storage)).toBe(true);

    writeHistoryCollapsed(false, storage);
    expect(readHistoryCollapsed(storage)).toBe(false);
  });

  it("persists across separate reads, so the choice survives navigation", () => {
    const storage = makeStorage();
    writeHistoryCollapsed(true, storage);
    // a fresh reader (new page) sees the same preference
    expect(readHistoryCollapsed(storage)).toBe(true);
    expect(readHistoryCollapsed(storage)).toBe(true);
  });

  it("treats any non-\"true\" value as expanded", () => {
    expect(readHistoryCollapsed(makeStorage({ [HISTORY_COLLAPSED_KEY]: "nonsense" }))).toBe(false);
    expect(readHistoryCollapsed(makeStorage({ [HISTORY_COLLAPSED_KEY]: "false" }))).toBe(false);
  });

  it("never throws when storage is unavailable (SSR, private mode)", () => {
    expect(() => readHistoryCollapsed(null)).not.toThrow();
    expect(readHistoryCollapsed(null)).toBe(false);
    expect(() => writeHistoryCollapsed(true, null)).not.toThrow();
  });

  it("never throws when storage rejects writes (quota exceeded)", () => {
    const hostile = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };
    expect(readHistoryCollapsed(hostile)).toBe(false);
    expect(() => writeHistoryCollapsed(true, hostile)).not.toThrow();
  });

  it("gives the control a concrete label with a count", () => {
    expect(historyLabel(11)).toBe("History (11)");
    expect(historyLabel(1)).toBe("History (1)");
  });

  it("omits the count when there is nothing saved", () => {
    expect(historyLabel(0)).toBe("History");
    expect(historyLabel(null)).toBe("History");
    expect(historyLabel(undefined)).toBe("History");
  });
});
