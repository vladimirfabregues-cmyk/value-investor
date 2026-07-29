"use client";

import { useTranslation } from "@/lib/i18n/locale-context";

/**
 * The one translatable label on an otherwise personal, source-language bio.
 * Isolated as a client component so the page itself can stay a server
 * component that reads history at request time.
 */
export function AboutEyebrow() {
  const { t } = useTranslation();
  return (
    <div className="text-[11px] uppercase tracking-[0.24em] text-primary/90">
      {t("about.eyebrow")}
    </div>
  );
}
