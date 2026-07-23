/**
 * Per-browser preferences for the History panel: pinned companies, personal
 * notes and archived runs.
 *
 * These are the user's own annotations, not analysis output, so they live in
 * localStorage rather than the database — no schema change, and nothing
 * personal leaves the device. Written to the same defensive standard as
 * `lib/utils/history-panel.ts`: storage can throw, and a failure here must
 * never break the page.
 *
 * Pins and notes key on the *security* (market + ticker) so they survive
 * re-analysing a company. Archiving keys on the analysis id, because what you
 * archive is one stale run, not the company.
 */

export const HISTORY_PREFS_KEY = "vi:history-prefs";

/** Long enough for a real note, short enough to never threaten the quota. */
export const MAX_NOTE_LENGTH = 500;

export interface HistoryPrefs {
  /** Security keys, e.g. "XLON:DPLM.L" */
  pinned: string[];
  /** Security key → note */
  notes: Record<string, string>;
  /** Analysis ids hidden from the default list */
  archived: string[];
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export const EMPTY_PREFS: HistoryPrefs = { pinned: [], notes: {}, archived: [] };

function defaultStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
    : [];
}

function toNotes(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const notes: Record<string, string> = {};
  for (const [key, note] of Object.entries(value)) {
    if (typeof note === "string" && note.trim()) {
      notes[key] = note.slice(0, MAX_NOTE_LENGTH);
    }
  }
  return notes;
}

/** Reads preferences, tolerating absent, corrupt or partial stored data. */
export function readHistoryPrefs(
  storage: StorageLike | null = defaultStorage(),
): HistoryPrefs {
  if (!storage) return EMPTY_PREFS;
  try {
    const raw = storage.getItem(HISTORY_PREFS_KEY);
    if (!raw) return EMPTY_PREFS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_PREFS;
    const record = parsed as Record<string, unknown>;
    return {
      pinned: toStringArray(record.pinned),
      notes: toNotes(record.notes),
      archived: toStringArray(record.archived),
    };
  } catch {
    // Corrupt JSON or blocked storage — start from a clean slate rather than
    // leaving the panel unusable.
    return EMPTY_PREFS;
  }
}

/** Persists preferences; silently no-ops when storage is unavailable. */
export function writeHistoryPrefs(
  prefs: HistoryPrefs,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(HISTORY_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* storage full or blocked — annotations simply won't persist */
  }
}

// ── Pure updates ────────────────────────────────────────────────────────────

function toggleMember(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

export function togglePinned(prefs: HistoryPrefs, securityKey: string): HistoryPrefs {
  return { ...prefs, pinned: toggleMember(prefs.pinned, securityKey) };
}

export function toggleArchived(prefs: HistoryPrefs, analysisId: string): HistoryPrefs {
  return { ...prefs, archived: toggleMember(prefs.archived, analysisId) };
}

/** Setting an empty note removes it, so blank entries never accumulate. */
export function setNote(
  prefs: HistoryPrefs,
  securityKey: string,
  note: string,
): HistoryPrefs {
  const trimmed = note.trim().slice(0, MAX_NOTE_LENGTH);
  const notes = { ...prefs.notes };
  if (trimmed) notes[securityKey] = trimmed;
  else delete notes[securityKey];
  return { ...prefs, notes };
}

export function isPinned(prefs: HistoryPrefs, securityKey: string): boolean {
  return prefs.pinned.includes(securityKey);
}

export function isArchived(prefs: HistoryPrefs, analysisId: string): boolean {
  return prefs.archived.includes(analysisId);
}

export function noteFor(prefs: HistoryPrefs, securityKey: string): string {
  return prefs.notes[securityKey] ?? "";
}
