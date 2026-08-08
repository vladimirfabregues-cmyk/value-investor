import { describe, expect, it } from "vitest";

import { gateStatusClause } from "@/lib/finance/verdict-explanation";
import type { CheckStatus } from "@/types/analysis";

type Check = { name: string; status: CheckStatus; score: number | null };

const check = (name: string, status: CheckStatus, score: number | null = 70): Check => ({
  name,
  status,
  score,
});

/**
 * P1-1 guard. The status clause must be a pure function of the gate-state
 * array, and must never claim "passed" while any component is borderline or
 * failed — the contradiction that shipped on the ACIC result page.
 */
describe("gateStatusClause", () => {
  it("all PASS → every check passed", () => {
    const s = gateStatusClause([check("Valuation", "pass"), check("Financial health", "pass")], []);
    expect(s).toBe("Every component check passed and no red flag was triggered.");
  });

  it("any BORDERLINE, none FAIL → names the borderline component with its score", () => {
    const s = gateStatusClause(
      [check("Valuation", "pass"), check("Financial health", "warn", 67)],
      [],
    );
    expect(s).toBe("All gates cleared, but financial health is borderline at 67/100.");
    expect(s).not.toMatch(/every component check passed/i);
  });

  it("borderline without a score omits the number", () => {
    const s = gateStatusClause(
      [check("Valuation", "pass"), check("Margin of safety", "warn", null)],
      [],
    );
    expect(s).toBe("All gates cleared, but margin of safety is borderline.");
  });

  it("multiple borderline components are joined", () => {
    const s = gateStatusClause(
      [check("Financial health", "warn", 67), check("Business quality", "warn", 60)],
      [],
    );
    expect(s).toBe(
      "All gates cleared, but financial health is borderline at 67/100 and business quality is borderline at 60/100.",
    );
  });

  it("any FAIL names the failing checks", () => {
    const s = gateStatusClause(
      [check("Valuation", "fail", 40), check("Financial health", "warn", 67)],
      [],
    );
    expect(s).toBe("No hard gate was triggered, but valuation did not pass.");
  });

  it("a hard gate takes precedence over borderline/fail states", () => {
    const s = gateStatusClause(
      [check("Financial health", "fail", 30)],
      [{ name: "Balance-sheet safety", detail: "Leverage breached the threshold." }],
    );
    expect(s).toMatch(/^However, balance-sheet safety triggered a hard gate/);
  });

  it("is pure: no gate-state array yields a 'passed' claim unless all pass", () => {
    const states: CheckStatus[] = ["pass", "warn", "fail"];
    for (const a of states) {
      for (const b of states) {
        const s = gateStatusClause([check("A", a), check("B", b)], []);
        const claimsPassed = /every component check passed/i.test(s);
        const allPass = a === "pass" && b === "pass";
        expect(claimsPassed).toBe(allPass);
      }
    }
  });
});
