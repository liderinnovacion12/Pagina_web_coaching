"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";

const GLOW_SIZE = 480;

export function CursorGlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();
  const [finePointer, setFinePointer] = useState(false);

  const mouseX = useMotionValue(-GLOW_SIZE);
  const mouseY = useMotionValue(-GLOW_SIZE);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20, mass: 0.5 });
  const transform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0)`;

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFinePointer(query.matches);

    function handleChange(event: MediaQueryListEvent) {
      setFinePointer(event.matches);
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    mouseX.set(event.clientX - bounds.left - GLOW_SIZE / 2);
    mouseY.set(event.clientY - bounds.top - GLOW_SIZE / 2);
  }

  if (reducedMotion || !finePointer) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      data-testid="cursor-glow-layer"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        aria-hidden="true"
        style={{ width: GLOW_SIZE, height: GLOW_SIZE, transform }}
        className="absolute rounded-full bg-gold-400/10 blur-[100px]"
      />
    </div>
  );
}
