"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";

/**
 * Slim "back to the workspace chooser" link — the only chrome on the neutral,
 * shared About page (which otherwise carries no app-specific navigation).
 */
export function WorkspacesLink() {
  const { t } = useTranslation();
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/25 hover:text-foreground"
    >
      <LayoutGrid className="h-4 w-4" aria-hidden="true" />
      {t("nav.workspaces")}
    </Link>
  );
}
