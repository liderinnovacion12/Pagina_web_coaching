"use client";

import { motion } from "framer-motion";
import { HeroBackground } from "@/app/(public)/HeroBackground";
import { ParticleField } from "@/components/motion/ParticleField";
import { CursorGlow } from "@/components/motion/CursorGlow";

export function LoginBranding() {
  return (
    <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-16">
      <HeroBackground />
      <ParticleField />
      <CursorGlow />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,169,78,0.11),transparent_48%),radial-gradient(circle_at_80%_75%,rgba(140,150,175,0.08),transparent_42%),linear-gradient(180deg,rgba(5,7,12,0.08),rgba(5,7,12,0.42))]"
      />

      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 font-display text-lg font-bold tracking-tight text-white"
      >
        TEAM 100%<span className="text-gold-400"> REAL ESTATE</span>
        <span className="text-gold-400"> •</span>
      </motion.span>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-md"
      >
        <h2 className="font-display text-[42px] font-bold leading-[1.1] text-white">
          El liderazgo se construye,
          <br />
          no se improvisa.
        </h2>
        <p className="mt-6 text-lg text-mist-400">
          Team 100% Real Estate es una plataforma de coaching ejecutivo para
          lideres que buscan resultados medibles, con acompanamiento real en
          cada etapa del camino.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-12 max-w-[440px] rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-mist-500">
              vortex preview
            </p>
            <p className="mt-2 text-sm text-mist-300">
              La animacion gira, respira y responde al cursor sin perder el
              centro.
            </p>
          </div>
          <div className="h-11 w-11 rounded-full border border-gold-400/30 bg-gold-400/10 shadow-[0_0_32px_rgba(217,169,78,0.25)]" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-mist-500">
              depth
            </p>
            <p className="mt-2 text-base font-semibold text-white">3 layers</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-mist-500">
              motion
            </p>
            <p className="mt-2 text-base font-semibold text-white">orbital</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-mist-500">
              response
            </p>
            <p className="mt-2 text-base font-semibold text-white">magnetic</p>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 font-mono text-xs uppercase tracking-wider text-mist-500"
      >
        Coaching Executive Platform
      </motion.p>
    </div>
  );
}
