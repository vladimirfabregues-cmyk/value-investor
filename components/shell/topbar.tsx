"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, LayoutGrid, Menu } from "lucide-react";

import { SidebarHistory } from "@/components/shell/sidebar-history";
import { HistorySkeleton } from "@/components/shell/shell-layout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { SavedAnalysisSummary } from "@/types/analysis";

interface TopbarProps {
  history: SavedAnalysisSummary[];
}

// Value Investor lives under /value (its own zone); labels are keyed.
// "About" is intentionally not here: it's a terminal-level page reached from
// the welcome/landing screen, not part of the Value Investor workspace nav.
const NAV = [
  { href: "/value", key: "nav.analyse" },
  { href: "/value/screen", key: "nav.screener" },
  { href: "/value/compare", key: "nav.compare" },
] as const;

export function Topbar({ history }: TopbarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const historyTitle = t("history.title");

  return (
    <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(4,9,17,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="lg:hidden"
                aria-label={t("history.open", { label: historyTitle })}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">{t("history.open", { label: historyTitle })}</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0" closeLabel={t("common.cancel")}>
              {/* Radix requires a title for the dialog's accessible name */}
              <SheetTitle className="sr-only">{`${historyTitle} (${history.length})`}</SheetTitle>
              <SheetDescription className="sr-only">{t("history.subtitle")}</SheetDescription>
              <div className="h-full overflow-y-auto p-6">
                <Suspense fallback={<HistorySkeleton />}>
                  <SidebarHistory history={history} />
                </Suspense>
              </div>
            </SheetContent>
          </Sheet>

          {/* Return to the landing chooser (the app's root, above /value). */}
          <Link
            href="/"
            aria-label={t("nav.workspaces")}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/25 hover:text-foreground"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("nav.workspaces")}</span>
          </Link>

          <Link href="/value" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/35 bg-gradient-to-b from-primary/20 to-primary/5 font-display text-sm font-semibold tracking-tight text-primary shadow-[0_8px_20px_rgba(181,148,88,0.15)] transition-shadow group-hover:shadow-[0_8px_24px_rgba(181,148,88,0.28)]">
              VI
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-xl leading-none text-foreground">Value Investor</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                {t("nav.tagline")}
              </div>
            </div>
          </Link>
        </div>

        {/* Own full-width row on mobile so the items never force horizontal page scroll */}
        <nav
          aria-label={t("nav.primaryLabel")}
          className="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-full border border-white/[0.07] bg-white/[0.03] p-1 sm:order-none sm:w-auto sm:overflow-visible"
        >
          {NAV.map(({ href, key }) => {
            const active = href === "/value" ? pathname === "/value" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                  active
                    ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(181,148,88,0.35)]"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        {/* Honest source attribution — no "live"/real-time claim (the Yahoo
            feed is delayed; per-analysis timing lives in the Data status panel) */}
        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
          <Database className="h-3.5 w-3.5" aria-hidden="true" />
          {t("nav.dataSources")}
        </div>
      </div>
    </div>
  );
}
