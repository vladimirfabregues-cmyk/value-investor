"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";
import { BRAND } from "@/lib/brand";

/**
 * Closing call-to-action, immediately before the page foot. Same destinations
 * as the hero and product-pathway CTAs (Companies → /value, Funds → /etf).
 *
 * Dark ink panel with a single restrained copper top rule and paper-coloured
 * text. Gold primary button (accessible on ink); the secondary is an outlined
 * button with a paper-toned border + label so it stays clearly visible on the
 * dark background rather than fading into it. No newsletter, no email wall, no
 * scarcity or "beat the market" language.
 *
 * No analytics: this project ships no analytics abstraction (a deliberate
 * earlier decision), so home_final_*_click have nothing to call and no tracker
 * is added.
 */
export function FinalCta() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="final-cta-heading" className="py-14 sm:py-16">
      <div className="overflow-hidden rounded-3xl border border-white/[0.08] border-t-2 border-t-primary/70 bg-[hsl(220_44%_6%)] px-6 py-10 shadow-panel sm:px-10 sm:py-12">
        <h2
          id="final-cta-heading"
          className="max-w-2xl text-balance font-display text-3xl leading-tight text-foreground sm:text-4xl"
        >
          {t("finalCta.h2")}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-7 text-foreground/70">{t("finalCta.body")}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={BRAND.products.companies.path}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_22px_rgba(181,148,88,0.28)] transition hover:bg-primary-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(220_44%_6%)]"
          >
            {t("finalCta.ctaCompany")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          {/* Cross-zone: /etf is a separate build behind a rewrite → plain <a>. */}
          <a
            href={BRAND.products.funds.path}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-foreground/40 px-5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(220_44%_6%)]"
          >
            {t("finalCta.ctaEtf")}
          </a>
        </div>
      </div>
    </section>
  );
}
