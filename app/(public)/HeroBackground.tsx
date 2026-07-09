"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -30]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -60]);
  const frontY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -110]);

  const backTransform = useMotionTemplate`translate3d(0px, ${backY}px, 0px)`;
  const midTransform = useMotionTemplate`translate3d(0px, ${midY}px, 0px)`;
  const frontTransform = useMotionTemplate`translate3d(0px, ${frontY}px, 0px)`;

  return (
    <div
      ref={containerRef}
      data-testid="hero-background"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
    >
      <svg
        aria-hidden="true"
        className="h-full w-full"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="hero-vortex-glow" cx="0.58" cy="0.5" r="0.82">
            <stop offset="0%" stopColor="rgb(217,167,74)" stopOpacity="0.24" />
            <stop offset="28%" stopColor="rgb(217,167,74)" stopOpacity="0.12" />
            <stop offset="52%" stopColor="rgb(255,255,255)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="rgb(15,15,14)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1400" height="900" fill="url(#hero-vortex-glow)" />

        <motion.g data-testid="hero-layer-back" style={{ transform: backTransform }}>
          <circle cx="940" cy="470" r="290" fill="rgba(217,167,74,0.04)" />
          <circle cx="920" cy="458" r="190" fill="rgba(255,255,255,0.03)" />
        </motion.g>

        <motion.g data-testid="hero-layer-mid" style={{ transform: midTransform }}>
          <circle cx="930" cy="462" r="110" fill="rgba(217,167,74,0.09)" />
          <circle cx="900" cy="442" r="68" fill="rgba(255,255,255,0.08)" />
        </motion.g>

        <motion.g data-testid="hero-layer-front" style={{ transform: frontTransform }}>
          <circle cx="902" cy="466" r="18" fill="rgba(255,255,255,0.9)" />
          <circle cx="902" cy="466" r="42" fill="rgba(217,167,74,0.1)" />
        </motion.g>
      </svg>
    </div>
  );
}
