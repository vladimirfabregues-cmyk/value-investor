import { describe, it, expect } from "vitest";

import { buildTrendGeometry, polylinePoints, trendChangePct } from "@/lib/charts/scale";

describe("buildTrendGeometry", () => {
  it("returns null when there is nothing finite to plot", () => {
    expect(buildTrendGeometry([null, null])).toBeNull();
    expect(buildTrendGeometry([NaN, Infinity, null] as number[])).toBeNull();
  });

  it("anchors the domain at zero for all-positive data (no truncated axis)", () => {
    const g = buildTrendGeometry([100, 110, 140])!;
    expect(g.min).toBe(0);
    expect(g.max).toBe(140);
  });

  it("anchors the domain at zero for all-negative data", () => {
    const g = buildTrendGeometry([-10, -40, -20])!;
    expect(g.max).toBe(0);
    expect(g.min).toBe(-40);
  });

  it("spans the domain across zero when the data does", () => {
    const g = buildTrendGeometry([-20, 10, 30])!;
    expect(g.min).toBe(-20);
    expect(g.max).toBe(30);
    // the zero line sits between top and bottom, not at an edge
    expect(g.zeroY).toBeGreaterThan(0);
    expect(g.zeroY).toBeLessThan(g.height);
  });

  it("puts the highest value at the top of the plot area", () => {
    const g = buildTrendGeometry([0, 100], { height: 40, padY: 5 })!;
    const top = g.points.find((p) => p.value === 100)!;
    const bottom = g.points.find((p) => p.value === 0)!;
    expect(top.y).toBeLessThan(bottom.y); // smaller y = higher on screen
  });

  it("centres a single point", () => {
    const g = buildTrendGeometry([42], { width: 100 })!;
    expect(g.points).toHaveLength(1);
    expect(g.points[0].x).toBe(50);
  });

  it("breaks the line into runs around internal gaps", () => {
    const g = buildTrendGeometry([10, null, 30, 40])!;
    expect(g.runs).toHaveLength(2);
    expect(g.runs[0].map((p) => p.value)).toEqual([10]);
    expect(g.runs[1].map((p) => p.value)).toEqual([30, 40]);
    // leading/embedded nulls keep the original index so labels stay aligned
    expect(g.runs[1][0].index).toBe(2);
  });

  it("keeps a single contiguous run when leading nulls pad the start", () => {
    const g = buildTrendGeometry([null, null, 30, 40, 50])!;
    expect(g.runs).toHaveLength(1);
    expect(g.runs[0].map((p) => p.index)).toEqual([2, 3, 4]);
  });
});

describe("polylinePoints", () => {
  it("formats a run as space-separated x,y pairs", () => {
    const g = buildTrendGeometry([0, 100], { width: 100, height: 40, padX: 0, padY: 0 })!;
    expect(polylinePoints(g.runs[0])).toBe("0,40 100,0");
  });
});

describe("trendChangePct", () => {
  it("computes first-to-last change in percent", () => {
    expect(trendChangePct([100, 150])).toBe(50);
    expect(trendChangePct([100, null, 50])).toBe(-50);
  });

  it("ignores leading nulls, using the first real value as the base", () => {
    expect(trendChangePct([null, 200, 300])).toBe(50);
  });

  it("returns null when it cannot be computed", () => {
    expect(trendChangePct([100])).toBeNull();
    expect(trendChangePct([null, null])).toBeNull();
    expect(trendChangePct([0, 50])).toBeNull(); // undefined growth from zero
  });
});
