"use client";

import { useTranslation } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils/cn";

/**
 * Fixed English/French switch, bottom-right of the viewport.
 *
 * Sits above content (z-50) and clears the iPhone home indicator via the
 * safe-area inset. Flags are decorative (aria-hidden) — the accessible name
 * comes from each button's label, and the active language is conveyed by
 * aria-pressed plus a visible ring, never by the emoji alone.
 */
export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  const flags: { code: Locale; emoji: string; label: string }[] = [
    { code: "en", emoji: "🇬🇧", label: t("language.english") },
    { code: "fr", emoji: "🇫🇷", label: t("language.french") },
  ];

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full border border-white/12 bg-[rgba(6,11,20,0.9)] p-1 shadow-panel backdrop-blur"
      style={{ marginBottom: "env(safe-area-inset-bottom)", marginRight: "env(safe-area-inset-right)" }}
    >
      {flags.map(({ code, emoji, label }) => {
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
              "flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              active ? "bg-primary/20 ring-1 ring-primary/50" : "opacity-60 hover:opacity-100",
            )}
          >
            <span aria-hidden="true">{emoji}</span>
          </button>
        );
      })}
    </div>
  );
}
