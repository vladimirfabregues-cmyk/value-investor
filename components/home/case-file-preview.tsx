"use client";

import { useTranslation } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";

const ROWS = [
  { n: "01", key: "evidence" },
  { n: "02", key: "method" },
  { n: "03", key: "checks" },
  { n: "04", key: "limitations" },
  { n: "05", key: "conclusion" },
] as const;

/**
 * A static, document-style illustration of the Casebook method: five ordered
 * chapters (evidence → conclusion) that embody "every conclusion has a case".
 * Uses the surface / ink / line / gold tokens (a dark dossier, on-brand) — no
 * fabricated figures, no price chart, no motion. It carries real text, so it is
 * exposed to assistive tech as a labelled figure rather than hidden.
 */
export function CaseFilePreview() {
  const { t } = useTranslation();
  return (
    <figure
      aria-label={t("hero.caseFile.label")}
      className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,28,45,0.96),rgba(8,14,25,0.98))] p-5 shadow-panel backdrop-blur sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/85">
          {t("hero.caseFile.label")}
        </span>
        <span aria-hidden="true" className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
        </span>
      </div>

      <ol className="m-0 list-none p-0">
        {ROWS.map((r, i) => (
          <li
            key={r.key}
            className={cn(
              "flex items-baseline gap-3 py-3",
              i > 0 && "border-t border-white/[0.05]",
            )}
          >
            <span className="shrink-0 font-display text-sm tabular-nums text-primary/70">{r.n}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight text-foreground">
                {t(`hero.caseFile.${r.key}.title`)}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {t(`hero.caseFile.${r.key}.sub`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
