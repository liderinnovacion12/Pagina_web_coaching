"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { SCROLL_REVEAL_VIEWPORT, useReducedMotionSafe } from "@/lib/motion";

export function ScrollReveal({
  variants,
  className,
  children,
  once = true,
}: {
  variants: Variants;
  className?: string;
  children?: ReactNode;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();
  const inViewResult = useInView(ref, { ...SCROLL_REVEAL_VIEWPORT, once });
  const isInView = reducedMotion ? true : inViewResult;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
      inert={!isInView}
    >
      {children}
    </motion.div>
  );
}
