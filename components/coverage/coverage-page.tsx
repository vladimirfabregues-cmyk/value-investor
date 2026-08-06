"use client";

import { useTranslation } from "@/lib/i18n/locale-context";
import { WorkspacesLink } from "@/components/about/workspaces-link";
import { getDataCoverage, formatCoverageDate, type SourceRecord } from "@/lib/coverage/data-coverage";

/**
 * Full /data-and-coverage page. All figures, versions and dates are read from
 * the coverage adapter; ETF datasets are reported as maintained by the Funds
 * zone rather than duplicated here. No developer/refresh commands appear —
 * those belong in repository docs, not on a public page.
 */
function SourceTable({ rows }: { rows: SourceRecord[] }) {
  const { t, locale } = useTranslation();
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.1] text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <th className="py-2 pr-4 font-semibold">{t("coverage.labels.sources")}</th>
            <th className="py-2 pr-4 font-semibold">{t("coverage.labels.dataset")}</th>
            <th className="py-2 pr-4 font-semibold">{t("coverage.labels.asOf")}</th>
            <th className="py-2 font-semibold">{t("coverage.labels.curatedCoverage")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.label}-${r.category}-${i}`} className="border-b border-white/[0.06]">
              <td className="py-2.5 pr-4 text-foreground/90">{r.label}</td>
              <td className="py-2.5 pr-4 text-muted-foreground">{t(`coverage.category.${r.category}`)}</td>
              <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                {formatCoverageDate(r.asOfDate, locale, t("coverage.labels.onDemand"))}
              </td>
              <td className="py-2.5">
                <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground">
                  {t(`coverage.status.${r.status}`)} · {t(`coverage.cadence.${r.cadence}`)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Prose({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="font-display text-2xl text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
    </section>
  );
}

export function CoveragePage() {
  const { t } = useTranslation();
  const { company, etf } = getDataCoverage();
  const marketVars = { count: company.marketCount };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
      <WorkspacesLink />

      <header className="mt-8">
        <h1 className="font-display text-4xl leading-[1.08] text-foreground sm:text-5xl">
          {t("coverage.page.title")}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{t("coverage.page.intro")}</p>
      </header>

      <Prose id="c-what" title={t("coverage.page.whatCovered.title")} body={t("coverage.page.whatCovered.body", marketVars)} />

      <section aria-labelledby="c-company" className="mt-10">
        <h2 id="c-company" className="font-display text-2xl text-foreground">
          {t("coverage.page.companySources.title")}
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("coverage.page.companySources.body")}</p>
        <SourceTable rows={company.sources} />
      </section>

      <section aria-labelledby="c-etf" className="mt-10">
        <h2 id="c-etf" className="font-display text-2xl text-foreground">
          {t("coverage.page.etfSources.title")}
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("coverage.page.etfSources.body")}</p>
        {/* Cross-zone: /etf is a separate build behind a rewrite → plain <a>. */}
        <a
          href={etf.href}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
        >
          {t("coverage.viewFunds")}
        </a>
      </section>

      <Prose id="c-cadence" title={t("coverage.page.cadence.title")} body={t("coverage.page.cadence.body")} />
      <Prose id="c-curated" title={t("coverage.page.curatedVsLive.title")} body={t("coverage.page.curatedVsLive.body")} />
      <Prose id="c-missing" title={t("coverage.page.missingData.title")} body={t("coverage.page.missingData.body")} />
      <Prose id="c-limits" title={t("coverage.page.limitations.title")} body={t("coverage.page.limitations.body")} />

      <section
        aria-labelledby="c-versions"
        className="mt-10 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="c-versions" className="font-display text-2xl text-foreground">
            {t("coverage.page.versions.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("coverage.labels.method")}:{" "}
            <span className="font-mono tabular-nums text-foreground/90">v{company.methodologyVersion}</span>
          </p>
        </div>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{t("coverage.page.versions.body")}</p>
      </section>

      <Prose id="c-verify" title={t("coverage.page.verification.title")} body={t("coverage.page.verification.body")} />

      <p className="mt-10 text-xs leading-5 text-muted-foreground">{t("footer.disclaimer")}</p>
    </div>
  );
}
