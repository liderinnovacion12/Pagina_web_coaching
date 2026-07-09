"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const ORBIT_COUNT = 3;
const PARTICLE_COUNT_MIN = 220;
const PARTICLE_COUNT_MAX = 360;
const BREATH_PERIOD = 7.2;
const BREATH_MIN = 0.38;
const BASE_SWIRL_SPEED = 0.18;
const CAMERA_DISTANCE = 860;
const CURSOR_TILT_X = 0.52;
const CURSOR_TILT_Y = 0.72;
const CURSOR_SHIFT_X = 0.06;
const CURSOR_SHIFT_Y = 0.04;
const TRAIL_SAMPLE_SECONDS = 0.06;
const GOLD_RGB = "217,169,78";
const MIST_RGB = "220,228,240";
const DEEP_RGB = "90,102,128";
const ACCENT_RATIO = 0.14;

type Particle = {
  azimuth: number;
  latitude: number;
  shell: number;
  phase: number;
  orbitSpeed: number;
  liftSpeed: number;
  twist: number;
  size: number;
  accent: boolean;
  trail: number;
  driftX: number;
  driftY: number;
};

type Projection = {
  x: number;
  y: number;
  z: number;
  radius: number;
  lineWidth: number;
  alpha: number;
  color: string;
  accent: boolean;
  shell: number;
  halo: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rgba(rgb: string, alpha: number) {
  return `rgba(${rgb},${alpha})`;
}

function projectParticle(
  particle: Particle,
  seconds: number,
  cx: number,
  cy: number,
  maxRadius: number,
  breath: number,
  tiltX: number,
  tiltY: number
): Projection {
  const orbitPhase = seconds * (BASE_SWIRL_SPEED + particle.orbitSpeed);
  const shellRadius = maxRadius * (0.24 + particle.shell * 0.76) * breath;
  const tubeRadius = maxRadius * (0.08 + particle.shell * 0.22);
  const spiral = particle.azimuth + orbitPhase + particle.twist * 0.28;
  const latitudeWave = Math.sin(
    seconds * particle.liftSpeed + particle.phase + particle.latitude
  );
  const depthWave = Math.cos(
    seconds * (0.24 + particle.liftSpeed * 0.35) + particle.phase
  );

  let x = Math.cos(spiral) * shellRadius;
  let y =
    Math.sin(particle.latitude + seconds * particle.liftSpeed * 0.75) *
      tubeRadius *
      1.15 +
    latitudeWave * tubeRadius * 0.42;
  let z = Math.sin(spiral * 1.12) * shellRadius * 0.66 + depthWave * tubeRadius * 0.5;

  const armWarp = Math.sin(spiral * 2.55 + particle.phase * 0.7);
  const armOffset = armWarp * maxRadius * (0.04 + particle.shell * 0.12);
  x += Math.cos(spiral + Math.PI / 2) * armOffset;
  y += Math.sin(spiral + Math.PI / 2) * armOffset * 0.5;

  const pinch = 1 - Math.abs(Math.sin(particle.latitude)) * 0.3;
  x *= pinch;
  z *= 0.7 + particle.shell * 0.35;

  const cosY = Math.cos(tiltY);
  const sinY = Math.sin(tiltY);
  const x1 = x * cosY - z * sinY;
  let z1 = x * sinY + z * cosY;

  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const y1 = y * cosX - z1 * sinX;
  z1 = y * sinX + z1 * cosX;

  const perspective = CAMERA_DISTANCE / (CAMERA_DISTANCE - z1);
  const scale = perspective * (0.72 + particle.shell * 0.45);

  return {
    x: cx + x1 * perspective + particle.driftX * particle.shell * 1.25,
    y: cy + y1 * perspective + particle.driftY * particle.shell * 1.25,
    z: z1,
    radius: Math.max(0.5, particle.size * scale * 1.2),
    lineWidth: Math.max(0.75, particle.size * scale * 0.68),
    alpha: clamp(0.14 + particle.shell * 0.68, 0.12, 0.9),
    color: particle.accent ? GOLD_RGB : MIST_RGB,
    accent: particle.accent,
    shell: particle.shell,
    halo: 0.12 + particle.shell * 0.18,
  };
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

    // Reassigned as non-nullable so the nested closures below can stay
    // simple and avoid repeating null checks on every frame.
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
      center = {
        x: width * 0.585,
        y: height * 0.5,
      };
      maxRadius = Math.min(width, height) * 0.44;

      const particleCount = clamp(
        Math.round((width * height) / 4200),
        PARTICLE_COUNT_MIN,
        PARTICLE_COUNT_MAX
      );
      const next: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        const shell = Math.pow(Math.random(), 0.58);
        next.push({
          azimuth: i * GOLDEN_ANGLE + (Math.random() - 0.5) * 0.7,
          latitude:
            (Math.random() - 0.5) * Math.PI * (0.88 - shell * 0.22),
          shell,
          phase: Math.random() * Math.PI * 2,
          orbitSpeed: 0.08 + shell * 0.34 + Math.random() * 0.08,
          liftSpeed: 0.16 + Math.random() * 0.24,
          twist: Math.random() * 3.2 + shell * 2.1,
          size: 0.55 + (1 - shell) * 1.8,
          accent: Math.random() < ACCENT_RATIO,
          trail: 0.65 + shell * 1.85,
          driftX: (Math.random() - 0.5) * 28,
          driftY: (Math.random() - 0.5) * 28,
        });
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

    function drawOrbitRings(
      cx: number,
      cy: number,
      breath: number,
      tiltX: number,
      tiltY: number
    ) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = rgba(DEEP_RGB, 0.12);
      ctx.lineWidth = 1;

      for (let i = 0; i < ORBIT_COUNT; i++) {
        const band = i / Math.max(1, ORBIT_COUNT - 1);
        const ringRadiusX = maxRadius * (0.22 + band * 0.38) * breath;
        const ringRadiusY = maxRadius * (0.08 + band * 0.14) * (0.9 + breath * 0.12);
        const rotation = tiltY * 0.45 + band * 0.85 + tiltX * 0.18;

        ctx.beginPath();
        ctx.ellipse(cx, cy, ringRadiusX, ringRadiusY, rotation, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawCoreGlow(cx: number, cy: number, breath: number) {
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 1.35);
      core.addColorStop(0, rgba(GOLD_RGB, 0.18 + breath * 0.08));
      core.addColorStop(0.18, rgba(GOLD_RGB, 0.08));
      core.addColorStop(0.48, rgba(MIST_RGB, 0.04));
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }

    function draw(elapsedMs: number) {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const seconds = elapsedMs / 1000;

      const breathPhase = seconds * ((Math.PI * 2) / BREATH_PERIOD) - Math.PI / 2;
      const breath = BREATH_MIN + (1 - BREATH_MIN) * ((Math.sin(breathPhase) + 1) / 2);
      const breathVelocity = Math.cos(breathPhase);
      const backgroundPulse = 0.55 + 0.45 * ((Math.sin(seconds * 0.72) + 1) / 2);

      let targetX = 0;
      let targetY = 0;
      if (mouse.x > -9000) {
        targetX = clamp((mouse.x - width / 2) / (width / 2), -1, 1);
        targetY = clamp((mouse.y - height / 2) / (height / 2), -1, 1);
      }

      lean.x += (targetX - lean.x) * 0.08;
      lean.y += (targetY - lean.y) * 0.08;

      const cx = center.x + lean.x * width * CURSOR_SHIFT_X;
      const cy = center.y + lean.y * height * CURSOR_SHIFT_Y;
      const tiltY = lean.x * CURSOR_TILT_Y + seconds * 0.07;
      const tiltX = -lean.y * CURSOR_TILT_X + Math.sin(seconds * 0.18) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // The field is built in layers: a dark wash, a moving core glow, the
      // orbital scaffold, and then the particle cluster itself.
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 2.15);
      wash.addColorStop(0, rgba(GOLD_RGB, 0.08 * backgroundPulse));
      wash.addColorStop(0.18, rgba(GOLD_RGB, 0.04));
      wash.addColorStop(0.48, rgba(MIST_RGB, 0.03));
      wash.addColorStop(1, "rgba(5,7,12,0.48)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "rgba(5,7,12,0.62)";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 1.1);
      halo.addColorStop(0, rgba(GOLD_RGB, 0.14));
      halo.addColorStop(0.36, rgba(MIST_RGB, 0.04));
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      drawCoreGlow(cx, cy, breath);
      drawOrbitRings(cx, cy, breath, tiltX, tiltY);

      const renderList = particles
        .map((particle) => {
          const current = projectParticle(
            particle,
            seconds,
            cx,
            cy,
            maxRadius,
            breath,
            tiltX,
            tiltY
          );
          const previous = projectParticle(
            particle,
            seconds - TRAIL_SAMPLE_SECONDS * particle.trail,
            cx,
            cy,
            maxRadius,
            breath,
            tiltX,
            tiltY
          );

          return { current, previous };
        })
        .sort((a, b) => a.current.z - b.current.z);

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (const item of renderList) {
        const { current, previous } = item;
        const motion = Math.hypot(current.x - previous.x, current.y - previous.y);
        const depth = clamp((current.z + maxRadius * 0.75) / (maxRadius * 1.5), 0, 1);
        const alpha = clamp(
          current.alpha * (0.46 + depth * 0.7) * (0.88 + breathVelocity * 0.08),
          0.04,
          1
        );
        const tail = ctx.createLinearGradient(
          previous.x,
          previous.y,
          current.x,
          current.y
        );
        tail.addColorStop(0, rgba(current.color, 0));
        tail.addColorStop(1, rgba(current.color, alpha));

        ctx.strokeStyle = tail;
        ctx.lineWidth = Math.max(current.lineWidth, motion * 0.1);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();

        if (current.accent) {
          ctx.fillStyle = rgba(current.color, alpha * 0.16);
          ctx.beginPath();
          ctx.arc(current.x, current.y, current.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = rgba(current.color, alpha * 1.05);
        ctx.beginPath();
        ctx.arc(current.x, current.y, current.radius, 0, Math.PI * 2);
        ctx.fill();

        if (current.shell > 0.68) {
          ctx.fillStyle = rgba(MIST_RGB, alpha * current.halo * 0.6);
          ctx.beginPath();
          ctx.arc(current.x, current.y, current.radius * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
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

    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    let pointerListenersAttached = false;

    function attachPointerListeners() {
      if (pointerListenersAttached) return;
      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("pointerleave", handlePointerLeave);
      pointerListenersAttached = true;
    }

    function detachPointerListeners() {
      if (!pointerListenersAttached) return;
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      pointerListenersAttached = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function handlePointerQueryChange(event: MediaQueryListEvent) {
      if (event.matches) attachPointerListeners();
      else detachPointerListeners();
    }

    if (pointerQuery.matches) attachPointerListeners();
    pointerQuery.addEventListener("change", handlePointerQueryChange);

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      detachPointerListeners();
      pointerQuery.removeEventListener("change", handlePointerQueryChange);
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
