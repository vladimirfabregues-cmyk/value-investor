"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
} from "@/lib/i18n/translations";
import { makeTranslator, type Translator } from "@/lib/i18n/translate";

const STORAGE_KEY = "vi:locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate a dot-path key, e.g. t("nav.analyse"); interpolates {name} vars. */
  t: Translator;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as string[]).includes(value);
}

/** Defensive read — storage can throw (private mode, quota) or be absent (SSR). */
function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

function writeStoredLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* storage full or blocked — the choice just won't persist */
  }
}

/**
 * Holds the active locale. Defaults to English for the server render and the
 * first client paint (requirement: default English), then adopts the stored
 * choice after mount — reading localStorage during render would desync SSR and
 * client markup.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored && stored !== DEFAULT_LOCALE) setLocaleState(stored);
  }, []);

  // Keep <html lang> in step so assistive tech announces the right language.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeStoredLocale(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: makeTranslator(locale) }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslation(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // A component rendered outside the provider still needs a working t().
    return { locale: DEFAULT_LOCALE, setLocale: () => {}, t: makeTranslator(DEFAULT_LOCALE) };
  }
  return ctx;
}
