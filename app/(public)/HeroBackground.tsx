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
          <radialGradient id="hero-vortex-glow" cx="0.58" cy="0.5" r="0.7">
            <stop offset="0%" stopColor="rgb(217,169,78)" stopOpacity="0.22" />
            <stop offset="35%" stopColor="rgb(217,169,78)" stopOpacity="0.08" />
            <stop offset="70%" stopColor="rgb(140,150,175)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="rgb(5,7,12)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-vortex-line" x1="0" x2="1">
            <stop offset="0%" stopColor="rgb(140,150,175)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(217,169,78)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="rgb(140,150,175)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="1400" height="900" fill="url(#hero-vortex-glow)" />

        <motion.g
          data-testid="hero-layer-back"
          style={{ transform: backTransform }}
          fill="none"
          stroke="currentColor"
        >
          <ellipse
            cx="925"
            cy="470"
            rx="380"
            ry="210"
            className="text-mist-500/12"
            strokeWidth="1"
          />
          <ellipse
            cx="925"
            cy="470"
            rx="260"
            ry="145"
            className="text-gold-500/15"
            strokeWidth="1"
          />
        </motion.g>

        <motion.g
          data-testid="hero-layer-mid"
          style={{ transform: midTransform }}
          fill="none"
          stroke="url(#hero-vortex-line)"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M560 290 C720 210, 960 230, 1060 360" />
          <path d="M540 600 C690 710, 930 700, 1080 560" />
          <path d="M610 180 C760 290, 925 330, 1120 260" />
          <path d="M640 700 C810 610, 940 560, 1100 640" />
        </motion.g>

        <motion.g data-testid="hero-layer-front" style={{ transform: frontTransform }}>
          <circle cx="900" cy="470" r="7" className="fill-gold-400/90" />
          <circle cx="735" cy="372" r="3.5" className="fill-mist-300/70" />
          <circle cx="1045" cy="540" r="3.5" className="fill-mist-300/65" />
        </motion.g>
      </svg>
    </div>
  );
}
