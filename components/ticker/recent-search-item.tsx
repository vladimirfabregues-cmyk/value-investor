"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  GitCompareArrows,
  Pin,
  PinOff,
  RefreshCw,
  StickyNote,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { formatIsoDate } from "@/lib/utils/dates";
import { verdictClasses } from "@/lib/utils/format";
import { exchangeByCode } from "@/lib/finance/exchanges";
import { formatValuationGapShort } from "@/lib/finance/valuation-gap";
import { MAX_NOTE_LENGTH } from "@/lib/history/history-prefs";
import type { ChangeDescription } from "@/lib/history/history-changes";
import type { SavedAnalysisSummary } from "@/types/analysis";

interface RecentSearchItemProps {
  item: SavedAnalysisSummary;
  active?: boolean;
  /** Previous-versus-current verdict, when an earlier analysis exists */
  verdictChange?: ChangeDescription | null;
  /** Movement in the valuation gap since that earlier analysis */
  marginShift?: ChangeDescription | null;
  pinned?: boolean;
  archived?: boolean;
  note?: string;
  /** Supplying any handler opts the entry into the actions row */
  onTogglePin?: () => void;
  onToggleArchive?: () => void;
  onNoteChange?: (note: string) => void;
}

const TONE_TEXT: Record<ChangeDescription["tone"], string> = {
  positive: "text-emerald-300",
  negative: "text-red-300",
  neutral: "text-muted-foreground",
};

/** Shared shape for the small icon buttons in the actions row. */
const ACTION_CLASS =
  "relative z-10 rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-muted-foreground transition hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

export function RecentSearchItem({
  item,
  active = false,
  verdictChange = null,
  marginShift = null,
  pinned = false,
  archived = false,
  note = "",
  onTogglePin,
  onToggleArchive,
  onNoteChange,
}: RecentSearchItemProps) {
  const exchange = exchangeByCode(item.exchange);
  const [editingNote, setEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(note);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Keep the draft in step when the stored note changes underneath us.
  useEffect(() => setDraftNote(note), [note]);
  useEffect(() => {
    if (editingNote) noteRef.current?.focus();
  }, [editingNote]);

  const showActions = Boolean(onTogglePin || onToggleArchive || onNoteChange);

  function commitNote() {
    setEditingNote(false);
    if (draftNote.trim() !== note) onNoteChange?.(draftNote);
  }

  return (
    <div
      className={cn(
        "group relative rounded-2xl border px-4 py-3 transition-all",
        active
          ? "border-primary/35 bg-primary/10 shadow-[0_12px_24px_rgba(181,148,88,0.08)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]",
        archived && "opacity-60",
      )}
    >
      {/* Identity — market and ticker together, never the ticker alone */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            {pinned && (
              <Pin className="h-3 w-3 shrink-0 self-center text-primary" aria-label="Pinned" />
            )}
            <span className="text-sm font-semibold tracking-[0.18em] text-foreground">
              {item.ticker}
            </span>
            {exchange && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {exchange.shortCode}
              </span>
            )}
          </div>
          {/* Stretched link: the whole card opens the analysis, but the action
              buttons above it stay independently clickable. */}
          <Link
            href={`/?analysis=${item.id}&exchange=${encodeURIComponent(item.exchange)}&ticker=${encodeURIComponent(item.ticker)}`}
            className="mt-1 block truncate text-sm text-muted-foreground after:absolute after:inset-0 after:content-[''] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {item.companyName}
          </Link>
        </div>
        <Badge className={cn("shrink-0", verdictClasses(item.finalVerdictLabel))}>
          {item.finalVerdictLabel.replace("_", " ")}
        </Badge>
      </div>

      {/* Why the verdict landed there, then the gap, then when */}
      <p className="text-xs leading-5 text-zinc-300">{item.verdictReason}</p>
      <p className="text-xs leading-5 text-muted-foreground">
        {formatValuationGapShort(item.marginOfSafetyPct)}
      </p>
      <p className="text-xs leading-5 text-muted-foreground">
        Analysed {formatIsoDate(item.analysisDate)}
      </p>

      {/* What changed since the previous run of this same security */}
      {(verdictChange || marginShift) && (
        // One line each: at 320px these wrap, and a mid-sentence separator
        // stranded at the start of a wrapped line reads as a typo.
        <div className="mt-1.5 text-[11px] leading-5">
          {verdictChange && (
            <p className={TONE_TEXT[verdictChange.tone]}>{verdictChange.text}</p>
          )}
          {marginShift && <p className={TONE_TEXT[marginShift.tone]}>{marginShift.text}</p>}
        </div>
      )}

      {note && !editingNote && (
        <p className="relative z-10 mt-2 rounded-lg border border-white/8 bg-white/[0.04] px-2.5 py-1.5 text-[11px] leading-5 text-zinc-300">
          {note}
        </p>
      )}

      {editingNote && (
        <div className="relative z-10 mt-2">
          <label htmlFor={`note-${item.id}`} className="sr-only">
            Note on {item.companyName}
          </label>
          <textarea
            id={`note-${item.id}`}
            ref={noteRef}
            value={draftNote}
            maxLength={MAX_NOTE_LENGTH}
            rows={3}
            placeholder="Your note on this company"
            onChange={(event) => setDraftNote(event.target.value)}
            onBlur={commitNote}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setDraftNote(note);
                setEditingNote(false);
              }
              // Enter commits; Shift+Enter keeps the newline.
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                commitNote();
              }
            }}
            className="w-full rounded-lg border border-white/12 bg-[#0b1220] px-2.5 py-1.5 text-[11px] leading-5 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </div>
      )}

      {showActions && (
        // Revealed on hover, but always present for keyboard and screen-reader
        // users — focus-within keeps it visible while tabbing through.
        <div className="mt-2 flex items-center gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <Link
            href={`/?exchange=${encodeURIComponent(item.exchange)}&ticker=${encodeURIComponent(item.ticker)}`}
            className={ACTION_CLASS}
            title="Analyse again"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Analyse {item.ticker} again</span>
          </Link>

          <Link
            href={`/compare?left=${encodeURIComponent(item.id)}`}
            className={ACTION_CLASS}
            title="Compare"
          >
            <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Compare {item.ticker} with another company</span>
          </Link>

          {onNoteChange && (
            <button
              type="button"
              onClick={() => setEditingNote((open) => !open)}
              className={ACTION_CLASS}
              title={note ? "Edit note" : "Add note"}
              aria-expanded={editingNote}
            >
              <StickyNote className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">
                {note ? "Edit the note on" : "Add a note to"} {item.ticker}
              </span>
            </button>
          )}

          {onTogglePin && (
            <button
              type="button"
              onClick={onTogglePin}
              className={ACTION_CLASS}
              title={pinned ? "Unpin" : "Pin to the top"}
              aria-pressed={pinned}
            >
              {pinned ? (
                <PinOff className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Pin className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="sr-only">
                {pinned ? "Unpin" : "Pin"} {item.ticker}
              </span>
            </button>
          )}

          {onToggleArchive && (
            <button
              type="button"
              onClick={onToggleArchive}
              className={ACTION_CLASS}
              title={archived ? "Restore" : "Archive"}
              aria-pressed={archived}
            >
              {archived ? (
                <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Archive className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="sr-only">
                {archived ? "Restore this analysis of" : "Archive this analysis of"} {item.ticker}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
