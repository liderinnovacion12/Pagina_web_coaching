"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

type Estadistica = { valor: string; etiqueta: string };

export function HeroContent({
  estadisticas,
}: {
  estadisticas: Estadistica[];
}) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08, 0.1)}
      className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20"
    >
      <motion.span
        variants={fadeUp}
        className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-gold-300"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
        Coaching Executive Platform
      </motion.span>

      <motion.h1
        variants={fadeUp}
        className="mt-8 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl"
      >
        Transforma tu
        <br />
        <span className="text-gradient-gold">Liderazgo</span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="mt-6 max-w-xl text-balance text-lg text-mist-400"
      >
        Plataforma de coaching ejecutivo para líderes que buscan impacto
        real. Aprende de los mejores, donde estés.
      </motion.p>

      <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/registro"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-gold-500 px-7 font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            Comenzar ahora
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="#cursos"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-gold-500/50 px-7 font-semibold text-gold-300 transition hover:bg-gold-500/10"
          >
            Ver metodología
          </Link>
        </motion.div>
      </motion.div>

      <motion.dl
        variants={fadeUp}
        className="mt-16 grid gap-10 text-left sm:grid-cols-3 sm:gap-16"
      >
        {estadisticas.map((stat) => (
          <div key={stat.etiqueta}>
            <dt className="sr-only">{stat.etiqueta}</dt>
            <dd className="font-mono text-3xl font-semibold text-gold-400">
              {stat.valor}
            </dd>
            <p className="mt-1 text-sm text-mist-500">{stat.etiqueta}</p>
          </div>
        ))}
      </motion.dl>
    </motion.section>
  );
}
