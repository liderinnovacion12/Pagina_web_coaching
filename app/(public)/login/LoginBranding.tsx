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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,169,78,0.08),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(217,169,78,0.05),transparent_50%)]"
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
          Team 100% Real Estate es la plataforma de coaching ejecutivo para líderes que
          buscan resultados medibles, con acompañamiento real en cada etapa
          del camino.
        </p>
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
