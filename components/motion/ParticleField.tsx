"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

const SLOT_FRACTIONS = [0.16, 0.34, 0.52, 0.7, 0.88, 1.0];
const BREATH_PERIOD = 6.5;
const BREATH_MIN = 0.42;
const ROTATION_SPEED = 0.045;
const ACCENT_RATIO = 0.12;
const ACCENT_RGB = "217,169,78"; // gold-500
const NEUTRAL_RGB = "139,147,167"; // mist-400

type Particle = {
  baseAngle: number;
  slotFraction: number;
  radiusPx: number;
  accent: boolean;
  opacityMin: number;
  opacityMax: number;
  opacityPhase: number;
  opacitySpeed: number;
  wanderAmpX: number;
  wanderAmpY: number;
  wanderFreqX: number;
  wanderFreqY: number;
  wanderPhaseX: number;
  wanderPhaseY: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rgba(rgb: string, alpha: number) {
  return `rgba(${rgb},${alpha})`;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotionSafe();

  useEffect(() => {
    if (reducedMotion) return;

    const canvasEl = canvasRef.current;
    const containerEl = canvasEl?.parentElement;
    if (!canvasEl || !containerEl) return;

    const ctx2d = canvasEl.getContext("2d");
    if (!ctx2d) return;

    // Reassigned as non-nullable so the nested closures below (resize,
    // draw, loop, event handlers) don't need repeated null checks — TS
    // doesn't propagate the narrowing above across function boundaries.
    const canvas = canvasEl;
    const container = containerEl;
    const ctx = ctx2d;

    let particles: Particle[] = [];
    let center = { x: 0, y: 0 };
    let maxRadius = 0;
    const lean = { x: 0, y: 0 };
    const mouse = { x: -9999, y: -9999 };
    let animationFrame = 0;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    function initParticles(width: number, height: number) {
      center = { x: width / 2, y: height / 2 };
      maxRadius = Math.min(width, height) * 0.46;

      const spokeCount = Math.min(36, Math.max(18, Math.round(width / 26)));
      const next: Particle[] = [];
      for (let s = 0; s < spokeCount; s++) {
        const baseAngle = (s / spokeCount) * Math.PI * 2;
        for (const slot of SLOT_FRACTIONS) {
          const frac = slot * (0.92 + Math.random() * 0.16);
          next.push({
            baseAngle: baseAngle + (Math.random() - 0.5) * 0.045,
            slotFraction: frac,
            radiusPx: 0.6 + frac * 1.7,
            accent: Math.random() < ACCENT_RATIO,
            opacityMin: 0.16,
            opacityMax: 0.3 + Math.random() * 0.5,
            opacityPhase: Math.random() * Math.PI * 2,
            opacitySpeed: 0.5 + Math.random() * 0.6,
            wanderAmpX: 6 + Math.random() * 16,
            wanderAmpY: 6 + Math.random() * 16,
            wanderFreqX: 0.12 + Math.random() * 0.35,
            wanderFreqY: 0.12 + Math.random() * 0.35,
            wanderPhaseX: Math.random() * Math.PI * 2,
            wanderPhaseY: Math.random() * Math.PI * 2,
          });
        }
      }
      particles = next;
    }

    function resize() {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(rect.width, rect.height);
    }

    function draw(elapsedMs: number) {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const seconds = elapsedMs / 1000;
      ctx.clearRect(0, 0, width, height);

      // shared breathing phase: a plain sine has zero velocity at both the
      // fully-contracted and fully-expanded extremes and peaks mid-cycle —
      // "slow near the center, accelerates outward, eases to a stop at the
      // edge before reversing" comes for free from this shape.
      const omega = (Math.PI * 2) / BREATH_PERIOD;
      const raw = (Math.sin(seconds * omega - Math.PI / 2) + 1) / 2;
      const radiusFraction = BREATH_MIN + (1 - BREATH_MIN) * raw;
      const breathVelocity =
        (omega * Math.cos(seconds * omega - Math.PI / 2)) / 2;
      const breathGlow = 0.7 + 0.3 * raw;
      const globalAngle = seconds * ROTATION_SPEED;

      let nx = 0;
      let ny = 0;
      if (mouse.x > -9000) {
        nx = clamp((mouse.x - width / 2) / (width / 2), -1, 1);
        ny = clamp((mouse.y - height / 2) / (height / 2), -1, 1);
      }
      lean.x += (nx * 40 - lean.x) * 0.06;
      lean.y += (ny * 24 - lean.y) * 0.06;
      const squashX = 1 - Math.abs(nx) * 0.12;
      const cx = center.x + lean.x;
      const cy = center.y + lean.y;

      for (const p of particles) {
        const theta = p.baseAngle + globalAngle;
        const currentR = maxRadius * radiusFraction * p.slotFraction;
        const wanderX =
          p.wanderAmpX * Math.sin(seconds * p.wanderFreqX + p.wanderPhaseX);
        const wanderY =
          p.wanderAmpY * Math.sin(seconds * p.wanderFreqY + p.wanderPhaseY);
        const x = cx + Math.cos(theta) * currentR * squashX + wanderX;
        const y = cy + Math.sin(theta) * currentR + wanderY;

        const perspective = 0.4 + p.slotFraction * 0.9;
        const wave =
          (Math.sin(seconds * p.opacitySpeed + p.opacityPhase) + 1) / 2;
        const opacity =
          (p.opacityMin + wave * (p.opacityMax - p.opacityMin)) * breathGlow;
        const color = p.accent ? ACCENT_RGB : NEUTRAL_RGB;

        const speedAtSlot =
          Math.abs(breathVelocity) * (1 - BREATH_MIN) * maxRadius * p.slotFraction;
        const dirSign = breathVelocity >= 0 ? 1 : -1;
        const ux = Math.cos(theta) * dirSign;
        const uy = Math.sin(theta) * dirSign;
        const tailLen = p.radiusPx * perspective * 2.2 + speedAtSlot * 0.5;
        const tailX = x - ux * tailLen;
        const tailY = y - uy * tailLen;

        const trail = ctx.createLinearGradient(tailX, tailY, x, y);
        trail.addColorStop(0, rgba(color, 0));
        trail.addColorStop(1, rgba(color, opacity));
        ctx.strokeStyle = trail;
        ctx.lineWidth = Math.max(0.8, p.radiusPx * perspective * 1.3);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = rgba(color, Math.min(1, opacity * 1.5));
        ctx.beginPath();
        ctx.arc(x, y, p.radiusPx * perspective * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(timestamp: number) {
      draw(timestamp);
      animationFrame = requestAnimationFrame(loop);
    }

    function stopLoop() {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    function startLoop() {
      if (animationFrame !== 0) return;
      animationFrame = requestAnimationFrame(loop);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }

    function handlePointerLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    // Pause the rAF loop entirely (not just the draw call) while the field
    // is scrolled out of view, instead of paying for canvas work off-screen.
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) startLoop();
        else stopLoop();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // Unlike CursorGlow.tsx (which sets `pointer-events-none` on the same
    // element it listens to — CSS excludes that element from hit-testing,
    // so its onPointerMove handler can never fire), this canvas keeps the
    // default `pointer-events: auto`. Sibling content that should stay
    // clickable (headline, CTAs) is rendered after it with `relative z-10`,
    // so it still intercepts its own clicks via normal stacking order while
    // the canvas receives pointer moves everywhere else.
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      data-testid="particle-field-canvas"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
