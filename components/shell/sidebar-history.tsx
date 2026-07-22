"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { GitCompareArrows, History, BarChart2, PanelLeftClose } from "lucide-react";

import { RecentSearchItem } from "@/components/ticker/recent-search-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SavedAnalysisSummary } from "@/types/analysis";

interface SidebarHistoryProps {
  history: SavedAnalysisSummary[];
  /** Supplied on desktop, where the panel can be collapsed */
  onCollapse?: () => void;
  collapseLabel?: string;
}

export function SidebarHistory({
  history,
  onCollapse,
  collapseLabel = "Collapse history",
}: SidebarHistoryProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeAnalysisId = searchParams.get("analysis");

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-200">
            <History className="h-4 w-4 text-primary" aria-hidden="true" />
            History
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Saved analyses and verdict snapshots.
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

      <div className="mb-5 flex flex-col gap-2">
        <Button asChild variant="secondary" className="w-full justify-start">
          <Link href="/screen">
            <BarChart2 className="h-4 w-4" aria-hidden="true" />
            Market Screener
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full justify-start">
          <Link href="/compare">
            <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
            Compare stocks
          </Link>
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            No analyses saved yet. Choose a market and analyse a company to build your history.
          </div>
        ) : (
          history.map((item) => (
            <RecentSearchItem
              key={item.id}
              item={item}
              active={pathname === "/" && activeAnalysisId === item.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
