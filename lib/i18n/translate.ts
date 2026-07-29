/**
 * Pure translation helpers — no React, safe to import on the server (the
 * scoring engine generates prose here at analysis time) and on the client.
 *
 * The React context in `locale-context.tsx` is a thin wrapper over
 * `makeTranslator`; both share this single implementation.
 */
import { translations, type Dict, type Locale } from "@/lib/i18n/translations";

export type Vars = Record<string, string | number>;
export type Translator = (key: string, vars?: Vars) => string;

/** Walk a dot path through a nested dictionary; returns undefined on any miss. */
export function lookup(dict: Dict, path: string): string | undefined {
  let node: string | Dict | undefined = dict;
  for (const part of path.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * Build the translator for a locale. A missing key falls back to English, then
 * to the raw key — so a partial translation never renders `nav.analyse`.
 */
export function makeTranslator(locale: Locale): Translator {
  return (key: string, vars?: Vars): string => {
    const value = lookup(translations[locale], key) ?? lookup(translations.en, key) ?? key;
    return interpolate(value, vars);
  };
}
