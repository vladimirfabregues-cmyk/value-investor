"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  History,
  PanelLeftClose,
  Pin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { RecentSearchItem } from "@/components/ticker/recent-search-item";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { formatIsoDate } from "@/lib/utils/dates";
import { verdictClasses } from "@/lib/utils/format";
import {
  EMPTY_FILTERS,
  entrySecurityKey,
  exchangeFacets,
  filterHistory,
  groupHistoryByCompany,
  hasActiveFilters,
  verdictFacets,
  type CompanyHistoryGroup,
  type HistoryFilters,
} from "@/lib/history/history-filters";
import {
  buildChangeIndex,
  describeMarginShift,
  describeVerdictChange,
} from "@/lib/history/history-changes";
import { useTranslation } from "@/lib/i18n/locale-context";
import {
  EMPTY_PREFS,
  isArchived,
  isPinned,
  noteFor,
  readHistoryPrefs,
  setNote,
  toggleArchived,
  togglePinned,
  writeHistoryPrefs,
  type HistoryPrefs,
} from "@/lib/history/history-prefs";
import type { SavedAnalysisSummary, VerdictLabel } from "@/types/analysis";

interface SidebarHistoryProps {
  history: SavedAnalysisSummary[];
  /** Supplied on desktop, where the panel can be collapsed */
  onCollapse?: () => void;
  collapseLabel?: string;
}

/** Small filter toggle; pressed state is carried by text and outline, not colour alone. */
function FacetChip({
  label,
  count,
  pressed,
  onToggle,
}: {
  label: string;
  count: number;
  pressed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={pressed}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        pressed
          ? "border-primary/50 bg-primary/15 text-foreground"
          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground",
      )}
    >
      {label}
      <span className="ml-1 text-muted-foreground">{count}</span>
    </button>
  );
}

/** Change-line colour; the wording always carries the meaning on its own. */
const TONE_TEXT: Record<"positive" | "negative" | "neutral", string> = {
  positive: "text-emerald-300",
  negative: "text-red-300",
  neutral: "text-muted-foreground",
};

export function SidebarHistory({
  history,
  onCollapse,
  collapseLabel = "Collapse history",
}: SidebarHistoryProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeAnalysisId = searchParams.get("analysis");
  const { t } = useTranslation();

  const [filters, setFilters] = useState<HistoryFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [prefs, setPrefs] = useState<HistoryPrefs>(EMPTY_PREFS);

  // Annotations live in localStorage, which the server cannot see. Reading
  // after mount keeps the first client render identical to the server's.
  useEffect(() => setPrefs(readHistoryPrefs()), []);

  function updatePrefs(next: HistoryPrefs) {
    setPrefs(next);
    writeHistoryPrefs(next);
  }

  // Built from the full history, not the filtered view, so "what changed"
  // stays accurate while a filter is applied.
  const changes = useMemo(() => buildChangeIndex(history), [history]);

  const archivedCount = useMemo(
    () => history.filter((item) => isArchived(prefs, item.id)).length,
    [history, prefs],
  );

  const visible = useMemo(() => {
    const withArchivePolicy = showArchived
      ? history
      : history.filter((item) => !isArchived(prefs, item.id));
    return filterHistory(withArchivePolicy, filters);
  }, [history, prefs, showArchived, filters]);

  // One entry per company, most-recently-revisited first, with earlier runs
  // folded into an expandable timeline (P7-1).
  const pinnedGroups = useMemo(
    () => groupHistoryByCompany(visible.filter((item) => isPinned(prefs, entrySecurityKey(item)))),
    [visible, prefs],
  );
  const unpinnedGroups = useMemo(
    () => groupHistoryByCompany(visible.filter((item) => !isPinned(prefs, entrySecurityKey(item)))),
    [visible, prefs],
  );

  const verdicts = useMemo(() => verdictFacets(history), [history]);
  const markets = useMemo(() => exchangeFacets(history), [history]);
  const filtering = hasActiveFilters(filters);

  function toggleVerdict(verdict: VerdictLabel) {
    setFilters((current) => ({
      ...current,
      verdicts: current.verdicts.includes(verdict)
        ? current.verdicts.filter((entry) => entry !== verdict)
        : [...current.verdicts, verdict],
    }));
  }

  function toggleExchange(code: string) {
    setFilters((current) => ({
      ...current,
      exchanges: current.exchanges.includes(code)
        ? current.exchanges.filter((entry) => entry !== code)
        : [...current.exchanges, code],
    }));
  }

  /** Earlier runs of one company, newest first — a compact changelog under the
   *  head card. Each row opens that specific run and states how it moved. */
  function renderTimeline(runs: SavedAnalysisSummary[]) {
    return (
      <details className="group/timeline ml-2 border-l border-white/8 pl-3">
        <summary className="flex cursor-pointer list-none items-center gap-1 rounded text-[11px] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [&::-webkit-details-marker]:hidden">
          <ChevronRight
            className="h-3 w-3 shrink-0 transition-transform group-open/timeline:rotate-90"
            aria-hidden="true"
          />
          {t(runs.length === 1 ? "history.earlierRuns.one" : "history.earlierRuns.other", {
            n: runs.length,
          })}
        </summary>
        <ol className="mt-2 space-y-2">
          {runs.map((run) => {
            const change = changes.get(run.id);
            const verdictChange = describeVerdictChange(run.finalVerdictLabel, change);
            const marginShift = describeMarginShift(change);
            return (
              <li key={run.id}>
                <Link
                  href={`/value?analysis=${run.id}&exchange=${encodeURIComponent(run.exchange)}&ticker=${encodeURIComponent(run.ticker)}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-1 py-1 text-xs text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <span className="tabular-nums">{formatIsoDate(run.analysisDate)}</span>
                  <Badge className={cn("shrink-0", verdictClasses(run.finalVerdictLabel))}>
                    {t(`verdict.${run.finalVerdictLabel}`)}
                  </Badge>
                </Link>
                {(verdictChange || marginShift) && (
                  <div className="mt-0.5 pl-1 text-[11px] leading-4">
                    {verdictChange && <p className={TONE_TEXT[verdictChange.tone]}>{verdictChange.text}</p>}
                    {marginShift && <p className={TONE_TEXT[marginShift.tone]}>{marginShift.text}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </details>
    );
  }

  /** Renders one company: the latest run as the head card, older runs folded
   *  into an expandable timeline beneath it (P7-1). */
  function renderCompany(group: CompanyHistoryGroup) {
    const { key, latest, older } = group;
    const change = changes.get(latest.id);
    return (
      <div key={key} className="space-y-2">
        <RecentSearchItem
          item={latest}
          active={pathname === "/" && activeAnalysisId === latest.id}
          verdictChange={describeVerdictChange(latest.finalVerdictLabel, change)}
          marginShift={describeMarginShift(change)}
          pinned={isPinned(prefs, key)}
          archived={isArchived(prefs, latest.id)}
          note={noteFor(prefs, key)}
          onTogglePin={() => updatePrefs(togglePinned(prefs, key))}
          onToggleArchive={() => updatePrefs(toggleArchived(prefs, latest.id))}
          onNoteChange={(note) => updatePrefs(setNote(prefs, key, note))}
        />
        {older.length > 0 && renderTimeline(older)}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-200">
            <History className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("history.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("history.subtitle")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant="secondary">{history.length}</Badge>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              aria-expanded={true}
              aria-controls="history-panel"
              title={collapseLabel}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            >
              <PanelLeftClose className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">{collapseLabel}</span>
            </button>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="mb-4 space-y-2">
          <div>
            <label htmlFor="history-search" className="mb-1.5 block text-xs font-medium text-foreground">
              {t("history.searchLabel")}
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="history-search"
                type="search"
                value={filters.query}
                placeholder={t("history.searchPlaceholder")}
                autoComplete="off"
                onChange={(event) =>
                  setFilters((current) => ({ ...current, query: event.target.value }))
                }
                className="h-9 pl-9 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="history-facets"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              {t("history.filters")}
              {(filters.verdicts.length > 0 || filters.exchanges.length > 0) && (
                <span className="rounded-full bg-primary/20 px-1.5 text-[10px] text-foreground">
                  {filters.verdicts.length + filters.exchanges.length}
                </span>
              )}
            </button>
            {filtering && (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                {t("history.clear")}
              </button>
            )}
          </div>

          {filtersOpen && (
            <div id="history-facets" className="space-y-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <fieldset>
                <legend className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("history.verdict")}
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {verdicts.map((facet) => (
                    <FacetChip
                      key={facet.value}
                      label={t(`verdict.${facet.value}`)}
                      count={facet.count}
                      pressed={filters.verdicts.includes(facet.value)}
                      onToggle={() => toggleVerdict(facet.value)}
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("history.market")}
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {markets.map((facet) => (
                    <FacetChip
                      key={facet.value}
                      label={facet.label}
                      count={facet.count}
                      pressed={filters.exchanges.includes(facet.value)}
                      onToggle={() => toggleExchange(facet.value)}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            {t("history.emptyNone")}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            {filtering ? t("history.emptyFiltered") : t("history.emptyAllArchived")}
          </div>
        ) : (
          <>
            {pinnedGroups.length > 0 && (
              <section aria-labelledby="history-pinned">
                <h3
                  id="history-pinned"
                  className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground"
                >
                  <Pin className="h-3 w-3" aria-hidden="true" />
                  {t("history.pinned")}
                </h3>
                <div className="space-y-3">{pinnedGroups.map(renderCompany)}</div>
              </section>
            )}

            {unpinnedGroups.length > 0 && (
              <div className="space-y-3">{unpinnedGroups.map(renderCompany)}</div>
            )}
          </>
        )}
      </div>

      {archivedCount > 0 && (
        <button
          type="button"
          onClick={() => setShowArchived((shown) => !shown)}
          aria-pressed={showArchived}
          className="mt-3 shrink-0 rounded-lg border border-white/8 px-3 py-2 text-xs text-muted-foreground transition hover:border-white/16 hover:text-foreground"
        >
          {t(showArchived ? "history.hideArchived" : "history.showArchived", { n: archivedCount })}
        </button>
      )}
    </div>
  );
}
