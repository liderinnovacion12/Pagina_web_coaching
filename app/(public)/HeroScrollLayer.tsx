"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";

export function HeroScrollLayer({
  background,
  particles,
  children,
}: {
  background: ReactNode;
  particles: ReactNode;
  children: ReactNode;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  if (reducedMotion) {
    return (
      <div
        ref={heroRef}
        data-testid="hero-scroll-layer"
        className="relative overflow-hidden bg-grain"
      >
        {background}
        {particles}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={heroRef}
      data-testid="hero-scroll-layer"
      className="relative overflow-hidden bg-grain"
    >
      <motion.div style={{ opacity: bgOpacity, y: bgY }}>
        {background}
      </motion.div>
      <motion.div style={{ opacity: bgOpacity }}>{particles}</motion.div>
      <motion.div style={{ y: contentY }}>{children}</motion.div>
    </div>
  );
}
