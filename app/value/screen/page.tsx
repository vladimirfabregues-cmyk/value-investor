export const dynamic = "force-dynamic";

import { ScreenView } from "@/components/screen/screen-view";
import { AppShell } from "@/components/shell/app-shell";
import { getHistorySummaries } from "@/lib/db/queries";
import { getScreenResults, getScreenMeta } from "@/lib/db/screen-queries";

export default async function ScreenPage() {
  const [history, results, meta] = await Promise.all([
    getHistorySummaries(),
    getScreenResults({ screenerIndex: "RUSSELL2000", sortBy: "compositeScore", sortDir: "desc" }),
    getScreenMeta("RUSSELL2000"),
  ]);

  return (
    <AppShell history={history}>
      <ScreenView initialResults={results} initialMeta={meta} />
    </AppShell>
  );
}
