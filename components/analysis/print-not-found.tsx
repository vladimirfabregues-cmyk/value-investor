"use client";

import Link from "next/link";

import { useTranslation } from "@/lib/i18n/locale-context";

/** Shown when a print link points at a conclusion that no longer exists. */
export function PrintNotFound() {
  const { t } = useTranslation();
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <p className="text-sm text-muted-foreground">{t("print.notFound")}</p>
      <Link
        href="/value"
        className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
      >
        {t("home.analyseAnother")} →
      </Link>
    </main>
  );
}
