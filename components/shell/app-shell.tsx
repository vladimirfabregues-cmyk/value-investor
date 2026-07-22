import type { ReactNode } from "react";

import { ShellLayout } from "@/components/shell/shell-layout";
import type { SavedAnalysisSummary } from "@/types/analysis";

interface AppShellProps {
  history: SavedAnalysisSummary[];
  children: ReactNode;
}

/**
 * Server wrapper. The collapsible behaviour lives in ShellLayout because it
 * needs client state; children stay server-rendered and are passed through.
 */
export function AppShell({ history, children }: AppShellProps) {
  return <ShellLayout history={history}>{children}</ShellLayout>;
}
