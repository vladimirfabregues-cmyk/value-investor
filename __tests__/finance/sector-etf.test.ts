import { describe, it, expect } from "vitest";

import { etfExposureForSector } from "@/lib/finance/sector-etf";

describe("etfExposureForSector", () => {
  it("deep-links to the matching exposure group for a mapped sector", () => {
    const link = etfExposureForSector("Information Technology");
    expect(link.specific).toBe(true);
    expect(link.href).toBe("/etf/screener?group=eq-us-sector-tech");
  });

  it("falls back to the whole screener for an unmapped sector", () => {
    const link = etfExposureForSector("Utilities");
    expect(link.specific).toBe(false);
    expect(link.href).toBe("/etf/screener");
  });

  it("falls back when the sector is missing", () => {
    expect(etfExposureForSector(undefined)).toEqual({ href: "/etf/screener", specific: false });
    expect(etfExposureForSector(null)).toEqual({ href: "/etf/screener", specific: false });
  });
});
