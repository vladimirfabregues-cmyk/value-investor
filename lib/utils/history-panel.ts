/**
 * Persistence for the History panel's collapsed/expanded preference.
 *
 * Kept free of React so it can be unit-tested directly, and written
 * defensively: storage can throw (Safari private mode, disabled cookies) and a
 * failure here must never break the page.
 */

export const HISTORY_COLLAPSED_KEY = "vi:history-collapsed";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function defaultStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Reads the stored preference. Defaults to expanded when unknown. */
export function readHistoryCollapsed(storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(HISTORY_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

/** Persists the preference; silently no-ops when storage is unavailable. */
export function writeHistoryCollapsed(
  collapsed: boolean,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(HISTORY_COLLAPSED_KEY, collapsed ? "true" : "false");
  } catch {
    /* storage full or blocked — preference simply won't persist */
  }
}

/** Concrete control label, e.g. "History (11)" rather than a vague "Open history". */
export function historyLabel(count: number | null | undefined): string {
  return typeof count === "number" && count > 0 ? `History (${count})` : "History";
}
