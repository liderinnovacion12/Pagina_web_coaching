"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Efectos de paralaje en el eje Y
  const backY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -35]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -65]);
  const frontY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -115]);

  return (
    <div
      ref={containerRef}
      data-testid="hero-background"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
    >
      <svg
        aria-hidden="true"
        className="h-full w-full opacity-65 md:opacity-100"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Brillo de fondo con un tono dorado cálido y profundo */}
          <radialGradient id="hero-vortex-glow" cx="0.58" cy="0.5" r="0.82">
            <stop offset="0%" stopColor="rgb(217,167,74)" stopOpacity="0.22" />
            <stop offset="30%" stopColor="rgb(217,167,74)" stopOpacity="0.10" />
            <stop offset="55%" stopColor="rgb(255,255,255)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="rgb(15,15,14)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1400" height="900" fill="url(#hero-vortex-glow)" />

        {/* EJE CENTRAL DE ORBITACIÓN (900, 450) */}

        {/* Capa Trasera (Paralaje lento + rotación en sentido horario) */}
        <motion.g data-testid="hero-layer-back" style={{ y: backY }}>
          <motion.g
            animate={reducedMotion ? {} : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 260, ease: "linear" }}
            style={{ originX: "900px", originY: "450px" }}
          >
            {/* Anillo exterior gigante */}
            <circle
              cx="900"
              cy="450"
              r="490"
              fill="none"
              stroke="rgba(217,167,74,0.03)"
              strokeWidth="0.75"
              strokeDasharray="400, 20, 100, 20"
            />
            {/* Anillo de precisión exterior */}
            <circle
              cx="900"
              cy="450"
              r="340"
              fill="none"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="0.5"
              strokeDasharray="6, 18"
            />
            {/* Puntos de constelación */}
            <circle cx="560" cy="450" r="1.5" fill="rgba(217,167,74,0.15)" />
            <circle cx="1240" cy="450" r="1.5" fill="rgba(217,167,74,0.15)" />
          </motion.g>
        </motion.g>

        {/* Capa Media (Paralaje medio + rotación en sentido antihorario) */}
        <motion.g data-testid="hero-layer-mid" style={{ y: midY }}>
          <motion.g
            animate={reducedMotion ? {} : { rotate: -360 }}
            transition={{ repeat: Infinity, duration: 180, ease: "linear" }}
            style={{ originX: "900px", originY: "450px" }}
          >
            {/* Anillo medio con patrón de comandos / guiones */}
            <circle
              cx="900"
              cy="450"
              r="240"
              fill="none"
              stroke="rgba(217,167,74,0.06)"
              strokeWidth="0.75"
              strokeDasharray="180, 12, 30, 12"
            />
            {/* Segundo anillo concéntrico fino */}
            <circle
              cx="900"
              cy="450"
              r="170"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
              strokeDasharray="2, 6"
            />
            {/* Nodos de control */}
            <circle cx="900" cy="210" r="2.5" fill="rgba(217,167,74,0.3)" />
            <circle cx="900" cy="690" r="2.5" fill="rgba(217,167,74,0.3)" />
          </motion.g>
        </motion.g>

        {/* Capa Frontal (Paralaje rápido + rotación rápida en sentido horario) */}
        <motion.g data-testid="hero-layer-front" style={{ y: frontY }}>
          <motion.g
            animate={reducedMotion ? {} : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 110, ease: "linear" }}
            style={{ originX: "900px", originY: "450px" }}
          >
            {/* Anillo de núcleo pequeño */}
            <circle
              cx="900"
              cy="450"
              r="85"
              fill="none"
              stroke="rgba(217,167,74,0.12)"
              strokeWidth="1"
              strokeDasharray="80, 8, 12, 8"
            />
            {/* Retícula de escaneo interna */}
            <line
              x1="900"
              y1="340"
              x2="900"
              y2="360"
              stroke="rgba(217,167,74,0.25)"
              strokeWidth="0.75"
            />
            <line
              x1="900"
              y1="540"
              x2="900"
              y2="560"
              stroke="rgba(217,167,74,0.25)"
              strokeWidth="0.75"
            />
            <line
              x1="790"
              y1="450"
              x2="810"
              y2="450"
              stroke="rgba(217,167,74,0.25)"
              strokeWidth="0.75"
            />
            <line
              x1="990"
              y1="450"
              x2="1010"
              y2="450"
              stroke="rgba(217,167,74,0.25)"
              strokeWidth="0.75"
            />
          </motion.g>

          {/* Centro absoluto (Punto focal brillante) */}
          <circle cx="900" cy="450" r="2.5" fill="rgba(255,255,255,0.85)" />
          <circle
            cx="900"
            cy="450"
            r="8"
            fill="none"
            stroke="rgba(217,167,74,0.4)"
            strokeWidth="0.5"
          />
        </motion.g>
      </svg>
    </div>
  );
}
