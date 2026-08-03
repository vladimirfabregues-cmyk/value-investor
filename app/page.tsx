"use client";

import Link from "next/link";
import { ArrowRight, LineChart, Layers } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";

/**
 * Landing chooser. Two workspaces live under one domain: Value Investor at
 * /value (this app) and ETF Screener at /etf (a separate Next zone served
 * through a rewrite — hence a plain <a> for that hard cross-zone navigation).
 */
export default function ChooserPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-5 py-16 text-center">
      <h1 className="sr-only">{t("chooser.title")}</h1>
      <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/90">
        {t("chooser.eyebrow")}
      </div>
      <p className="mt-5 max-w-2xl text-balance font-display text-base leading-relaxed text-foreground/85 sm:text-xl sm:leading-8">
        {t("chooser.leadIntro")}
        <strong className="whitespace-nowrap font-semibold text-foreground">{t("chooser.viTitle")}</strong>
        {t("chooser.leadVi")}
        <strong className="whitespace-nowrap font-semibold text-foreground">{t("chooser.etfTitle")}</strong>
        {t("chooser.leadEtf")}
      </p>

      <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
        <Link
          href="/value"
          className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-left shadow-panel transition hover:border-primary/40 hover:bg-white/[0.04]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-b from-primary/20 to-primary/5 text-primary">
            <LineChart className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-2xl text-foreground">{t("chooser.viTitle")}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{t("chooser.viDesc")}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {t("chooser.viCta")}
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
          <h2 className="mt-4 font-display text-2xl text-foreground">{t("chooser.etfTitle")}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{t("chooser.etfDesc")}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {t("chooser.etfCta")}
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
