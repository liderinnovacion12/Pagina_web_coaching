"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Award, Zap, Globe, TrendingUp } from "lucide-react";
import { SCROLL_REVEAL_VIEWPORT, staggerContainer } from "@/lib/motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ICONS = [BookOpen, Users, Award, Zap, Globe, TrendingUp];
const COLORS = [
  { color: "text-gold-400",   bg: "bg-gold-500/10",   border: "border-gold-500/20" },
  { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
  { color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20" },
  { color: "text-gold-300",   bg: "bg-gold-400/10",   border: "border-gold-400/20" },
];

export function SeccionFeatures() {
  const { tr } = useLanguage();
  const f = tr.features;

  return (
    <section className="relative isolate px-6 py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -z-10 h-full"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,201,87,0.05), transparent)" }}
      />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={SCROLL_REVEAL_VIEWPORT}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-gold-400 mb-4">{f.eyebrow}</span>
          <h2 className="font-display text-4xl font-extrabold text-white sm:text-5xl">
            {f.h2Line1}<br /><span className="text-gradient-gold">{f.h2Line2}</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-mist-400">{f.desc}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SCROLL_REVEAL_VIEWPORT}
          variants={staggerContainer(0.07)}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {f.items.map((item, i) => {
            const Icon = ICONS[i];
            const c = COLORS[i];
            return (
              <motion.div
                key={item.titulo}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group relative rounded-2xl border ${c.border} bg-ink-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-ink-800/60`}
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} border ${c.border}`}>
                  <Icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <h3 className="font-display text-base font-semibold text-white mb-2 group-hover:text-gold-200 transition-colors">{item.titulo}</h3>
                <p className="text-sm text-mist-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
