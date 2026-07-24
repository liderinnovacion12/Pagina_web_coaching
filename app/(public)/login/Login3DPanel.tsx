"use client";

import { motion } from "framer-motion";
import { LogoNCS } from "@/components/ui/LogoNCS";

type CardConfig = {
  top: string;
  size: number;
  delay: number;
  rotate: number;
  side: "left" | "right";
  offset: string;
};

const CARDS: CardConfig[] = [
  { top: "7%",  size: 88,  delay: 0,   rotate: 12,  side: "left",  offset: "8%" },
  { top: "12%", size: 52,  delay: 1.3, rotate: -7,  side: "right", offset: "10%" },
  { top: "62%", size: 72,  delay: 0.6, rotate: -10, side: "left",  offset: "5%" },
  { top: "70%", size: 48,  delay: 2.0, rotate: 8,   side: "right", offset: "7%" },
  { top: "38%", size: 44,  delay: 1.7, rotate: 15,  side: "left",  offset: "4%" },
  { top: "28%", size: 60,  delay: 0.3, rotate: -12, side: "right", offset: "6%" },
  { top: "82%", size: 36,  delay: 2.4, rotate: 6,   side: "right", offset: "14%" },
];

export function Login3DPanel() {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-ink-950">

      {/* Glow ambiental central */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 52%, rgb(var(--gold-500) / 0.14) 0%, transparent 68%)",
        }}
      />

      {/* Grid perspectiva — piso */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{ height: "52%", perspective: "420px", perspectiveOrigin: "50% 0%" }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: [
              "repeating-linear-gradient(90deg, rgb(var(--gold-500) / 0.2) 0px, transparent 1px, transparent 59px, rgb(var(--gold-500) / 0.2) 60px)",
              "repeating-linear-gradient(0deg,  rgb(var(--gold-500) / 0.2) 0px, transparent 1px, transparent 59px, rgb(var(--gold-500) / 0.2) 60px)",
            ].join(","),
            transform: "rotateX(68deg)",
            transformOrigin: "top center",
          }}
        />
      </div>

      {/* Grid perspectiva — techo */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 pointer-events-none"
        style={{ height: "28%", perspective: "380px", perspectiveOrigin: "50% 100%" }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: [
              "repeating-linear-gradient(90deg, rgb(var(--gold-500) / 0.1) 0px, transparent 1px, transparent 59px, rgb(var(--gold-500) / 0.1) 60px)",
              "repeating-linear-gradient(0deg,  rgb(var(--gold-500) / 0.1) 0px, transparent 1px, transparent 59px, rgb(var(--gold-500) / 0.1) 60px)",
            ].join(","),
            transform: "rotateX(-68deg)",
            transformOrigin: "bottom center",
          }}
        />
      </div>

      {/* Fade top / bottom para suavizar el grid */}
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgb(var(--ink-950)), transparent)" }} />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgb(var(--ink-950)), transparent)" }} />

      {/* Tarjetas flotantes 3D */}
      {CARDS.map((card, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          animate={{ y: [-(card.size * 0.09), card.size * 0.09, -(card.size * 0.09)] }}
          transition={{ duration: 5 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: card.delay }}
          className="absolute rounded-2xl backdrop-blur-sm"
          style={{
            top: card.top,
            [card.side]: card.offset,
            width: card.size,
            height: card.size,
            transform: `rotate(${card.rotate}deg)`,
            background: "rgb(var(--ink-900) / 0.55)",
            border: "1px solid rgb(var(--gold-500) / 0.22)",
            boxShadow: "0 8px 32px rgb(var(--gold-500) / 0.07), inset 0 0 16px rgb(var(--gold-500) / 0.04)",
          }}
        />
      ))}

      {/* Logo + texto central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.72, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Glow del logo */}
          <div
            aria-hidden="true"
            className="absolute inset-[-22%] rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgb(var(--gold-500) / 0.32) 0%, transparent 68%)" }}
          />
          <LogoNCS height={200} className="relative z-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="mt-6 text-center space-y-2"
        >
          <p className="font-display text-xl font-extrabold tracking-tight text-white">
            NCS <span className="text-gold-400">Realty Hub</span>
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-mist-400">
            La plataforma #1 en Real Estate
          </p>
        </motion.div>
      </div>
    </div>
  );
}
