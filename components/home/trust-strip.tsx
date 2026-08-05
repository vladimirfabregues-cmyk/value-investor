"use client";

import { AlertTriangle, Clock, Eye, GitBranch } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";

const PRINCIPLES = [
  { key: "sourceDated", Icon: Clock },
  { key: "versioned", Icon: GitBranch },
  { key: "assumptions", Icon: Eye },
  { key: "limitations", Icon: AlertTriangle },
] as const;

/**
 * Trust strip below the hero — the four research-transparency principles the
 * product actually upholds. Restrained gold line-icons, hairline dividers,
 * always-visible supporting text (no tooltips, so nothing is hover-only and
 * there is no layout shift). Deliberately claims nothing about being regulated,
 * audited or certified. Labelled region for assistive tech.
 */
export function TrustStrip() {
  const { t } = useTranslation();
  return (
    <section aria-label={t("trust.label")} className="border-t border-white/[0.08] py-8 sm:py-10">
      <ul className="grid list-none grid-cols-2 gap-x-8 gap-y-6 p-0 lg:grid-cols-4">
        {PRINCIPLES.map(({ key, Icon }, i) => (
          <li
            key={key}
            className={cn("flex flex-col gap-2", i > 0 && "lg:border-l lg:border-white/[0.08] lg:pl-8")}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground">{t(`trust.${key}.title`)}</p>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">{t(`trust.${key}.text`)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
