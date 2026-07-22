"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { SidebarHistory } from "@/components/shell/sidebar-history";
import { Topbar } from "@/components/shell/topbar";
import {
  historyLabel,
  readHistoryCollapsed,
  writeHistoryCollapsed,
} from "@/lib/utils/history-panel";
import type { SavedAnalysisSummary } from "@/types/analysis";

interface ShellLayoutProps {
  history: SavedAnalysisSummary[];
  children: ReactNode;
}

/**
 * Holds the History panel's collapsed state.
 *
 * The preference is read after mount rather than during render: localStorage
 * is unavailable on the server, so reading it inline would desynchronise the
 * server and client markup.
 */
export function ShellLayout({ history, children }: ShellLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(readHistoryCollapsed());
    setHydrated(true);
  }, []);

  function toggle(next: boolean) {
    setCollapsed(next);
    writeHistoryCollapsed(next);
  }

  const label = historyLabel(history.length);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Desktop: full panel ── */}
      <aside
        id="history-panel"
        aria-label="Analysis history"
        hidden={collapsed}
        className={`fixed inset-y-0 left-0 z-30 w-[320px] border-r border-white/6 bg-[rgba(4,9,18,0.92)] px-6 py-8 ${
          collapsed ? "lg:hidden" : "hidden lg:block"
        }`}
      >
        <Suspense fallback={<HistorySkeleton />}>
          <SidebarHistory
            history={history}
            onCollapse={() => toggle(true)}
            collapseLabel="Collapse history"
          />
        </Suspense>
      </aside>

      {/* ── Desktop: collapsed rail — history is never fully unreachable ── */}
      {collapsed && (
        <div className="fixed inset-y-0 left-0 z-30 hidden w-14 flex-col items-center border-r border-white/6 bg-[rgba(4,9,18,0.92)] py-6 lg:flex">
          <button
            type="button"
            onClick={() => toggle(false)}
            aria-expanded={false}
            aria-controls="history-panel"
            title={`Open ${label.toLowerCase()}`}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-muted-foreground transition hover:border-primary/30 hover:text-primary"
          >
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Open {label.toLowerCase()}</span>
          </button>
          <span
            aria-hidden="true"
            className="mt-4 select-none text-[10px] uppercase tracking-[0.2em] text-muted-foreground [writing-mode:vertical-rl]"
          >
            {label}
          </span>
        </div>
      )}

      <div
        className={
          hydrated
            ? collapsed
              ? "min-h-screen transition-[padding] duration-200 lg:pl-14"
              : "min-h-screen transition-[padding] duration-200 lg:pl-[320px]"
            : "min-h-screen lg:pl-[320px]"
        }
      >
        <Topbar history={history} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

/** Stable skeleton — avoids shifting text like "Loading history…". */
function HistorySkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">Loading history</span>
      <div className="h-4 w-24 rounded bg-white/[0.06]" />
      <div className="h-20 rounded-2xl bg-white/[0.04]" />
      <div className="h-20 rounded-2xl bg-white/[0.04]" />
      <div className="h-20 rounded-2xl bg-white/[0.04]" />
    </div>
  );
}

export { HistorySkeleton };
