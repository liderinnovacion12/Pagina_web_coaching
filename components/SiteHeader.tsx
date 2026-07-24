"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from "framer-motion";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { Locale } from "@/lib/i18n/translations";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const paddingY = useTransform(scrollY, [0, 80], [32, 14]);
  const backgroundAlpha = useTransform(scrollY, [0, 80], [0, 0.92]);
  const borderAlpha = useTransform(scrollY, [0, 80], [0, 0.08]);

  const { theme } = useTheme();

  // MotionValues that update when theme changes so the bg rgba reacts
  const bgR = useMotionValue(theme === "dark" ? 7 : 255);
  const bgG = useMotionValue(theme === "dark" ? 7 : 255);
  const bgB = useMotionValue(theme === "dark" ? 11 : 255);

  useEffect(() => {
    bgR.set(theme === "dark" ? 7 : 255);
    bgG.set(theme === "dark" ? 7 : 255);
    bgB.set(theme === "dark" ? 11 : 255);
  }, [theme, bgR, bgG, bgB]);

  const backgroundColor = useMotionTemplate`rgba(${bgR}, ${bgG}, ${bgB}, ${backgroundAlpha})`;
  const borderColor = useMotionTemplate`rgba(127, 127, 127, ${borderAlpha})`;

  const { locale, setLocale, tr } = useLanguage();

  return (
    <motion.header
      data-testid="site-header"
      style={{ paddingTop: paddingY, paddingBottom: paddingY, backgroundColor, borderColor }}
      className="sticky top-0 z-20 border-b border-transparent backdrop-blur-xl"
    >
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-white">
          NCS REALTY<span className="text-gold-400"> HUB</span>
          <span className="text-gold-400"> •</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Selector de idioma */}
          <div className="flex items-center gap-1 rounded-full border border-white/10 px-1 py-1 font-mono text-xs">
            {(["es", "en"] as Locale[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className={`rounded-full px-3 py-1 transition-all duration-200 uppercase ${
                  locale === lang
                    ? "bg-gold-500 text-ink-950 font-semibold"
                    : "text-mist-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <ThemeToggle />

          <Link
            href="/login"
            className="rounded-full border border-gold-500/60 px-4 py-1.5 text-sm font-medium text-gold-300 transition hover:bg-gold-500/10"
          >
            {tr.header.ingresar}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
