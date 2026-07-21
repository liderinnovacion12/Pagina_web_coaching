"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Locale } from "./translations";
import { t } from "./translations";

type LanguageContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  tr: (typeof t)[Locale];
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "es",
  setLocale: () => {},
  tr: t.es,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es");
  return (
    <LanguageContext.Provider value={{ locale, setLocale, tr: t[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
