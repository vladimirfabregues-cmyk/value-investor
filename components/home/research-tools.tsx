"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils/cn";

/**
 * Homepage "Research tools" section — the two ways into the Casebook, given
 * equal weight. Anchored as #research-tools so a global "Start a case" CTA can
 * jump straight here.
 *
 * Cards are structured content (article + real links), NOT one giant nested
 * link: the primary CTA is the clearest action, with a quieter methodology
 * link beside it, so keyboard/AT users get a valid, unambiguous structure.
 *
 * The previews are deliberately *structural* — real row labels with neutral
 * placeholder tracks — so they show the shape of a result without inventing a
 * company, fund, price, valuation or score.
 *
 * No analytics: this project ships no analytics abstraction (that was a
 * deliberate earlier decision), so the four home_product_* events are not
 * wired — there is nothing to call, and adding a tracker would introduce a
 * dependency the brand build has so far avoided.
 */

/** Neutral placeholder track — stands in for a value without fabricating one. */
function Track({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("h-1.5 rounded-full bg-white/12", className)} />;
}

function EvidencePoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary/75" aria-hidden="true" />
      <span className="text-sm leading-6 text-muted-foreground">{children}</span>
    </li>
  );
}

/** Shared card chrome: restrained surface, hairline border, ≤2px hover lift. */
const CARD_CLASS =
  "flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-6 shadow-[0_1px_0_rgba(255,255,255,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-7";

const PREVIEW_CLASS =
  "rounded-xl border border-white/[0.07] bg-[linear-gradient(180deg,rgba(18,28,45,0.6),rgba(8,14,25,0.65))] p-4";

const PRIMARY_CTA_CLASS =
  "group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_22px_rgba(181,148,88,0.25)] transition hover:bg-primary-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

const METHOD_LINK_CLASS =
  "inline-flex items-center text-sm font-medium text-foreground/70 underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded";

export function ResearchTools() {
  const { t } = useTranslation();

  return (
    <section
      id="research-tools"
      aria-labelledby="research-tools-heading"
      className="scroll-mt-24 border-t border-white/[0.08] py-14 sm:py-16"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90">
        {t("researchTools.eyebrow")}
      </p>
      <h2
        id="research-tools-heading"
        className="mt-3 text-balance font-display text-3xl leading-tight text-foreground sm:text-4xl"
      >
        {t("researchTools.h2")}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
        {t("researchTools.lead")}
      </p>

      <div className="mt-9 grid gap-5 lg:grid-cols-2 lg:gap-6">
        {/* ── Company case ── */}
        <article className={CARD_CLASS}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/85">
              {t("researchTools.company.label")}
            </p>
            <h3 className="mt-2 font-display text-xl text-foreground">
              {t("researchTools.company.heading")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("researchTools.company.description")}
            </p>
          </div>

          <ul className="flex list-none flex-col gap-2.5 p-0">
            <EvidencePoint>{t("researchTools.company.point1")}</EvidencePoint>
            <EvidencePoint>{t("researchTools.company.point2")}</EvidencePoint>
            <EvidencePoint>{t("researchTools.company.point3")}</EvidencePoint>
          </ul>

          {/* Structural preview — no company, price or valuation */}
          <div className={PREVIEW_CLASS} aria-hidden="true">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
              {t("researchTools.company.preview.label")}
            </p>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-foreground/80">
                  {t("researchTools.company.preview.valuation")}
                </dt>
                <dd className="mt-1.5">
                  {/* range track with a marker — shape of a range, no numbers */}
                  <span className="relative flex h-1.5 w-full rounded-full bg-white/10">
                    <span className="absolute left-[28%] right-[34%] h-1.5 rounded-full bg-primary/40" />
                    <span className="absolute left-[52%] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-primary/70 bg-panel" />
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-xs text-foreground/80">
                  {t("researchTools.company.preview.resilience")}
                </dt>
                <dd>
                  <Track className="w-14" />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-xs text-foreground/80">
                  {t("researchTools.company.preview.earnings")}
                </dt>
                <dd>
                  <Track className="w-14" />
                </dd>
              </div>
              <div className="border-t border-white/[0.06] pt-3">
                <dt className="text-xs text-foreground/80">
                  {t("researchTools.company.preview.limitation")}
                </dt>
                <dd className="mt-1.5 space-y-1.5">
                  <Track className="w-full" />
                  <Track className="w-2/3" />
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
            <Link href={BRAND.products.companies.path} className={PRIMARY_CTA_CLASS}>
              {t("researchTools.company.cta")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link href="/methodology/company" className={METHOD_LINK_CLASS}>
              {t("researchTools.company.methodology")}
            </Link>
          </div>
        </article>

        {/* ── ETF case ── */}
        <article className={CARD_CLASS}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/85">
              {t("researchTools.etf.label")}
            </p>
            <h3 className="mt-2 font-display text-xl text-foreground">
              {t("researchTools.etf.heading")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("researchTools.etf.description")}
            </p>
          </div>

          <ul className="flex list-none flex-col gap-2.5 p-0">
            <EvidencePoint>{t("researchTools.etf.point1")}</EvidencePoint>
            <EvidencePoint>{t("researchTools.etf.point2")}</EvidencePoint>
            <EvidencePoint>{t("researchTools.etf.point3")}</EvidencePoint>
          </ul>

          {/* Structural preview — no fund or score */}
          <div className={PREVIEW_CLASS} aria-hidden="true">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                {t("researchTools.etf.preview.peerGroup")}
              </p>
              <Track className="w-20" />
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {(["cost", "tracking", "liquidity", "structure"] as const).map((k) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-xs text-foreground/80">
                    {t(`researchTools.etf.preview.${k}`)}
                  </dt>
                  <dd>
                    <Track className="w-10" />
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-warning/70" />
              <span className="text-xs text-foreground/80">
                {t("researchTools.etf.preview.warning")}
              </span>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
            {/* Cross-zone: /etf is a separate build behind a rewrite → plain <a>. */}
            <a href={BRAND.products.funds.path} className={PRIMARY_CTA_CLASS}>
              {t("researchTools.etf.cta")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            <a href={`${BRAND.products.funds.path}/methodology`} className={METHOD_LINK_CLASS}>
              {t("researchTools.etf.methodology")}
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
