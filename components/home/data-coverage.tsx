"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";
import { getDataCoverage, sourceFamilies } from "@/lib/coverage/data-coverage";

/**
 * Homepage "Data and coverage" section. Every number, version and date comes
 * from the coverage adapter — nothing is hard-coded in this copy. ETF figures
 * live in the Funds zone, so those cards show an honest "maintained in the
 * Funds section" fallback and link out rather than inventing counts. Status is
 * conveyed in words (no glowing "live" dot — the data is curated/on-demand,
 * not streaming).
 */

/** Small text status pill — never colour-only. */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-1 flex-col gap-1.5 text-sm text-foreground/90">{children}</div>
    </div>
  );
}

export function DataCoverage() {
  const { t } = useTranslation();
  const { company, etf } = getDataCoverage();
  const families = sourceFamilies(company.sources);

  return (
    <section aria-labelledby="data-coverage-heading" className="scroll-mt-24 border-t border-white/[0.08] py-14 sm:py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90">
        {t("coverage.eyebrow")}
      </p>
      <h2
        id="data-coverage-heading"
        className="mt-3 text-balance font-display text-3xl leading-tight text-foreground sm:text-4xl"
      >
        {t("coverage.h2")}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{t("coverage.body")}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1 · Company coverage */}
        <Card title={t("coverage.cards.company")}>
          <p className="font-display text-2xl tabular-nums text-foreground">
            {t("coverage.labels.markets", { count: company.marketCount })}
          </p>
          <Pill>{t("coverage.labels.curatedCoverage")}</Pill>
        </Card>

        {/* 2 · ETF coverage — figures owned by the Funds zone */}
        <Card title={t("coverage.cards.etf")}>
          {etf.available ? (
            <p className="font-display text-2xl tabular-nums text-foreground">{etf.fundCount}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("coverage.labels.unavailableHere")}</p>
          )}
          <Link
            href="/data-and-coverage"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("coverage.viewFunds")}
          </Link>
        </Card>

        {/* 3 · Source families */}
        <Card title={t("coverage.cards.sources")}>
          <p>{families.join(" · ")}</p>
          <span className="text-xs text-muted-foreground">{t("coverage.labels.sources")}</span>
        </Card>

        {/* 4 · Latest data dates */}
        <Card title={t("coverage.cards.dates")}>
          <p>
            <span className="text-muted-foreground">{t("coverage.labels.asOf")}: </span>
            {t("coverage.labels.onDemand")}
          </p>
          <span className="text-xs text-muted-foreground">{t("coverage.note.onDemand")}</span>
        </Card>

        {/* 5 · Methodology versions */}
        <Card title={t("coverage.cards.versions")}>
          <p className="tabular-nums">
            <span className="text-muted-foreground">{t("coverage.labels.method")}: </span>
            <span className="font-mono">v{company.methodologyVersion}</span>
          </p>
          <span className="text-xs text-muted-foreground">{t("coverage.labels.unavailableHere")}</span>
        </Card>
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-5 text-muted-foreground">{t("coverage.disclosure")}</p>

      <div className="mt-6">
        <Link
          href="/data-and-coverage"
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary/40 px-5 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {t("coverage.cta")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
