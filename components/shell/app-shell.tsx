import { Suspense, type ReactNode } from "react";

import { SidebarHistory } from "@/components/shell/sidebar-history";
import { Topbar } from "@/components/shell/topbar";
import type { SavedAnalysisSummary } from "@/types/analysis";

interface AppShellProps {
  history: SavedAnalysisSummary[];
  children: ReactNode;
}

export function AppShell({ history, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-[320px] border-r border-white/6 bg-[rgba(4,9,18,0.92)] px-6 py-8 lg:block">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading history...</div>}>
          <SidebarHistory history={history} />
        </Suspense>
      </aside>
      <div className="min-h-screen lg:pl-[320px]">
        <Topbar history={history} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
