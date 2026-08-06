"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";

const PRINCIPLE_KEYS = ["p1", "p2", "p3", "p4", "p5", "p6"] as const;

/**
 * Homepage research-principles section — the six rules the platform holds
 * itself to. Presented as numbered casebook entries (not six generic icon
 * cards): a restrained gold serif numeral, a title and a concise line, ruled
 * off from one another.
 *
 * The brand is dark, so the prompt's light "paper-deep" background is rendered
 * as its dark-brand analog: a slightly raised, ruled inset surface that sets
 * this "principles" section apart from the transparent product-proof sections
 * above it without abandoning the navy/gold palette.
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

        <ol className="mt-8 grid list-none grid-cols-1 gap-x-10 p-0 md:grid-cols-2">
          {PRINCIPLE_KEYS.map((k, i) => (
            <li
              key={k}
              className={cn(
                "flex gap-4 border-t border-white/[0.07] py-5",
                // First row of each column has no top rule on desktop.
                i === 0 && "border-t-0",
                i === 1 && "md:border-t-0",
              )}
            >
              <span
                aria-hidden="true"
                className="font-display text-2xl leading-none tabular-nums text-primary/55"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg leading-snug text-foreground">
                  {t(`methodologyPrinciples.${k}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {t(`methodologyPrinciples.${k}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 border-t border-white/[0.07] pt-6">
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
