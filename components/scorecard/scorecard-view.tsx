"use client";

import { useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { formatIsoDate } from "@/lib/utils/dates";
import { useTranslation } from "@/lib/i18n/locale-context";
import { capLabel } from "@/lib/finance/verdict-explanation-prose";
import type { CaseRow, IcStat, Scorecard } from "@/lib/scorecard/compute";
import type { SavedAnalysisSummary } from "@/types/analysis";

const PANEL = "rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 shadow-panel";
/** Fewer observations than this and a figure is shown but marked as too early to read. */
const EARLY = 100;

interface Props {
  history: SavedAnalysisSummary[];
  scorecard: { data: Scorecard; builtAt: string } | null;
}

export function ScorecardView({ history, scorecard }: Props) {
  const { t, locale } = useTranslation();
  const horizons = scorecard?.data.horizons ?? [];
  const firstWithData = horizons.find((h) => h.observations > 0)?.weeks ?? 4;
  const [weeks, setWeeks] = useState<number>(firstWithData);
  const h = horizons.find((x) => x.weeks === weeks);

  const nf = (n: number, d = 1) =>
    n.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (x: number | null) => (x === null ? "—" : `${x >= 0 ? "+" : "−"}${nf(Math.abs(x) * 100)}%`);
  const plainPct = (x: number | null) => (x === null ? "—" : `${nf(x * 100, 0)}%`);
  const tone = (x: number | null) => (x === null ? "" : x >= 0 ? "text-emerald-300" : "text-red-300");
  const count = (n: number) => n.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB");
  const early = (n: number) => n < EARLY;

  const ic = (s: IcStat) =>
    s.cohorts === 0 ? (
      <span className="text-muted-foreground">{t("scorecard.noData")}</span>
    ) : (
      <span className={tone(s.mean)}>
        {s.mean === null ? "—" : `${s.mean >= 0 ? "+" : "−"}${nf(Math.abs(s.mean), 2)}`}
        <span className="ml-1.5 text-xs text-muted-foreground">({t("scorecard.cohorts", { n: s.cohorts })})</span>
      </span>
    );

  return (
    <AppShell history={history}>
      <div className="space-y-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-primary/90">{t("scorecard.eyebrow")}</p>
          <h1 className="mt-1.5 font-display text-4xl text-foreground">{t("scorecard.title")}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t("scorecard.subtitle")}</p>
          {scorecard && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
              {t("scorecard.builtLine", {
                built: formatIsoDate(scorecard.builtAt),
                n: count(scorecard.data.ratings),
                from: scorecard.data.ratingsFrom ? formatIsoDate(scorecard.data.ratingsFrom) : "—",
                to: scorecard.data.ratingsTo ? formatIsoDate(scorecard.data.ratingsTo) : "—",
              })}
            </p>
          )}
        </div>

        {!scorecard || !h ? (
          <p className="rounded-2xl border border-dashed border-white/12 p-8 text-center text-sm text-muted-foreground">
            {t("scorecard.notBuilt")}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("scorecard.horizonLabel")}>
              <span className="text-xs text-muted-foreground">{t("scorecard.horizonLabel")}</span>
              {horizons.map((x) => (
                <button
                  key={x.weeks}
                  type="button"
                  onClick={() => setWeeks(x.weeks)}
                  aria-pressed={weeks === x.weeks}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    weeks === x.weeks
                      ? "border-primary/45 bg-primary/15 text-primary"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("scorecard.weeks", { n: x.weeks })}
                  <span className="ml-1 text-muted-foreground">· {count(x.observations)}</span>
                </button>
              ))}
            </div>

            {h.observations === 0 ? (
              <p className={`${PANEL} text-sm text-muted-foreground`}>{t("scorecard.horizonEmpty", { n: h.weeks })}</p>
            ) : (
              <>
                {/* Does the ranking work? */}
                <section className={PANEL}>
                  <h2 className="font-display text-lg text-foreground">{t("scorecard.ranking.title")}</h2>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">{t("scorecard.ranking.hint", { n: h.weeks })}</p>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[34rem] text-sm">
                      <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        <tr className="border-b border-white/[0.06] text-right">
                          <th scope="col" className="py-2 pr-3 text-left font-medium">{t("scorecard.ranking.verdict")}</th>
                          <th scope="col" className="py-2 pr-3 font-medium">{t("scorecard.ranking.ratings")}</th>
                          <th scope="col" className="py-2 pr-3 font-medium">{t("scorecard.ranking.mean")}</th>
                          <th scope="col" className="py-2 pr-3 font-medium">{t("scorecard.ranking.median")}</th>
                          <th scope="col" className="py-2 font-medium">{t("scorecard.ranking.hit")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {h.byVerdict.map((v) => (
                          <tr key={v.verdict} className={`text-right tabular-nums ${early(v.n) ? "opacity-60" : ""}`}>
                            <th scope="row" className="py-2 pr-3 text-left font-medium text-foreground">
                              {t(`verdict.${v.verdict}`)}
                              {v.n > 0 && early(v.n) && (
                                <span className="ml-2 text-[10px] font-normal uppercase tracking-wider text-amber-300/80">
                                  {t("scorecard.tooFew")}
                                </span>
                              )}
                            </th>
                            <td className="py-2 pr-3 text-muted-foreground">{count(v.n)}</td>
                            <td className={`py-2 pr-3 font-semibold ${tone(v.meanExcess)}`}>{pct(v.meanExcess)}</td>
                            <td className={`py-2 pr-3 ${tone(v.medianExcess)}`}>{pct(v.medianExcess)}</td>
                            <td className="py-2">{plainPct(v.hitRate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <div className="grid gap-5 lg:grid-cols-2">
                  {/* Which parts of the score matter? */}
                  <section className={PANEL}>
                    <h2 className="font-display text-lg text-foreground">{t("scorecard.parts.title")}</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("scorecard.parts.hint")}</p>
                    <dl className="mt-4 space-y-2 text-sm">
                      {(
                        [
                          ["composite", h.scoreIc],
                          ["valuationScore", h.subScoreIc.valuationScore],
                          ["qualityScore", h.subScoreIc.qualityScore],
                          ["healthScore", h.subScoreIc.healthScore],
                          ["moatScore", h.subScoreIc.moatScore],
                        ] as const
                      ).map(([k, s]) => (
                        <div key={k} className="flex items-baseline justify-between gap-3">
                          <dt className="text-muted-foreground">{t(`scorecard.parts.${k}`)}</dt>
                          <dd className="tabular-nums">{ic(s)}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>

                  {/* Was the fair value right? + red flags */}
                  <section className={PANEL}>
                    <h2 className="font-display text-lg text-foreground">{t("scorecard.flags.title")}</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("scorecard.flags.hint")}</p>
                    {h.flags.length === 0 ? (
                      <p className="mt-4 text-sm text-muted-foreground">{t("scorecard.noData")}</p>
                    ) : (
                      <ul className="mt-4 space-y-2 text-sm">
                        {h.flags.map((f) => (
                          <li key={f.flag} className={`flex items-baseline justify-between gap-3 ${early(f.n) ? "opacity-60" : ""}`}>
                            <span className="text-muted-foreground">
                              {capLabel(f.flag, t)} <span className="text-xs">({count(f.n)})</span>
                            </span>
                            <span className={`tabular-nums ${tone(f.difference)}`}>{pct(f.difference)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <h3 className="mt-5 border-t border-white/[0.06] pt-4 font-display text-base text-foreground">
                      {t("scorecard.fair.title")}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("scorecard.fair.hint")}</p>
                    <p className="mt-2 text-sm tabular-nums">
                      {h.fairValue.n === 0
                        ? <span className="text-muted-foreground">{t("scorecard.fair.none")}</span>
                        : t("scorecard.fair.value", { pct: plainPct(h.fairValue.medianGapClosed), n: count(h.fairValue.n) })}
                    </p>
                  </section>
                </div>
              </>
            )}

            {scorecard.data.cases && (
              <section className={PANEL}>
                <h2 className="font-display text-lg text-foreground">{t("scorecard.cases.title", { n: scorecard.data.cases.weeks })}</h2>
                <div className="mt-4 grid gap-5 lg:grid-cols-3">
                  <CaseList title={t("scorecard.cases.best")} rows={scorecard.data.cases.best} pct={pct} tone={tone} />
                  <CaseList title={t("scorecard.cases.worst")} rows={scorecard.data.cases.worst} pct={pct} tone={tone} />
                  <CaseList title={t("scorecard.cases.missed")} rows={scorecard.data.cases.missed} pct={pct} tone={tone} />
                </div>
              </section>
            )}

            <ul className="space-y-1.5 text-xs leading-5 text-muted-foreground">
              {(["method", "dividends", "overlap", "early"] as const).map((k) => (
                <li key={k} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  <span>{t(`scorecard.notes.${k}`, { bad: count(scorecard.data.badPrices) })}</span>
                </li>
              ))}
            </ul>
            <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/80" aria-hidden="true" />
              {t("scorecard.disclaimer")}
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}

function CaseList({
  title,
  rows,
  pct,
  tone,
}: {
  title: string;
  rows: CaseRow[];
  pct: (x: number | null) => string;
  tone: (x: number | null) => string;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{t("scorecard.noData")}</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm">
          {rows.map((r) => (
            <li key={`${r.ticker}-${r.date}`} className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate">
                <span className="font-mono text-xs text-foreground/90">{r.ticker}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {t(`verdict.${r.verdict}`)} · {r.date}
                </span>
              </span>
              <span className={`shrink-0 tabular-nums ${tone(r.excess)}`}>{pct(r.excess)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
