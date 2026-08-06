"use client";

import { useTranslation } from "@/lib/i18n/locale-context";
import { WorkspacesLink } from "@/components/about/workspaces-link";
import { VALUATION_MODEL_VERSION } from "@/lib/finance/model-version";

const MODEL_KEYS = ["dcf", "pb", "nav", "ddm"] as const;
const CHECK_KEYS = ["resilience", "earnings", "quality"] as const;

/** Definition-list block used for both the model and check sections. */
function TermList({ ns, keys }: { ns: string; keys: readonly string[] }) {
  const { t } = useTranslation();
  return (
    <dl className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
      {keys.map((k) => (
        <div key={k} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,18rem)_1fr] sm:gap-6">
          <dt className="text-sm font-semibold text-foreground/90">{t(`${ns}.${k}.term`)}</dt>
          <dd className="text-sm leading-6 text-muted-foreground">{t(`${ns}.${k}.desc`)}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Standalone company-methodology page (/methodology/company) — the parallel of
 * the Funds zone's /etf/methodology. It lays the scoring process out in full,
 * always-visible and mobile-first (no collapsed <details>, no app shell), so a
 * reader on a phone can follow how a conclusion is reached. The model version
 * comes from the source-of-truth constant, never hard-coded.
 */
export function CompanyMethodology() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
      <WorkspacesLink />

      <header className="mt-8">
        <h1 className="font-display text-4xl leading-[1.08] text-foreground sm:text-5xl">
          {t("companyMethodology.title")}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{t("companyMethodology.intro")}</p>
      </header>

      <section aria-labelledby="cm-models" className="mt-10">
        <h2 id="cm-models" className="font-display text-2xl text-foreground">
          {t("companyMethodology.models.title")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("companyMethodology.models.body")}
        </p>
        <TermList ns="companyMethodology.models" keys={MODEL_KEYS} />
      </section>

      <section aria-labelledby="cm-checks" className="mt-10">
        <h2 id="cm-checks" className="font-display text-2xl text-foreground">
          {t("companyMethodology.checks.title")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("companyMethodology.checks.body")}
        </p>
        <TermList ns="companyMethodology.checks" keys={CHECK_KEYS} />
      </section>

      <section aria-labelledby="cm-gates" className="mt-10">
        <h2 id="cm-gates" className="font-display text-2xl text-foreground">
          {t("companyMethodology.gates.title")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("companyMethodology.gates.body")}
        </p>
        <p className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-sm leading-6 text-foreground/85">
          {t("companyMethodology.gates.items")}
        </p>
      </section>

      <section aria-labelledby="cm-conclusion" className="mt-10">
        <h2 id="cm-conclusion" className="font-display text-2xl text-foreground">
          {t("companyMethodology.conclusion.title")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("companyMethodology.conclusion.body")}
        </p>
      </section>

      <section
        aria-labelledby="cm-provenance"
        className="mt-10 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="cm-provenance" className="font-display text-xl text-foreground">
            {t("companyMethodology.provenance.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("companyMethodology.provenance.versionLabel")}:{" "}
            <span className="font-mono tabular-nums text-foreground/90">v{VALUATION_MODEL_VERSION}</span>
          </p>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {t("companyMethodology.provenance.body")}
        </p>
      </section>

      <p className="mt-8 text-xs leading-5 text-muted-foreground">{t("footer.disclaimer")}</p>
    </div>
  );
}
