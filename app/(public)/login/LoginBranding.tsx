"use client";

import { motion } from "framer-motion";

export function LoginBranding() {
  return (
    <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,169,78,0.08),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(217,169,78,0.05),transparent_50%)]"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 800 1200"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <path d="M-100 1100 L900 -100" className="text-mist-500/10" />
          <path d="M-100 1300 L700 -150" className="text-gold-500/25" />
          <path d="M100 1350 L900 200" className="text-mist-500/10" />
        </g>
        <circle cx="180" cy="220" r="3" className="fill-gold-400/70" />
        <circle cx="620" cy="480" r="2" className="fill-gold-400/50" />
        <circle cx="90" cy="820" r="2.5" className="fill-mist-400/40" />
        <circle cx="700" cy="960" r="3" className="fill-gold-400/60" />
      </svg>

      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 font-display text-lg font-bold tracking-tight text-white"
      >
        COACH<span className="text-gold-400">PRO</span>
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
          CoachPro es la plataforma de coaching ejecutivo para líderes que
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
