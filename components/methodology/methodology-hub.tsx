"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";
import { WorkspacesLink } from "@/components/about/workspaces-link";
import { VALUATION_MODEL_VERSION } from "@/lib/finance/model-version";

const DISCLOSURE_KEYS = ["sourceDates", "missingData", "changes", "gates", "forecasts"] as const;

/**
 * Unified methodology hub (/methodology): one research standard, two methods.
 *
 * It does not restate the detailed formulas — those live on the per-product
 * methodology surfaces, which this page links to. The company methodology
 * version is rendered from the engine's source-of-truth constant
 * (VALUATION_MODEL_VERSION), never hard-coded here; the ETF methodology and
 * dataset versions are owned by the Funds zone and shown on its own
 * methodology page, so this hub links there rather than duplicating (or
 * fabricating) a number it has no source of truth for.
 */
export function MethodologyHub() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:py-10">
      <WorkspacesLink />

      <header className="mt-8">
        <h1 className="font-display text-4xl leading-[1.05] text-foreground sm:text-5xl">
          {t("methodologyHub.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
          {t("methodologyHub.intro")}
        </p>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {/* Company Analysis */}
        <section
          aria-labelledby="method-company"
          className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-6"
        >
          <h2 id="method-company" className="font-display text-xl text-foreground">
            {t("methodologyHub.company.title")}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {t("methodologyHub.company.body")}
          </p>
          <dl className="mt-auto border-t border-white/[0.07] pt-4 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">{t("methodologyHub.company.versionLabel")}</dt>
              <dd className="font-mono tabular-nums text-foreground/90">v{VALUATION_MODEL_VERSION}</dd>
            </div>
          </dl>
          <Link
            href="/methodology/company"
            className="inline-flex items-center gap-1 self-start text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
          >
            {t("methodologyHub.company.link")}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>

        {/* ETF Research — versions owned by the Funds zone */}
        <section
          aria-labelledby="method-etf"
          className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-6"
        >
          <h2 id="method-etf" className="font-display text-xl text-foreground">
            {t("methodologyHub.etf.title")}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">{t("methodologyHub.etf.body")}</p>
          <p className="mt-auto border-t border-white/[0.07] pt-4 text-xs leading-5 text-muted-foreground">
            {t("methodologyHub.etf.versionNote")}
          </p>
          {/* Cross-zone: /etf is a separate build behind a rewrite → plain <a>. */}
          <a
            href="/etf/methodology"
            className="inline-flex items-center gap-1 self-start text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
          >
            {t("methodologyHub.etf.link")}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </section>
      </div>

      {/* How to read every case */}
      <section aria-labelledby="method-disclosures" className="mt-10">
        <h2 id="method-disclosures" className="font-display text-2xl text-foreground">
          {t("methodologyHub.disclosures.title")}
        </h2>
        <dl className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {DISCLOSURE_KEYS.map((k) => (
            <div key={k} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6">
              <dt className="text-sm font-semibold text-foreground/90">
                {t(`methodologyHub.disclosures.${k}.term`)}
              </dt>
              <dd className="text-sm leading-6 text-muted-foreground">
                {t(`methodologyHub.disclosures.${k}.desc`)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
