import { describe, it, expect } from "vitest";

import { deriveVerdictReason } from "@/lib/history/verdict-reason";

function withExplanation(explanation: unknown) {
  return { verdict_explanation: explanation };
}

describe("deriveVerdictReason", () => {
  it("reports the hard gate that fired, because it overrides everything else", () => {
    const analysis = withExplanation({
      hard_gates: [{ name: "Balance-sheet safety", detail: "…" }],
      checks: [{ name: "Valuation", status: "fail", score: 10, detail: "…" }],
    });

    expect(deriveVerdictReason(analysis)).toBe("Balance-sheet safety");
  });

  it("prefers the first gate when several fired", () => {
    const analysis = withExplanation({
      hard_gates: [{ name: "Value-trap risk" }, { name: "Listed under two years" }],
    });

    expect(deriveVerdictReason(analysis)).toBe("Value-trap risk");
  });

  it("names the failed checks when no gate fired", () => {
    const analysis = withExplanation({
      hard_gates: [],
      checks: [
        { name: "Valuation", status: "pass" },
        { name: "Business quality", status: "fail" },
      ],
    });

    expect(deriveVerdictReason(analysis)).toBe("Business quality failed");
  });

  it("joins several failed checks into one phrase", () => {
    const analysis = withExplanation({
      hard_gates: [],
      checks: [
        { name: "Valuation", status: "fail" },
        { name: "Business quality", status: "fail" },
      ],
    });

    expect(deriveVerdictReason(analysis)).toBe("Valuation and business quality failed");
  });

  it("falls back to borderline checks when nothing outright failed", () => {
    const analysis = withExplanation({
      hard_gates: [],
      checks: [
        { name: "Valuation", status: "warn" },
        { name: "Business quality", status: "pass" },
      ],
    });

    expect(deriveVerdictReason(analysis)).toBe("Borderline on valuation");
  });

  it("says so when every check passed", () => {
    const analysis = withExplanation({
      hard_gates: [],
      checks: [
        { name: "Valuation", status: "pass" },
        { name: "Financial health", status: "pass" },
      ],
    });

    expect(deriveVerdictReason(analysis)).toBe("All checks passed");
  });

  it("truncates a reason that would overflow the panel", () => {
    const analysis = withExplanation({
      hard_gates: [{ name: "Micro-cap — the screen price is not realisable in size" }],
    });

    const reason = deriveVerdictReason(analysis);
    expect(reason.length).toBeLessThanOrEqual(44);
    expect(reason.endsWith("…")).toBe(true);
  });

  // Analyses saved before verdict_explanation existed must still say something.
  it("falls back to the saved one-line verdict on older analyses", () => {
    expect(deriveVerdictReason({ ticker: "AAPL" }, "Priced for perfection")).toBe(
      "Priced for perfection",
    );
  });

  it("never throws on absent, corrupt or wrongly-typed stored JSON", () => {
    expect(deriveVerdictReason(null)).toBe("Reason not recorded");
    expect(deriveVerdictReason(undefined)).toBe("Reason not recorded");
    expect(deriveVerdictReason("not an object")).toBe("Reason not recorded");
    expect(deriveVerdictReason(withExplanation("nonsense"), "  ")).toBe("Reason not recorded");
    expect(deriveVerdictReason(withExplanation({ hard_gates: "nope", checks: 42 }))).toBe(
      "Reason not recorded",
    );
    expect(deriveVerdictReason(withExplanation({ checks: [{ status: "fail" }] }))).toBe(
      "Reason not recorded",
    );
  });
});
