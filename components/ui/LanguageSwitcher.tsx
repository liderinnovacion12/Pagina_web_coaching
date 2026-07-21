"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 px-1 py-1 font-mono text-xs">
      {(["es", "en"] as Locale[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          className={`rounded-full px-3 py-1 uppercase tracking-wider transition-all duration-200 ${
            locale === lang
              ? "bg-gold-500 text-ink-950 font-semibold"
              : "text-mist-400 hover:text-white"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
