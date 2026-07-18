"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { SCROLL_REVEAL_VIEWPORT } from "@/lib/motion";

export function ScrollReveal({
  variants,
  className,
  children,
}: {
  variants: Variants;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, SCROLL_REVEAL_VIEWPORT);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
