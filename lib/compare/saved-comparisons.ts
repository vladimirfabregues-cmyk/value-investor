/**
 * Comparisons the user chose to keep, stored per browser.
 *
 * A comparison is just a pair of saved-analysis ids plus a label, so there is
 * nothing here worth a database table — and, as with the History panel's
 * annotations, storage can fail and must never break the page.
 */

export const SAVED_COMPARISONS_KEY = "vi:saved-comparisons";

/** Enough to be useful, few enough never to threaten the storage quota. */
export const MAX_SAVED_COMPARISONS = 20;

export interface SavedComparison {
  id: string;
  leftId: string;
  rightId: string;
  /** e.g. "AIR.PA vs BRK-B" */
  label: string;
  savedAt: string;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function defaultStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isValid(entry: unknown): entry is SavedComparison {
  if (typeof entry !== "object" || entry === null) return false;
  const record = entry as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.leftId === "string" &&
    typeof record.rightId === "string" &&
    typeof record.label === "string" &&
    typeof record.savedAt === "string"
  );
}

export function readSavedComparisons(
  storage: StorageLike | null = defaultStorage(),
): SavedComparison[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(SAVED_COMPARISONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValid) : [];
  } catch {
    return [];
  }
}

export function writeSavedComparisons(
  comparisons: SavedComparison[],
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(SAVED_COMPARISONS_KEY, JSON.stringify(comparisons));
  } catch {
    /* storage full or blocked — the comparison simply won't persist */
  }
}

/** Identity of a pair, direction-independent: A vs B is the same as B vs A. */
export function comparisonKey(leftId: string, rightId: string): string {
  return [leftId, rightId].sort().join("::");
}

/**
 * Add a pair, or move it to the front if it is already saved. Oldest entries
 * fall off the end once the cap is reached.
 */
export function saveComparison(
  comparisons: SavedComparison[],
  entry: Omit<SavedComparison, "id" | "savedAt">,
  now: Date = new Date(),
): SavedComparison[] {
  const key = comparisonKey(entry.leftId, entry.rightId);
  const withoutDuplicate = comparisons.filter(
    (saved) => comparisonKey(saved.leftId, saved.rightId) !== key,
  );

  return [
    { ...entry, id: key, savedAt: now.toISOString() },
    ...withoutDuplicate,
  ].slice(0, MAX_SAVED_COMPARISONS);
}

export function removeComparison(
  comparisons: SavedComparison[],
  id: string,
): SavedComparison[] {
  return comparisons.filter((saved) => saved.id !== id);
}

export function isComparisonSaved(
  comparisons: SavedComparison[],
  leftId: string,
  rightId: string,
): boolean {
  const key = comparisonKey(leftId, rightId);
  return comparisons.some((saved) => comparisonKey(saved.leftId, saved.rightId) === key);
}
