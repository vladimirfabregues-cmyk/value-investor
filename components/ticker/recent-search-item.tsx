import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { formatIsoDate } from "@/lib/utils/dates";
import { verdictClasses } from "@/lib/utils/format";
import { exchangeByCode } from "@/lib/finance/exchanges";
import type { SavedAnalysisSummary } from "@/types/analysis";

interface RecentSearchItemProps {
  item: SavedAnalysisSummary;
  active?: boolean;
}

export function RecentSearchItem({ item, active = false }: RecentSearchItemProps) {
  return (
    <Link
      href={`/?analysis=${item.id}&exchange=${encodeURIComponent(item.exchange)}&ticker=${encodeURIComponent(item.ticker)}`}
      className={cn(
        "group block rounded-2xl border px-4 py-3 transition-all",
        active
          ? "border-primary/35 bg-primary/10 shadow-[0_12px_24px_rgba(181,148,88,0.08)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold tracking-[0.18em] text-foreground">
              {item.ticker}
            </span>
            {exchangeByCode(item.exchange) && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {exchangeByCode(item.exchange)!.shortCode}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{item.companyName}</div>
        </div>
        <Badge className={cn("shrink-0", verdictClasses(item.finalVerdictLabel))}>
          {item.finalVerdictLabel.replace("_", " ")}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatIsoDate(item.analysisDate)}</span>
        <span className="truncate pl-3 text-right">{item.oneLineVerdict}</span>
      </div>
    </Link>
  );
}
