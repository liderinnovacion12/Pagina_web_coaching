"use client";

import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { revealUp } from "@/lib/motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function CatalogoHeading() {
  const { tr } = useLanguage();
  const c = tr.catalogo;

  return (
    <ScrollReveal variants={revealUp} once={false} className="border-t border-white/10 pt-10">
      <h2 className="font-display text-4xl font-bold text-gradient-gold sm:text-5xl">{c.h2}</h2>
      <p className="mt-4 max-w-xl text-mist-400">{c.desc}</p>
    </ScrollReveal>
  );
}
