"use client";

import Link from "next/link";
import { ArrowRight, LineChart, Layers } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";

/**
 * The Investment Casebook — front door. Two workspaces live under one origin:
 * Companies at /value (this app) and Funds at /etf (a separate Next zone served
 * through a rewrite — hence a plain <a> for that hard cross-zone navigation).
 */
export default function ChooserPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-5 py-16 text-center">
      {/* Masthead: gold "IC" bookplate seal + wordmark (the page's h1). */}
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary font-display text-base font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(181,148,88,0.3)]">
          IC
        </span>
        <h1 className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
          The Investment Casebook
        </h1>
      </div>

      {/* Tagline — the editorial hero line. */}
      <p className="mt-8 text-balance font-display text-3xl leading-tight text-foreground sm:text-[2.6rem] sm:leading-[1.1]">
        {t("chooser.tagline")}
      </p>

      <p className="mt-5 max-w-2xl text-balance text-base leading-7 text-muted-foreground">
        {t("chooser.lead")}
      </p>

      <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
        <Link
          href="/value"
          className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-left shadow-panel transition hover:border-primary/40 hover:bg-white/[0.04]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-b from-primary/20 to-primary/5 text-primary">
            <LineChart className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-2xl text-foreground">{t("chooser.companiesTitle")}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{t("chooser.companiesDesc")}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {t("chooser.companiesCta")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </Link>

        {/* Cross-zone: /etf is served by a separate build via next.config rewrite. */}
        <a
          href="/etf"
          className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-left shadow-panel transition hover:border-primary/40 hover:bg-white/[0.04]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-b from-primary/20 to-primary/5 text-primary">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-2xl text-foreground">{t("chooser.fundsTitle")}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{t("chooser.fundsDesc")}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {t("chooser.fundsCta")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </a>
      </div>

      <Link
        href="/about"
        className="mt-10 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {t("chooser.aboutLink")}
      </Link>
      <p className="mt-4 max-w-md text-xs leading-5 text-muted-foreground">
        {t("chooser.disclaimer")}
      </p>
    </main>
  );
}
