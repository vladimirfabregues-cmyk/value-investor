"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";

/**
 * Homepage research-principles teaser. The six principles themselves now live
 * on /methodology (so the standard sits with the methodology, not in marketing
 * copy); the homepage keeps only the framing and a link, to stay uncluttered.
 */
export function MethodologyPrinciples() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="methodology-principles-heading"
      className="scroll-mt-24 py-14 sm:py-16"
    >
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 shadow-panel sm:p-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90">
          {t("methodologyPrinciples.eyebrow")}
        </p>
        <h2
          id="methodology-principles-heading"
          className="mt-3 text-balance font-display text-3xl leading-tight text-foreground sm:text-4xl"
        >
          {t("methodologyPrinciples.h2")}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          {t("methodologyPrinciples.body")}
        </p>

        <div className="mt-6">
          <Link
            href="/methodology"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary/40 px-5 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {t("methodologyPrinciples.cta")}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
