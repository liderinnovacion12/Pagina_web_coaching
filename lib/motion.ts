import { useReducedMotion, type Variants } from "framer-motion";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, transform: "translateY(18px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

export function staggerContainer(
  staggerChildren = 0.06,
  delayChildren = 0
): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

export const SCROLL_REVEAL_VIEWPORT = {
  once: true,
  margin: "-10% 0px",
} as const;

export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}
