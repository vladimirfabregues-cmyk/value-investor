"use client";

import { useTranslation } from "@/lib/i18n/locale-context";
import { WorkspacesLink } from "@/components/about/workspaces-link";

/** Anchor slugs match the term keys so surfaces can deep-link (e.g. #conclusion-cap). */
const TERMS: Array<{ key: string; slug: string }> = [
  { key: "conclusionCap", slug: "conclusion-cap" },
  { key: "marginOfSafety", slug: "margin-of-safety" },
  { key: "baseValue", slug: "base-value" },
  { key: "valueRange", slug: "value-range" },
  { key: "modelAgreement", slug: "model-agreement" },
  { key: "dataConfidence", slug: "data-confidence" },
  { key: "peerGroup", slug: "peer-group" },
  { key: "justifiedPb", slug: "justified-price-to-book" },
  { key: "cycleRoe", slug: "cycle-average-return-on-equity" },
  { key: "normalizedEarnings", slug: "normalized-earnings" },
  { key: "grahamNumber", slug: "graham-number" },
  { key: "ffo", slug: "funds-from-operations" },
  { key: "tracking", slug: "tracking" },
  { key: "structure", slug: "structure" },
];

/**
 * Glossary (/glossary): one plain-English definition per term of art (Appendix
 * B). Each entry has a stable anchor so any surface can link a term straight to
 * its definition. Neutral shared page — always-visible text, normal reading
 * size.
 */
export function GlossaryPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
      <WorkspacesLink />

      <header className="mt-8">
        <h1 className="font-display text-4xl leading-[1.08] text-foreground sm:text-5xl">
          {t("glossary.title")}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{t("glossary.intro")}</p>
      </header>

      <dl className="mt-10 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {TERMS.map(({ key, slug }) => (
          <div key={key} id={slug} className="scroll-mt-24 grid gap-1 py-5 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-6">
            <dt className="font-display text-base text-foreground">{t(`glossary.terms.${key}.term`)}</dt>
            <dd className="text-[15px] leading-7 text-muted-foreground">{t(`glossary.terms.${key}.def`)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
