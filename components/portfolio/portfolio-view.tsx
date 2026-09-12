"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { ValueChart, type ValueSeries } from "@/components/portfolio/value-chart";
import { formatCurrency } from "@/lib/utils/format";
import { formatIsoDate } from "@/lib/utils/dates";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { StoredPortfolio } from "@/lib/db/portfolio-queries";
import type { PortfolioMetrics } from "@/lib/portfolio/metrics";
import type { SavedAnalysisSummary } from "@/types/analysis";

const COLORS: Record<string, { stroke: string; dashed?: boolean }> = {
  BUY_HOLD: { stroke: "#bda26b" },
  REBALANCED: { stroke: "#7fb0a1" },
  BENCHMARK: { stroke: "#8b9fc4", dashed: true },
};

interface PortfolioViewProps {
  history: SavedAnalysisSummary[];
  results: StoredPortfolio[];
}

export function PortfolioView({ history, results }: PortfolioViewProps) {
  const { t, locale } = useTranslation();
  const [showTx, setShowTx] = useState(false);
  const [txStrategy, setTxStrategy] = useState<"BUY_HOLD" | "REBALANCED">("REBALANCED");

  const byStrategy = useMemo(() => new Map(results.map((r) => [r.strategy, r])), [results]);
  const buyHold = byStrategy.get("BUY_HOLD");
  const rebalanced = byStrategy.get("REBALANCED");
  const benchmark = byStrategy.get("BENCHMARK");

  const gbp = (n: number) => formatCurrency(n, "GBP", locale);
  const signedGbp = (n: number) => `${n >= 0 ? "+" : "−"}${formatCurrency(Math.abs(n), "GBP", locale)}`;
  const pct = (frac: number | null) =>
    frac === null
      ? "—"
      : `${frac >= 0 ? "+" : "−"}${(Math.abs(frac) * 100).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 1 })}%`;

  const series: ValueSeries[] = ([buyHold, rebalanced, benchmark].filter(Boolean) as StoredPortfolio[]).map((r) => ({
    id: r.strategy,
    label: t(`portfolio.strategy.${r.strategy}`),
    color: COLORS[r.strategy]?.stroke ?? "#bda26b",
    dashed: COLORS[r.strategy]?.dashed,
    points: r.valuations.map((v) => ({ date: v.date, value: v.totalGbp })),
  }));

  const builtAt = buyHold?.builtAt ?? rebalanced?.builtAt;
  const inception = buyHold?.inceptionDate ?? rebalanced?.inceptionDate;

  return (
    <AppShell history={history}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-primary/90">{t("portfolio.eyebrow")}</p>
          <h1 className="mt-1.5 font-display text-4xl text-foreground">{t("portfolio.title")}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t("portfolio.subtitle")}</p>
          {builtAt && inception && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
              {t("portfolio.builtLine", { built: formatIsoDate(builtAt), inception: formatIsoDate(inception) })}
            </p>
          )}
        </div>

        {!buyHold || !rebalanced ? (
          <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <p className="mt-4 font-display text-xl text-foreground">{t("portfolio.notBuilt")}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("portfolio.notBuiltHint")}</p>
          </div>
        ) : (
          <>
            {/* Value chart */}
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 shadow-panel">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 className="font-display text-lg text-foreground">{t("portfolio.chartTitle")}</h2>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {series.map((s) => (
                    <li key={s.id} className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-3 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden="true" />
                      {s.label}
                    </li>
                  ))}
                </ul>
              </div>
              <ValueChart series={series} format={gbp} baseline={buyHold.capitalGbp} />
            </section>

            {/* Strategy comparison */}
            <div className="grid gap-5 lg:grid-cols-2">
              <StrategyPanel
                title={t("portfolio.strategy.BUY_HOLD")}
                hint={t("portfolio.strategy.buyHoldHint")}
                data={buyHold}
                gbp={gbp}
                signedGbp={signedGbp}
                pct={pct}
                t={t}
                accent={COLORS.BUY_HOLD.stroke}
              />
              <StrategyPanel
                title={t("portfolio.strategy.REBALANCED")}
                hint={t("portfolio.strategy.rebalancedHint")}
                data={rebalanced}
                gbp={gbp}
                signedGbp={signedGbp}
                pct={pct}
                t={t}
                accent={COLORS.REBALANCED.stroke}
              />
            </div>

            {/* Transactions */}
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg text-foreground">{t("portfolio.tx.title")}</h2>
                <div className="flex items-center gap-2">
                  {(["BUY_HOLD", "REBALANCED"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTxStrategy(s)}
                      aria-pressed={txStrategy === s}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        txStrategy === s
                          ? "border-primary/45 bg-primary/15 text-primary"
                          : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t(`portfolio.strategy.${s}`)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowTx((v) => !v)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                  >
                    {showTx ? t("portfolio.tx.hide") : t("portfolio.tx.show")}
                  </button>
                </div>
              </div>
              {showTx && <TxTable data={byStrategy.get(txStrategy)!} gbp={gbp} signedGbp={signedGbp} t={t} />}
            </section>

            <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/80" aria-hidden="true" />
              {t("portfolio.disclaimer")}
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}

function StrategyPanel({
  title,
  hint,
  data,
  gbp,
  signedGbp,
  pct,
  t,
  accent,
}: {
  title: string;
  hint: string;
  data: StoredPortfolio;
  gbp: (n: number) => string;
  signedGbp: (n: number) => string;
  pct: (f: number | null) => string;
  t: (k: string, v?: Record<string, string | number>) => string;
  accent: string;
}) {
  const m = data.metrics as PortfolioMetrics;
  const up = m.totalReturnGbp >= 0;
  const rows: [string, string][] = [
    [t("portfolio.metrics.initial"), gbp(m.initialGbp)],
    [t("portfolio.metrics.grossReturn"), pct(m.grossReturnPct)],
    [t("portfolio.metrics.realised"), signedGbp(m.realisedGbp)],
    [t("portfolio.metrics.unrealised"), signedGbp(m.unrealisedGbp)],
    [t("portfolio.metrics.dividends"), gbp(m.dividendsGbp)],
    [t("portfolio.metrics.costs"), gbp(m.costsGbp)],
    [t("portfolio.metrics.annualised"), pct(m.annualisedPct)],
    [t("portfolio.metrics.vsBenchmark"), m.benchmarkReturnPct === null ? "—" : pct(m.totalReturnPct - m.benchmarkReturnPct)],
  ];
  const shown = data.holdings.slice(0, 8);

  return (
    <section className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-panel">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: accent }} aria-hidden="true" />
        <h2 className="font-display text-lg text-foreground">{title}</h2>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("portfolio.metrics.currentValue")}</p>
          <p className="mt-0.5 font-display text-3xl tabular-nums text-foreground">{gbp(m.currentValueGbp)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("portfolio.metrics.totalReturn")}</p>
          <p className={`mt-0.5 font-display text-2xl tabular-nums ${up ? "text-emerald-300" : "text-red-300"}`}>{pct(m.totalReturnPct)}</p>
          <p className={`text-xs tabular-nums ${up ? "text-emerald-300/80" : "text-red-300/80"}`}>{signedGbp(m.totalReturnGbp)}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/[0.06] pt-4 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums text-foreground/90">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t("portfolio.holdings.count", { n: data.holdings.length })}
        </p>
        {data.holdings.length === 0 ? (
          <p className="mt-1.5 text-xs text-muted-foreground">{t("portfolio.holdings.empty")}</p>
        ) : (
          <ul className="mt-1.5 space-y-1 text-sm">
            {shown.map((h) => (
              <li key={h.ticker} className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-xs text-foreground/85">{h.ticker}</span>
                <span className="tabular-nums text-muted-foreground">{gbp(h.costBasisGbp)}</span>
              </li>
            ))}
            {data.holdings.length > shown.length && (
              <li className="text-xs text-muted-foreground">{t("portfolio.holdings.more", { n: data.holdings.length - shown.length })}</li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}

function TxTable({
  data,
  gbp,
  signedGbp,
  t,
}: {
  data: StoredPortfolio;
  gbp: (n: number) => string;
  signedGbp: (n: number) => string;
  t: (k: string) => string;
}) {
  const txns = [...data.transactions].reverse(); // most recent first
  return (
    <div className="mt-4 max-h-96 overflow-y-auto rounded-xl border border-white/[0.06]">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-[rgba(10,16,28,0.95)] text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">{t("portfolio.tx.date")}</th>
            <th className="px-3 py-2 font-medium">{t("portfolio.tx.type")}</th>
            <th className="px-3 py-2 font-medium">{t("portfolio.tx.security")}</th>
            <th className="px-3 py-2 text-right font-medium">{t("portfolio.tx.amount")}</th>
            <th className="px-3 py-2 text-right font-medium">{t("portfolio.tx.cost")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {txns.map((tx, i) => (
            <tr key={i} className="text-foreground/85">
              <td className="px-3 py-1.5 tabular-nums text-muted-foreground">{tx.date}</td>
              <td className="px-3 py-1.5">{t(`portfolio.tx.${tx.type}`)}</td>
              <td className="px-3 py-1.5 font-mono">{tx.ticker ?? "—"}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{signedGbp(tx.cashDeltaGbp)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{tx.costGbp > 0 ? gbp(tx.costGbp) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
