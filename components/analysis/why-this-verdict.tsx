import { AlertTriangle, Check, Minus, ShieldAlert, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { verdictClasses } from "@/lib/utils/format";
import type { CheckStatus, VerdictExplanation } from "@/types/analysis";

interface WhyThisVerdictProps {
  explanation: VerdictExplanation;
}

/** Status is conveyed by icon + word + colour — never colour alone (WCAG 1.4.1). */
const STATUS_META: Record<
  CheckStatus,
  { icon: typeof Check; word: string; text: string; ring: string }
> = {
  pass: { icon: Check, word: "Passed", text: "text-emerald-300", ring: "border-emerald-500/30 bg-emerald-500/10" },
  warn: { icon: Minus, word: "Borderline", text: "text-amber-300", ring: "border-amber-500/30 bg-amber-500/10" },
  fail: { icon: X, word: "Failed", text: "text-red-300", ring: "border-red-500/30 bg-red-500/10" },
};

export function WhyThisVerdict({ explanation }: WhyThisVerdictProps) {
  const { final_verdict, overall_score, checks, hard_gates, valuation_method_label } = explanation;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-foreground">Why this verdict</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              How the checks and gates combined to produce the final result.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-medium text-muted-foreground">
                Overall score
              </div>
              <div className="font-display text-3xl tabular-nums text-foreground">
                {overall_score}
                <span className="text-base text-muted-foreground">/100</span>
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${verdictClasses(final_verdict)}`}
            >
              {final_verdict.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* ── Component checks ── */}
        <ul className="mt-6 space-y-2">
          {checks.map((check) => {
            const meta = STATUS_META[check.status];
            const Icon = meta.icon;
            return (
              <li
                key={check.name}
                className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${meta.ring}`}
                  aria-hidden="true"
                >
                  <Icon className={`h-3 w-3 ${meta.text}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-medium text-foreground">{check.name}</span>
                    <span className={`text-xs font-semibold ${meta.text}`}>{meta.word}</span>
                    {check.score !== null && (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {check.score}/100
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{check.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* ── Hard gates ── */}
        {hard_gates.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-amber-200">
                {hard_gates.length === 1 ? "Hard gate applied" : `${hard_gates.length} hard gates applied`}
              </h3>
            </div>
            <p className="mt-1 text-xs text-amber-200/70">
              These override the composite score — a high score cannot outrank them.
            </p>
            <ul className="mt-3 space-y-2.5">
              {hard_gates.map((gate) => (
                <li key={gate.name} className="flex items-start gap-2.5">
                  <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-xs font-medium text-amber-100">{gate.name}</div>
                    <p className="mt-0.5 text-xs leading-5 text-amber-200/80">{gate.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Plain-language summary ── */}
        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <p className="text-sm leading-7 text-muted-foreground">{explanation.explanation}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Valuation model: {valuation_method_label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
