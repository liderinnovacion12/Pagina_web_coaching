"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, animate } from "framer-motion";
import { blurFadeUp, fadeUp, staggerContainer, useReducedMotionSafe } from "@/lib/motion";

type Estadistica = { valor: string; etiqueta: string };

// Componente contador animado para un look técnico y pulido
function AnimatedCounter({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
      return value;
    }
    return "0";
  });
  const reducedMotion = useReducedMotionSafe();

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    // Extraemos los dígitos numéricos
    const numericPart = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericPart)) {
      setDisplayValue(value);
      return;
    }

    // Extraemos cualquier sufijo (+, %, etc) y caracteres especiales
    const suffix = value.replace(/[0-9,]/g, "");
    const hasCommas = value.includes(",");

    const controls = animate(0, numericPart, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1], // Easeout premium
      onUpdate(latest) {
        const rounded = Math.floor(latest);
        const formatted = hasCommas
          ? rounded.toLocaleString("en-US")
          : rounded.toString();
        setDisplayValue(`${formatted}${suffix}`);
      },
    });

    return () => controls.stop();
  }, [value, reducedMotion]);

  return <>{displayValue}</>;
}

export function HeroContent({
  estadisticas,
}: {
  estadisticas: Estadistica[];
}) {
  const reducedMotion = useReducedMotionSafe();
  const animVariant = reducedMotion ? fadeUp : blurFadeUp;

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08, 0.1)}
      className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20"
    >
      <motion.span
        variants={animVariant}
        className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/5 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-gold-300 backdrop-blur-md"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
        Coaching Executive Platform
      </motion.span>

      <motion.h1
        variants={animVariant}
        className="mt-8 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl"
      >
        Transforma tu
        <br />
        <span className="text-gradient-gold">Liderazgo</span>
      </motion.h1>

      <motion.p
        variants={animVariant}
        className="mt-6 max-w-xl text-balance text-lg text-mist-400"
      >
        Plataforma de coaching ejecutivo para líderes que buscan impacto
        real. Aprende de los mejores, donde estés.
      </motion.p>

      <motion.div variants={animVariant} className="mt-10 flex flex-col gap-4 sm:flex-row">
        {/* Botón Principal - Brillo Shimmer al Hover */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/registro"
            className="group relative overflow-hidden inline-flex h-12 items-center justify-center rounded-lg bg-gold-500 px-7 font-semibold text-ink-950 shadow-[0_0_24px_rgba(217,169,78,0.18)] transition-all duration-300 hover:bg-gold-400 hover:shadow-[0_0_32px_rgba(217,169,78,0.32)]"
          >
            <span className="relative z-10">Comenzar ahora</span>
            <span className="absolute inset-0 z-0 w-[200%] translate-x-[-100%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
          </Link>
        </motion.div>

        {/* Botón Secundario */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="#cursos"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-gold-500/40 px-7 font-semibold text-gold-300 transition-all duration-300 hover:border-gold-400 hover:bg-gold-500/5 hover:text-white"
          >
            Ver metodología
          </Link>
        </motion.div>
      </motion.div>

      {/* Grid de Estadísticas con Contadores */}
      <motion.dl
        variants={animVariant}
        className="mt-16 grid gap-10 text-left sm:grid-cols-3 sm:gap-16"
      >
        {estadisticas.map((stat) => (
          <div key={stat.etiqueta}>
            <dt className="sr-only">{stat.etiqueta}</dt>
            <dd className="font-mono text-3xl font-semibold text-gold-400">
              <AnimatedCounter value={stat.valor} />
            </dd>
            <p className="mt-1 text-sm text-mist-500">{stat.etiqueta}</p>
          </div>
        ))}
      </motion.dl>
    </motion.section>
  );
}
