"use client";

import { ChevronDown } from "lucide-react";

/**
 * Methodology detail, deliberately collapsed.
 *
 * This content used to sit beside the primary action and competed with it.
 * A native <details> keeps it one keystroke away, is open/closed by the
 * browser without JavaScript, and is announced correctly by screen readers.
 */
export function HowValuationWorks() {
  return (
    <details className="group rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-foreground/90 [&::-webkit-details-marker]:hidden">
        How the valuation works
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="space-y-4 border-t border-white/[0.06] px-5 py-4 text-sm leading-7 text-muted-foreground">
        <p>
          Every company is valued with the model that fits its economics, then put through
          balance-sheet, earnings-quality and cyclicality checks before a verdict is issued.
        </p>

        <dl className="space-y-3">
          <div>
            <dt className="font-medium text-foreground/90">Operating companies · discounted cash flow</dt>
            <dd>
              Free cash flow is projected and discounted at a sector-specific rate, using a
              conservative basis (the lower of the latest year and the three-year average), and
              cross-checked against the Graham number.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground/90">Banks and insurers · justified price-to-book</dt>
            <dd>
              Valued on cycle-average return on equity rather than cash flow, because reported
              &ldquo;free cash flow&rdquo; for a financial is float and deposit timing, not owner earnings.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground/90">Property and investment trusts · net asset value</dt>
            <dd>
              Anchored to book value, blended with a funds-from-operations estimate that adds back
              property depreciation. For trusts, the margin of safety is the discount to NAV.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground/90">Utilities · dividend discount</dt>
            <dd>
              Valued on the dividend stream, since heavy ongoing capital expenditure makes reported
              free cash flow lumpy and often negative during build-out.
            </dd>
          </div>
        </dl>

        <p>
          Verdicts can be capped regardless of score. Earnings at a cyclical peak, revenue in
          structural decline, heavy share issuance, profits not backed by cash, or a valuation no
          second model corroborates will all hold a verdict back — the reasoning is always shown on
          the result.
        </p>

        <p className="text-xs text-muted-foreground">
          This is research tooling, not investment advice. Figures are estimates from third-party
          data and may be incomplete or wrong.
        </p>
      </div>
    </details>
  );
}
