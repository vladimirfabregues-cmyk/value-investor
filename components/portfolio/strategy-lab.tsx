"use client";

import { FlaskConical } from "lucide-react";

import { formatCurrency } from "@/lib/utils/format";
import { formatIsoDate } from "@/lib/utils/dates";
import { useTranslation } from "@/lib/i18n/locale-context";
import { LAB_RULES } from "@/lib/portfolio/lab";
import type { LabRow } from "@/lib/db/portfolio-queries";

/** Display order when results tie (e.g. before any week has passed since the rules were fixed). */
const ORDER = [
  "REBALANCED",
  "LAB_TOP20",
  "LAB_STICKY",
  "LAB_MONTHLY",
  "LAB_US",
  "LAB_UK",
  "LAB_EU",
  "LAB_JP",
  "BUY_HOLD",
  "BENCHMARK",
];
const REFERENCE = new Set(["BUY_HOLD", "BENCHMARK"]);

export function StrategyLab({ rows, inception }: { rows: LabRow[]; inception: string }) {
  const { t, locale } = useTranslation();
  const nf = (n: number, digits = 1) =>
    n.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const signed = (frac: number | null | undefined, unit = "%") =>
    frac === null || frac === undefined ? "—" : `${frac >= 0 ? "+" : "−"}${nf(Math.abs(frac) * 100)}${unit}`;
  const tone = (frac: number | null | undefined) =>
    frac === null || frac === undefined ? "text-muted-foreground" : frac >= 0 ? "text-emerald-300" : "text-red-300";

  const books = rows
    .filter((r) => ORDER.includes(r.strategy))
    .sort(
      (a, b) =>
        (b.metrics.sinceFixedPct ?? -Infinity) - (a.metrics.sinceFixedPct ?? -Infinity) ||
        b.metrics.totalReturnPct - a.metrics.totalReturnPct ||
        ORDER.indexOf(a.strategy) - ORDER.indexOf(b.strategy),
    );
  const hasLab = books.some((r) => r.strategy.startsWith("LAB_"));

  const fixedOn = formatIsoDate(LAB_RULES.fixedOn);
  const head = [
    t("portfolio.lab.col.sinceFixed", { date: fixedOn }),
    t("portfolio.lab.col.sinceInception", { date: formatIsoDate(inception) }),
    t("portfolio.lab.col.value"),
    t("portfolio.lab.col.holdings"),
    t("portfolio.lab.col.worstFall"),
    t("portfolio.lab.col.costs"),
    t("portfolio.lab.col.trades"),
    t("portfolio.lab.col.fx"),
  ];

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 shadow-panel">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-primary/80" aria-hidden="true" />
        <h2 className="font-display text-lg text-foreground">{t("portfolio.lab.title")}</h2>
      </div>
      <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">
        {t("portfolio.lab.intro", { date: fixedOn, version: LAB_RULES.version })}
      </p>

      {!hasLab ? (
        <p className="mt-4 rounded-xl border border-dashed border-white/12 p-4 text-sm text-muted-foreground">
          {t("portfolio.lab.notBuilt")}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-white/[0.06]">
                <th scope="col" className="sticky left-0 z-10 bg-[rgb(10,16,28)] px-3 py-2 font-medium">
                  {t("portfolio.lab.col.book")}
                </th>
                {head.map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 text-right font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {books.map((r) => {
                const m = r.metrics;
                const ref = REFERENCE.has(r.strategy);
                return (
                  <tr key={r.strategy} className={ref ? "text-foreground/70" : "text-foreground/90"}>
                    <th scope="row" className="sticky left-0 z-10 min-w-[9rem] max-w-[10rem] bg-[rgb(10,16,28)] px-3 py-2 text-left font-normal sm:max-w-[16rem]">
                      <span className="flex flex-wrap items-center gap-1.5 font-medium text-foreground">
                        {t(`portfolio.lab.books.${r.strategy}.name`)}
                        {(ref || r.strategy === "REBALANCED") && (
                          <span className="rounded-full border border-white/12 px-1.5 py-px text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                            {t(ref ? "portfolio.lab.tag.reference" : "portfolio.lab.tag.current")}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                        {t(`portfolio.lab.books.${r.strategy}.rule`)}
                      </span>
                    </th>
                    <td className={`whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums ${tone(m.sinceFixedPct)}`}>{signed(m.sinceFixedPct)}</td>
                    <td className={`whitespace-nowrap px-3 py-2 text-right tabular-nums ${tone(m.totalReturnPct)}`}>{signed(m.totalReturnPct)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{formatCurrency(m.currentValueGbp, "GBP", locale)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{r.holdings}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                      {m.maxDrawdownPct === undefined ? "—" : m.maxDrawdownPct === 0 ? `${nf(0)}%` : `−${nf(m.maxDrawdownPct * 100)}%`}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{`${nf((m.costsGbp / m.initialGbp) * 100)}%`}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{m.trades ?? "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                      {r.strategy === "BENCHMARK" ? "—" : signed(m.fxEffectPct, ` ${t("portfolio.lab.pts")}`)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ul className="mt-4 space-y-1.5 text-xs leading-5 text-muted-foreground">
        {(["honesty", "costs", "cash", "fx"] as const).map((k) => (
          <li key={k} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
            <span>{t(`portfolio.lab.notes.${k}`, { date: fixedOn })}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
