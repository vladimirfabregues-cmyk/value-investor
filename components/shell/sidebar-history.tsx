"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { GitCompareArrows, History, BarChart2 } from "lucide-react";

import { RecentSearchItem } from "@/components/ticker/recent-search-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SavedAnalysisSummary } from "@/types/analysis";

interface SidebarHistoryProps {
  history: SavedAnalysisSummary[];
}

export function SidebarHistory({ history }: SidebarHistoryProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeAnalysisId = searchParams.get("analysis");

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-200">
            <History className="h-4 w-4 text-primary" />
            History
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Saved analyses and verdict snapshots.
          </p>
        </div>
        <Badge variant="secondary">{history.length}</Badge>
      </div>

      <div className="mb-5 flex flex-col gap-2">
        <Button asChild variant="secondary" className="w-full justify-start">
          <Link href="/screen">
            <BarChart2 className="h-4 w-4" />
            S&amp;P 500 Screener
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full justify-start">
          <Link href="/compare">
            <GitCompareArrows className="h-4 w-4" />
            Compare Analyses
          </Link>
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            No analyses saved yet. Run AAPL, MSFT, BRK.B, or INTC to seed the history.
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
