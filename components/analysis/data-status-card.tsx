import { DatabaseZap } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EvidenceHeader } from "@/components/analysis/evidence";
import { exchangeByCode } from "@/lib/finance/exchanges";
import { formatCurrency } from "@/lib/utils/format";
import { formatIsoDate } from "@/lib/utils/dates";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { DataStatus, ValueInvestingAnalysis } from "@/types/analysis";

const PRICE_STATE_KEY: Record<DataStatus["price_state"], string> = {
  delayed: "analysis.dataStatus.priceState.delayed",
  closed: "analysis.dataStatus.priceState.closed",
  prepost: "analysis.dataStatus.priceState.prepost",
  asof: "analysis.dataStatus.priceState.asof",
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
  const { t, locale } = useTranslation();
  const status = analysis.data_status;
  if (!status) return null;

  const exchange = exchangeByCode(status.exchange);
  const a = status.assumptions;

  return (
    <Card>
      <CardHeader>
        <EvidenceHeader
          icon={<DatabaseZap className="h-5 w-5" />}
          title={t("analysis.dataStatus.title")}
          summary={t("analysis.dataStatus.subtitle")}
        />
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-white/[0.05] overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <Row label={t("analysis.dataStatus.marketPrice")}>
            <span className="tabular-nums">
              {formatCurrency(analysis.current_price, status.currency, locale)}
            </span>
            <span className="text-muted-foreground">
              {" · "}
              {formatQuoteTime(status.price_as_of, status.price_timezone)}
            </span>
            <span className="ml-1.5 rounded border border-white/10 px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {t(PRICE_STATE_KEY[status.price_state])}
            </span>
          </Row>

          <Row label={t("analysis.dataStatus.incomeStatement")}>
            {status.income_statement_period ? (
              <span className="tabular-nums">
                {t("analysis.dataStatus.yearTo", { date: formatIsoDate(status.income_statement_period) })}
              </span>
            ) : (
              <span className="text-muted-foreground">{t("common.notRecorded")}</span>
            )}
          </Row>

          <Row label={t("analysis.dataStatus.balanceSheet")}>
            {status.balance_sheet_period ? (
              <span className="tabular-nums">
                {t("analysis.dataStatus.asAt", { date: formatIsoDate(status.balance_sheet_period) })}
              </span>
            ) : (
              <span className="text-muted-foreground">{t("common.notRecorded")}</span>
            )}
          </Row>

          <Row label={t("analysis.dataStatus.reportingCurrency")}>{status.currency}</Row>

          <Row label={t("analysis.dataStatus.exchange")}>{exchange ? `${exchange.name} (${exchange.shortCode})` : status.exchange}</Row>

          <Row label={t("analysis.dataStatus.sources")}>
            {/* Whether a second source was needed is itself provenance */}
            <span>{status.sources.join(" · ")}</span>
            {status.edgar_supplemented && (
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {t("analysis.dataStatus.edgarNote")}
              </span>
            )}
          </Row>

          <Row label={t("analysis.dataStatus.missingFields")}>
            {status.missing_fields.length === 0 ? (
              <span className="text-emerald-300">{t("common.none")}</span>
            ) : (
              <span className="text-amber-300">{status.missing_fields.join(", ")}</span>
            )}
          </Row>

          {status.data_quality_notes.length > 0 && (
            <Row label={t("analysis.dataStatus.dataQualityNotes")}>
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
            <Row label={t("analysis.dataStatus.modelAssumptions")}>
              <span className="tabular-nums text-muted-foreground">
                {t("analysis.dataStatus.assumptionsLine", {
                  discount: a.discount_rate_pct,
                  terminal: a.terminal_growth_pct,
                  cap: a.max_growth_cap_pct,
                })}
                {a.use_conservative_fcf_basis ? t("analysis.dataStatus.conservativeFcf") : ""}
              </span>
            </Row>
          )}

          <Row label={t("analysis.dataStatus.modelVersion")}>
            <span className="tabular-nums">{status.model_version}</span>
          </Row>
        </dl>
      </CardContent>
    </Card>
  );
}
