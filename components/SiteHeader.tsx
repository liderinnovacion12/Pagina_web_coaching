"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const paddingY = useTransform(scrollY, [0, 80], [32, 14]);
  const backgroundAlpha = useTransform(scrollY, [0, 80], [0, 0.72]);
  const borderAlpha = useTransform(scrollY, [0, 80], [0, 0.08]);
  const backgroundColor = useMotionTemplate`rgba(7, 7, 11, ${backgroundAlpha})`;
  const borderColor = useMotionTemplate`rgba(255, 255, 255, ${borderAlpha})`;

  return (
    <motion.header
      data-testid="site-header"
      style={{
        paddingTop: paddingY,
        paddingBottom: paddingY,
        backgroundColor,
        borderColor,
      }}
      className="sticky top-0 z-20 border-b border-transparent backdrop-blur-xl"
    >
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-white"
        >
          TEAM 100%<span className="text-gold-400"> REAL ESTATE</span>
          <span className="text-gold-400"> •</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-mist-300">
            <span className="text-white">ES</span>
            <span className="text-mist-500">|</span>
            <span>EN</span>
          </div>
          <Link
            href="/login"
            className="rounded-full border border-gold-500/60 px-4 py-1.5 text-sm font-medium text-gold-300 transition hover:bg-gold-500/10"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
