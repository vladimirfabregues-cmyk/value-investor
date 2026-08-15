"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";

/**
 * Homepage "Data and coverage" teaser. The full breakdown — supported markets,
 * source families, update dates, curated-versus-live fields and methodology
 * versions — lives on /data-and-coverage; the homepage keeps only the framing
 * and a link, to stay uncluttered.
 */
export function DataCoverage() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="data-coverage-heading"
      className="scroll-mt-24 border-t border-white/[0.08] py-14 sm:py-16"
    >
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
