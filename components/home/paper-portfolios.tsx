"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";
import { BRAND } from "@/lib/brand";
import { CARD_CLASS, PREVIEW_CLASS, PRIMARY_CTA_CLASS } from "@/components/home/research-tools";

/**
 * Homepage entry to both simulated portfolios. Like the research-tool cards,
 * the preview is structural only — no figures — so the home page never shows
 * a performance number outside the portfolio pages' own disclaimers.
 */

/** Three illustrative lines standing in for "strategy vs benchmark" — no data. */
function LinesPreview() {
  return (
    <div className={PREVIEW_CLASS} aria-hidden="true">
      <svg viewBox="0 0 240 64" className="h-16 w-full" preserveAspectRatio="none">
        <path d="M0 56 C40 50 60 44 90 40 S150 26 180 22 S220 12 240 8" fill="none" className="stroke-primary/70" strokeWidth="2" />
        <path d="M0 56 C40 52 70 46 100 44 S160 34 190 30 S225 24 240 22" fill="none" className="stroke-white/35" strokeWidth="1.5" />
        <path d="M0 56 C50 54 80 50 110 49 S170 42 200 40 S230 36 240 35" fill="none" className="stroke-white/15" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
    </div>
  );
}

export function PaperPortfolios() {
  const { t } = useTranslation();

  const cards = [
    { key: "stocks", href: `${BRAND.products.companies.path}/portfolio`, crossZone: false },
    // Cross-zone: /etf is a separate build behind a rewrite → plain <a>.
    { key: "etfs", href: `${BRAND.products.funds.path}/portfolio`, crossZone: true },
  ] as const;

  return (
    <section
      id="paper-portfolios"
      aria-labelledby="paper-portfolios-heading"
      className="scroll-mt-24 border-t border-white/[0.08] py-14 sm:py-16"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90">
        {t("paperPortfolios.eyebrow")}
      </p>
      <h2
        id="paper-portfolios-heading"
        className="mt-3 text-balance font-display text-3xl leading-tight text-foreground sm:text-4xl"
      >
        {t("paperPortfolios.h2")}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{t("paperPortfolios.lead")}</p>

      <div className="mt-9 grid gap-5 lg:grid-cols-2 lg:gap-6">
        {cards.map(({ key, href, crossZone }) => {
          const cta = (
            <>
              {t(`paperPortfolios.${key}.cta`)}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          );
          return (
            <article key={key} className={CARD_CLASS}>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/85">
                  {t(`paperPortfolios.${key}.label`)}
                </p>
                <h3 className="mt-2 font-display text-xl text-foreground">{t(`paperPortfolios.${key}.heading`)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`paperPortfolios.${key}.description`)}</p>
              </div>

              <LinesPreview />

              <div className="mt-auto pt-1">
                {crossZone ? (
                  <a href={href} className={PRIMARY_CTA_CLASS}>
                    {cta}
                  </a>
                ) : (
                  <Link href={href as Route} className={PRIMARY_CTA_CLASS}>
                    {cta}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-5 text-muted-foreground">{t("paperPortfolios.disclaimer")}</p>
    </section>
  );
}
