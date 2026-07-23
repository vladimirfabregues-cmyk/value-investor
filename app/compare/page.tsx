export const dynamic = "force-dynamic";

import { CompareView } from "@/components/compare/compare-view";
import { getHistorySummaries } from "@/lib/db/queries";

interface ComparePageProps {
  /** `?left=` and `?right=` make a comparison linkable, e.g. from a history entry */
  searchParams: Promise<{ left?: string; right?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const [history, params] = await Promise.all([getHistorySummaries(), searchParams]);

  return (
    <CompareView
      initialHistory={history}
      initialLeftId={params.left ?? null}
      initialRightId={params.right ?? null}
    />
  );
}
