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
      className="pointer-events-none absolute inset-0 h-full w-full animate-drift-slow overflow-hidden"
    >
      <svg
        aria-hidden="true"
        className="h-full w-full"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <motion.g
          data-testid="hero-layer-back"
          style={{ transform: backTransform }}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        >
          <path d="M-100 780 L1500 -80" className="text-mist-500/20" />
        </motion.g>

        <motion.g
          data-testid="hero-layer-mid"
          style={{ transform: midTransform }}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        >
          <path d="M-100 900 L1200 -100" className="text-gold-500/40" />
          <path d="M200 950 L1500 120" className="text-mist-500/15" />
        </motion.g>

        <motion.g data-testid="hero-layer-front" style={{ transform: frontTransform }}>
          <circle cx="360" cy="360" r="4" className="fill-gold-400" />
          <circle cx="90" cy="640" r="3" className="fill-mist-400/60" />
          <circle cx="1180" cy="150" r="3" className="fill-mist-400/60" />
        </motion.g>
      </svg>
    </div>
  );
}
