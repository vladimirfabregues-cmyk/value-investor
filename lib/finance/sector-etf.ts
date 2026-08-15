/**
 * Bridge from a company's GICS sector to the fund side (P9-1).
 *
 * The fund universe is mostly broad/regional trackers; only a few sectors have
 * a genuine single-sector exposure group to point at. We map a sector to an
 * exposure group *only* where such a fund actually exists — otherwise the link
 * falls back to the whole ETF screener, so a cross-link is never a promise the
 * fund data can't keep. The ETF screener reads `?group=<id>` from the URL.
 */

/** GICS sector → ETF exposure-group id, where the universe has a real match. */
const SECTOR_TO_EXPOSURE_GROUP: Record<string, string> = {
  "Information Technology": "eq-us-sector-tech",
};

export interface EtfExposureLink {
  /** Cross-zone href into the ETF screener (the ETF zone is a separate build
   *  behind a rewrite, so callers use a plain anchor, not next/link). */
  href: string;
  /** True when the link targets a specific sector exposure group rather than
   *  the whole list — lets the caller choose sector-specific wording. */
  specific: boolean;
}

/** The best ETF-screener link for a company sector, specific where possible. */
export function etfExposureForSector(sector?: string | null): EtfExposureLink {
  const groupId = sector ? SECTOR_TO_EXPOSURE_GROUP[sector] : undefined;
  return groupId
    ? { href: `/etf/screener?group=${encodeURIComponent(groupId)}`, specific: true }
    : { href: "/etf/screener", specific: false };
}
