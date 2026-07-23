import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import type { ValueInvestingAnalysis } from "@/types/analysis";

/**
 * Price against each valuation model, on one shared scale (§8).
 *
 * Answers a single question: does the market price sit above or below what each
 * model thinks the business is worth? Built from HTML bars rather than SVG — a
 * bar chart of four values is more accessible and responsive as real elements.
 * Every bar states its value and its gap-to-price in words, so the emerald/red
 * tone only reinforces meaning that text already carries.
 */
export function ValueVsPrice({ analysis }: { analysis: ValueInvestingAnalysis }) {
  const currency = analysis.currency;
  const price = analysis.current_price;
  const iv = analysis.intrinsic_value;

  const estimates = [
    { label: "DCF value", value: iv.dcf_value_per_share },
    { label: "Graham value", value: iv.graham_value_per_share },
    { label: "Estimated value", value: iv.blended_intrinsic_value_per_share, emphasis: true },
  ].filter((e): e is { label: string; value: number; emphasis?: boolean } =>
    e.value !== null && Number.isFinite(e.value),
  );

  if (!Number.isFinite(price) || estimates.length === 0) {
    return (
      <figure className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <figcaption className="text-sm font-medium text-foreground">Price vs estimated value</figcaption>
        <p className="mt-3 text-xs text-muted-foreground">
          Estimated value could not be computed for this company.
        </p>
      </figure>
    );
  }

  const max = Math.max(price, ...estimates.map((e) => e.value)) * 1.08;
  const rows = [
    { label: "Current price", value: price, kind: "price" as const, emphasis: false },
    ...estimates.map((e) => ({
      label: e.label,
      value: e.value,
      kind: "estimate" as const,
      emphasis: e.emphasis ?? false,
    })),
  ];

  return (
    <figure className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">Price vs estimated value</span>
      </figcaption>
      <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
        Where the market price sits against each valuation model, per share.
      </p>

      <div className="relative mt-4">
        {/* Reference line at the current price, so cheap/expensive is visible at a glance */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 border-l border-dashed border-white/25"
          style={{ left: `${(price / max) * 100}%` }}
          aria-hidden="true"
        />
        <ul className="space-y-2.5">
          {rows.map((row) => {
            const deltaPct = row.kind === "estimate" ? ((row.value - price) / price) * 100 : null;
            const above = deltaPct !== null && deltaPct > 0;
            const below = deltaPct !== null && deltaPct < 0;
            return (
              <li key={row.label} className="grid grid-cols-[7.5rem,1fr] items-center gap-3">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <div className="flex items-center gap-2">
                  <div className="h-5 flex-1 overflow-hidden rounded bg-white/[0.04]">
                    <div
                      className={cn(
                        "h-full rounded",
                        row.kind === "price"
                          ? "bg-white/25"
                          : above
                            ? "bg-emerald-400/70"
                            : below
                              ? "bg-red-400/60"
                              : "bg-primary/60",
                        row.emphasis && "ring-1 ring-inset ring-white/20",
                      )}
                      style={{ width: `${Math.max(1, (row.value / max) * 100)}%` }}
                    />
                  </div>
                  <span className="w-40 shrink-0 text-right text-xs tabular-nums text-foreground">
                    {formatCurrency(row.value, currency)}
                    {deltaPct !== null && (
                      <span className="ml-1 text-muted-foreground">
                        ({above ? "+" : ""}
                        {Math.round(deltaPct)}% vs price)
                      </span>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 text-[11px] leading-4 text-muted-foreground">
        A bar that stops short of the dashed price line means the estimate is below the market price
        — a premium. A bar that extends past it means the estimate exceeds the price — a discount, i.e.
        a margin of safety.
      </p>
    </figure>
  );
}
