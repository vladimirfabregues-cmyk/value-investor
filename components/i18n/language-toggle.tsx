"use client";

import { usePathname } from "next/navigation";

import { useTranslation } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils/cn";

/**
 * Fixed English/French switch, bottom-right of the viewport.
 *
 * Sits above content (z-50) and clears the iPhone home indicator via the
 * safe-area inset. Each option shows its language code as visible text
 * (EN / FR) rather than a flag — flags name countries, not languages, and
 * read poorly to assistive tech. The full language name is the accessible
 * name (aria-label), and the active language is conveyed by aria-pressed plus
 * three non-colour cues (fill, ring, heavier weight), never by colour alone.
 */
export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();
  const pathname = usePathname();

  // The front-of-site carries its EN/FR switch in the global header; this fixed
  // control is only for the /value app workspace, which has no such header.
  if (!pathname?.startsWith("/value")) return null;

  const langs: { code: Locale; short: string; label: string }[] = [
    { code: "en", short: "EN", label: t("language.english") },
    { code: "fr", short: "FR", label: t("language.french") },
  ];

  return (
    <div
      data-no-print
      role="group"
      aria-label={t("language.change")}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full border border-white/12 bg-[rgba(6,11,20,0.9)] p-1 shadow-panel backdrop-blur"
      style={{ marginBottom: "env(safe-area-inset-bottom)", marginRight: "env(safe-area-inset-right)" }}
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
            title={label}
            className={cn(
              "flex h-8 min-w-9 items-center justify-center rounded-full px-2.5 text-xs tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
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
