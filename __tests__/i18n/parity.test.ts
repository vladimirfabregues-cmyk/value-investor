import { describe, it, expect } from "vitest";

import { translations, type Dict } from "@/lib/i18n/translations";

/** Every leaf key path in a dictionary, e.g. "compare.rows.pe". */
function leafPaths(dict: Dict, prefix = ""): string[] {
  return Object.entries(dict).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [path] : leafPaths(value, path);
  });
}

describe("i18n en/fr parity", () => {
  const en = new Set(leafPaths(translations.en));
  const fr = new Set(leafPaths(translations.fr));

  it("has a non-trivial number of keys", () => {
    expect(en.size).toBeGreaterThan(300);
  });

  it("every English key has a French translation", () => {
    const missing = [...en].filter((k) => !fr.has(k)).sort();
    expect(missing).toEqual([]);
  });

  it("has no French key without an English counterpart", () => {
    const extra = [...fr].filter((k) => !en.has(k)).sort();
    expect(extra).toEqual([]);
  });
});
