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

  // Progreso de scroll a lo largo de la sección hero: 0 al inicio, 1 cuando el
  // borde inferior del hero llega al top del viewport (hero completamente scrolleado).
  const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <div
      ref={heroRef}
      data-testid="hero-scroll-layer"
      className="relative overflow-hidden bg-grain"
    >
      {reducedMotion ? (
        <>
          {background}
          {particles}
          {children}
        </>
      ) : (
        <>
          <motion.div
            style={{ opacity: bgOpacity, y: bgY }}
            className="absolute inset-0"
          >
            {background}
          </motion.div>
          <motion.div
            style={{ opacity: bgOpacity }}
            className="absolute inset-0"
          >
            {particles}
          </motion.div>
          <motion.div style={{ y: contentY }}>{children}</motion.div>
        </>
      )}
    </div>
  );
}
