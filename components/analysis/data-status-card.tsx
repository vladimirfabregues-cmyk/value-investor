import { DatabaseZap } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EvidenceHeader } from "@/components/analysis/evidence";
import { exchangeByCode } from "@/lib/finance/exchanges";
import { formatCurrency } from "@/lib/utils/format";
import { formatIsoDate } from "@/lib/utils/dates";
import type { DataStatus, ValueInvestingAnalysis } from "@/types/analysis";

const PRICE_STATE_LABEL: Record<DataStatus["price_state"], string> = {
  delayed: "Delayed quote",
  closed: "At last close",
  prepost: "Extended-hours quote",
  asof: "As reported",
};

/**
 * Render the quote timestamp in the listing exchange's own timezone when we
 * have a valid IANA zone; otherwise fall back to the viewer's locale and append
 * whatever short code the provider gave. Never throws on an unknown zone.
 */
function formatQuoteTime(iso: string, timezone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not recorded";

  const base: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  // A slash marks an IANA zone (e.g. "America/New_York"); short codes ("EDT") are not.
  if (timezone && timezone.includes("/")) {
    try {
      const formatted = new Intl.DateTimeFormat("en-GB", {
        ...base,
        timeZone: timezone,
        timeZoneName: "short",
      }).format(date);
      return formatted;
    } catch {
      /* invalid zone — fall through to local formatting */
    }
  }

  const local = new Intl.DateTimeFormat("en-GB", base).format(date);
  return timezone ? `${local} ${timezone}` : local;
}

/** One stacked label/value row; long values (timestamps, notes) wrap freely. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground sm:text-right">{children}</dd>
    </div>
  );
}

export function DataStatusCard({ analysis }: { analysis: ValueInvestingAnalysis }) {
  const status = analysis.data_status;
  if (!status) return null;

  const exchange = exchangeByCode(status.exchange);
  const a = status.assumptions;

  return (
    <Card>
      <CardHeader>
        <EvidenceHeader
          icon={<DatabaseZap className="h-5 w-5" />}
          title="Data status"
          summary="Exactly what this analysis is based on, and when — so every figure can be traced to its source."
        />
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-white/[0.05] overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <Row label="Market price">
            <span className="tabular-nums">
              {formatCurrency(analysis.current_price, status.currency)}
            </span>
            <span className="text-muted-foreground">
              {" · "}
              {formatQuoteTime(status.price_as_of, status.price_timezone)}
            </span>
            <span className="ml-1.5 rounded border border-white/10 px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {PRICE_STATE_LABEL[status.price_state]}
            </span>
          </Row>

          <Row label="Income statement">
            {status.income_statement_period ? (
              <span className="tabular-nums">
                Year to {formatIsoDate(status.income_statement_period)}
              </span>
            ) : (
              <span className="text-muted-foreground">Not recorded</span>
            )}
          </Row>

          <Row label="Balance sheet">
            {status.balance_sheet_period ? (
              <span className="tabular-nums">
                As at {formatIsoDate(status.balance_sheet_period)}
              </span>
            ) : (
              <span className="text-muted-foreground">Not recorded</span>
            )}
          </Row>

          <Row label="Reporting currency">{status.currency}</Row>

          <Row label="Exchange">{exchange ? `${exchange.name} (${exchange.shortCode})` : status.exchange}</Row>

          <Row label="Sources">
            {/* Whether a second source was needed is itself provenance */}
            <span>{status.sources.join(" · ")}</span>
            {status.edgar_supplemented && (
              <span className="mt-0.5 block text-xs text-muted-foreground">
                SEC EDGAR filled gaps Yahoo Finance left; figures were merged, not reconciled for
                disagreement.
              </span>
            )}
          </Row>

          <Row label="Missing fields">
            {status.missing_fields.length === 0 ? (
              <span className="text-emerald-300">None</span>
            ) : (
              <span className="text-amber-300">{status.missing_fields.join(", ")}</span>
            )}
          </Row>

          {status.data_quality_notes.length > 0 && (
            <Row label="Data-quality notes">
              <ul className="space-y-1 sm:text-right">
                {status.data_quality_notes.map((note) => (
                  <li key={note} className="text-amber-200/90">
                    {note}
                  </li>
                ))}
              </ul>
            </Row>
          )}

          {a && (
            <Row label="Model assumptions">
              <span className="tabular-nums text-muted-foreground">
                {a.discount_rate_pct}% discount · {a.terminal_growth_pct}% terminal growth ·{" "}
                {a.max_growth_cap_pct}% growth cap
                {a.use_conservative_fcf_basis ? " · conservative FCF basis" : ""}
              </span>
            </Row>
          )}

          <Row label="Model version">
            <span className="tabular-nums">{status.model_version}</span>
          </Row>
        </dl>
      </CardContent>
    </Card>
  );
}
