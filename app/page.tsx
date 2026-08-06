"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";
import { CasebookLogo } from "@/components/brand/casebook-logo";
import { CaseFilePreview } from "@/components/home/case-file-preview";
import { TrustStrip } from "@/components/home/trust-strip";
import { ResearchTools } from "@/components/home/research-tools";
import { BRAND } from "@/lib/brand";

/**
 * The Investment Casebook — homepage hero. Two-column on desktop (copy left,
 * case-file visual right); on mobile the copy + CTAs come first, then the
 * visual. Companies (/value) is the primary route; Funds (/etf, a separate
 * zone → plain <a>) the secondary. Copy is server-rendered via SSR of this
 * client component; no raster background, no animation library.
 */
export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-6xl px-5">
      <div className="flex min-h-[86dvh] flex-col justify-center gap-10 py-16 lg:gap-12 lg:py-20">
      <CasebookLogo size="md" />

      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        {/* Copy + actions */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl leading-[1.04] text-foreground sm:text-5xl lg:text-[3.5rem]">
            {t("hero.h1")}
          </h1>
          <p className="mt-5 max-w-[680px] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {t("hero.lead")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={BRAND.products.companies.path}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_22px_rgba(181,148,88,0.28)] transition hover:bg-primary-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {t("hero.ctaCompany")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            {/* Cross-zone: /etf is a separate build via next.config rewrite. */}
            <a
              href={BRAND.products.funds.path}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-foreground/85 transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {t("hero.ctaEtf")}
            </a>
          </div>

          <p className="mt-5 text-xs leading-5 text-muted-foreground">{t("hero.microDisclaimer")}</p>
        </div>

        {/* Case-file visual */}
        <div className="w-full lg:pl-2">
          <CaseFilePreview />
        </div>
      </div>
      </div>

      <TrustStrip />

      <ResearchTools />

      <div className="py-8">
        <Link
          href="/about"
          className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t("hero.aboutLink")}
        </Link>
      </div>
    </main>
  );
}
