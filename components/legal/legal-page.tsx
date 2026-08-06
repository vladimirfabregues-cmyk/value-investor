"use client";

import Link from "next/link";

import { useTranslation } from "@/lib/i18n/locale-context";
import { WorkspacesLink } from "@/components/about/workspaces-link";

const SECTIONS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12", "s13"] as const;

/**
 * Consolidated "Important information" page (/legal). Every section is plain,
 * always-visible text at a normal reading size — no accordion, no tiny print —
 * because the risk wording must not be hard to reach. It preserves the
 * substance of the existing product disclaimers rather than replacing them.
 */
export function LegalPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
      <WorkspacesLink />

      <header className="mt-8">
        <h1 className="font-display text-4xl leading-[1.08] text-foreground sm:text-5xl">
          {t("legal.title")}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{t("legal.intro")}</p>
        <p className="mt-3 text-sm italic leading-6 text-muted-foreground/80">{t("legal.reviewNote")}</p>
      </header>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s} aria-labelledby={`legal-${s}`}>
            <h2 id={`legal-${s}`} className="font-display text-xl text-foreground">
              {t(`legal.${s}.title`)}
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{t(`legal.${s}.body`)}</p>
          </section>
        ))}

        {/* Contact / corrections — links to a real destination (About) */}
        <section aria-labelledby="legal-s14">
          <h2 id="legal-s14" className="font-display text-xl text-foreground">
            {t("legal.s14.title")}
          </h2>
          <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{t("legal.s14.body")}</p>
          <Link
            href="/about"
            className="mt-2 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
          >
            {t("legal.s14.linkLabel")}
          </Link>
        </section>
      </div>
    </div>
  );
}
