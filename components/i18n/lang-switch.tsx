"use client";

import { useTranslation } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils/cn";

/**
 * Inline EN / FR switch — labelled text buttons, never colour-alone. The single
 * language control across the front-of-site header and the /value workspace
 * topbar (there is no longer a separate floating toggle).
 */
export function LangSwitch() {
  const { locale, setLocale, t } = useTranslation();
  const langs: { code: Locale; short: string; label: string }[] = [
    { code: "en", short: "EN", label: t("language.english") },
    { code: "fr", short: "FR", label: t("language.french") },
  ];
  return (
    <div
      role="group"
      aria-label={t("language.change")}
      className="flex items-center gap-1 rounded-full border border-white/12 p-0.5"
    >
      {langs.map(({ code, short, label }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={label}
            className={cn(
              "flex h-7 min-w-8 items-center justify-center rounded-full px-2 text-xs tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              active
                ? "bg-primary/20 font-semibold text-primary-bright ring-1 ring-primary/50"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}
