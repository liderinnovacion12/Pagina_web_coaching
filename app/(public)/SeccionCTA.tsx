"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SCROLL_REVEAL_VIEWPORT } from "@/lib/motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SeccionCTA() {
  const { tr } = useLanguage();
  const c = tr.cta;

  return (
    <section className="relative isolate px-6 py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={SCROLL_REVEAL_VIEWPORT}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-gold-500/20 p-10 text-center sm:p-16"
          style={{ background: "linear-gradient(135deg, rgba(27,27,43,0.9) 0%, rgba(40,40,64,0.9) 50%, rgba(27,27,43,0.9) 100%)" }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(0,201,87,0.12), transparent)" }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle, rgba(0,201,87,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />

          <span className="inline-block font-mono text-xs uppercase tracking-widest text-gold-400 mb-6">{c.eyebrow}</span>
          <h2 className="font-display text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl mb-6">
            {c.h2Line1}<br /><span className="text-gradient-gold">{c.h2Line2}</span>
          </h2>
          <p className="max-w-lg mx-auto text-mist-400 text-lg mb-10">{c.desc}</p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/registro"
                className="group relative overflow-hidden inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gold-500 px-10 text-base font-semibold text-ink-950 shadow-[0_0_40px_rgba(0,201,87,0.3)] transition-all duration-300 hover:bg-gold-400 hover:shadow-[0_0_60px_rgba(0,201,87,0.45)]"
              >
                <span className="relative z-10">{c.btn}</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span className="absolute inset-0 z-0 w-[200%] translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
              </Link>
            </motion.div>
            <Link href="/login" className="font-mono text-sm text-mist-400 transition-colors hover:text-gold-300">
              {c.loginLink}
            </Link>
          </div>
          <p className="mt-6 font-mono text-xs text-mist-500">{c.fine}</p>
        </motion.div>
      </div>
    </section>
  );
}
