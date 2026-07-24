"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SCROLL_REVEAL_VIEWPORT, staggerContainer } from "@/lib/motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const AVATARS = ["CM", "AR", "MT"];
const AVATAR_COLORS = ["bg-gold-500", "bg-purple-500", "bg-blue-500"];

export function SeccionTestimonios() {
  const { tr } = useLanguage();
  const sec = tr.testimonios;

  return (
    <section className="relative isolate px-6 py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -z-10 h-full"
        style={{ background: "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(0,201,87,0.04), transparent)" }}
      />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={SCROLL_REVEAL_VIEWPORT}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-gold-400 mb-4">{sec.eyebrow}</span>
          <h2 className="font-display text-4xl font-extrabold text-white sm:text-5xl">
            {sec.h2Line1}<br /><span className="text-gradient-gold">{sec.h2Line2}</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SCROLL_REVEAL_VIEWPORT}
          variants={staggerContainer(0.1)}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {sec.items.map((t, i) => (
            <motion.div
              key={t.nombre}
              variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl border border-white/8 bg-ink-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold-500/20"
            >
              <Quote className="h-6 w-6 text-gold-500/40 mb-4" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => <Star key={s} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />)}
              </div>
              <p className="text-sm text-mist-300 leading-relaxed mb-5 italic">"{t.texto}"</p>
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 px-3 py-1">
                <span className="font-mono text-[10px] text-gold-400">{t.cursoVisto}</span>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                <div className={`h-9 w-9 rounded-full ${AVATAR_COLORS[i]} flex items-center justify-center shrink-0`}>
                  <span className="font-display text-xs font-bold text-white">{AVATARS[i]}</span>
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-white">{t.nombre}</p>
                  <p className="font-mono text-xs text-mist-500">{t.rol} · {t.pais}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
