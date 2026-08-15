"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, Printer } from "lucide-react";

import { AnalysisSummary } from "@/components/analysis/analysis-summary";
import { WhyThisVerdict } from "@/components/analysis/why-this-verdict";
import { ThesisCard } from "@/components/analysis/thesis-card";
import { IntrinsicValueCard } from "@/components/analysis/intrinsic-value-card";
import { ValueVsPrice } from "@/components/analysis/value-vs-price";
import { ValuationCard } from "@/components/analysis/valuation-card";
import { TrendsCard } from "@/components/analysis/trends-card";
import { FinancialHealthCard } from "@/components/analysis/financial-health-card";
import { BusinessQualityCard } from "@/components/analysis/business-quality-card";
import { DataStatusCard } from "@/components/analysis/data-status-card";
import { SourcesCard } from "@/components/analysis/sources-card";
import { HowValuationWorks } from "@/components/analysis/how-valuation-works";
import { useTranslation } from "@/lib/i18n/locale-context";
import { formatIsoDate } from "@/lib/utils/dates";
import { BRAND } from "@/lib/brand";
import type { ValueInvestingAnalysis } from "@/types/analysis";

interface ConclusionDocumentProps {
  analysis: ValueInvestingAnalysis;
  /** Where "Back" returns to — the live result page for this analysis. */
  backHref: Route;
}

/** One titled block; kept together across page breaks when printed. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 break-inside-avoid">
      <h2 className="border-b border-white/[0.08] pb-2 font-display text-lg text-foreground">
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

/**
 * A portable, self-contained rendering of a full conclusion — every section
 * expanded at once rather than behind the result page's tabs, so print and
 * "Save as PDF" capture the whole argument (evidence, approach, checks,
 * limitations and the conclusion), not just the open tab (P9-2).
 */
export function ConclusionDocument({ analysis, backHref }: ConclusionDocumentProps) {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 print:px-0 print:py-0">
      {/* Toolbar — on screen only; never part of the printed artefact */}
      <div data-no-print className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("print.back")}
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          {t("print.action")}
        </button>
      </div>

      <article className="space-y-8">
        {/* The conclusion itself: verdict, decision numbers, why and main risk */}
        <AnalysisSummary analysis={analysis} />

        {/* Approach and reasoning */}
        <Section title={t("analysis.tabs.overview")}>
          {analysis.verdict_explanation ? (
            <WhyThisVerdict analysis={analysis} />
          ) : (
            <ThesisCard analysis={analysis} />
          )}
        </Section>

        {/* Valuation evidence */}
        <Section title={t("analysis.tabs.valuation")}>
          <IntrinsicValueCard analysis={analysis} />
          <ValueVsPrice analysis={analysis} />
          <ValuationCard analysis={analysis} />
        </Section>

        {analysis.series && (
          <Section title={t("analysis.tabs.trends")}>
            <TrendsCard analysis={analysis} />
          </Section>
        )}

        <Section title={t("analysis.tabs.health")}>
          <FinancialHealthCard analysis={analysis} />
        </Section>

        <Section title={t("analysis.tabs.quality")}>
          <BusinessQualityCard analysis={analysis} />
        </Section>

        {/* Risks and limitations */}
        <Section title={t("analysis.tabs.risks")}>
          <ThesisCard analysis={analysis} />
        </Section>

        {/* Provenance: where the numbers came from and how the model works */}
        <Section title={t("analysis.tabs.sources")}>
          <DataStatusCard analysis={analysis} />
          <SourcesCard analysis={analysis} />
          <HowValuationWorks />
        </Section>

        {/* Foot matter — present in the printed artefact, so a saved PDF still
            carries its provenance and the standing disclaimer. */}
        <footer className="space-y-1 border-t border-white/[0.08] pt-4 text-xs leading-5 text-muted-foreground">
          <p>{t("print.generated", { brand: BRAND.name, date: formatIsoDate(analysis.analysis_date) })}</p>
          <p>{t("print.disclaimer")}</p>
        </footer>
      </article>
    </main>
  );
}
