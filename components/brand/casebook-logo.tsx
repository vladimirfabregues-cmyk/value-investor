import type { ReactNode } from "react";

import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils/cn";

const SIZES = {
  md: { disc: "h-9 w-9 text-sm", word: "text-base" },
  lg: { disc: "h-11 w-11 text-base", word: "text-xl sm:text-2xl" },
} as const;

interface CasebookLogoProps {
  size?: keyof typeof SIZES;
  /** Hide the wordmark for a compact, icon-only lockup. */
  showWordmark?: boolean;
  /** Render the wordmark as an h1 (e.g. the landing masthead); default span. */
  wordmarkAs?: "span" | "h1";
  /** Optional second line under the wordmark (e.g. a localised section label). */
  sublabel?: ReactNode;
  /** Applied to the wordmark wrapper — e.g. "hidden sm:block" to show seal-only on mobile. */
  wordmarkClassName?: string;
  className?: string;
}

/**
 * The Investment Casebook logo — a gold "IC" bookplate seal + wordmark. The
 * seal is decorative (aria-hidden); the wordmark is selectable text and carries
 * the accessible name. Works horizontally (seal + wordmark) or compact (seal
 * only, via showWordmark={false}). The single source for the mark across the
 * topbar and the landing masthead.
 */
export function CasebookLogo({
  size = "md",
  showWordmark = true,
  wordmarkAs: Wordmark = "span",
  sublabel,
  wordmarkClassName,
  className,
}: CasebookLogoProps) {
  const s = SIZES[size];
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-primary font-display font-semibold tracking-tight text-primary-foreground shadow-[0_8px_22px_rgba(181,148,88,0.3)]",
          s.disc,
        )}
      >
        IC
      </span>
      {showWordmark && (
        <div className={cn("min-w-0", wordmarkClassName)}>
          <Wordmark
            className={cn(
              "block whitespace-nowrap font-display leading-none tracking-tight text-foreground transition-colors group-hover:text-primary-bright",
              s.word,
            )}
          >
            {BRAND.name}
          </Wordmark>
          {sublabel && (
            <span className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-primary/80">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
