"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { SidebarHistory } from "@/components/shell/sidebar-history";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { SavedAnalysisSummary } from "@/types/analysis";

interface TopbarProps {
  history: SavedAnalysisSummary[];
}

const NAV = [
  { href: "/", label: "Analyze" },
  { href: "/screen", label: "Screener" },
  { href: "/compare", label: "Compare" },
] as const;

export function Topbar({ history }: TopbarProps) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(4,9,17,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open history</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0">
              <div className="h-full p-6">
                <Suspense fallback={<div className="text-sm text-muted-foreground">Loading history...</div>}>
                  <SidebarHistory history={history} />
                </Suspense>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/35 bg-gradient-to-b from-primary/20 to-primary/5 font-display text-sm font-semibold tracking-tight text-primary shadow-[0_8px_20px_rgba(181,148,88,0.15)] transition-shadow group-hover:shadow-[0_8px_24px_rgba(181,148,88,0.28)]">
              VI
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-xl leading-none text-foreground">Value Investor</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Conservative Equity Analysis
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] p-1">
          {NAV.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(181,148,88,0.35)]"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:flex">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
          Live data · Yahoo Finance + SEC EDGAR
        </div>
      </div>
    </div>
  );
}
