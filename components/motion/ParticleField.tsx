"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

const PARTICLE_COUNT_MIN = 180;
const PARTICLE_COUNT_MAX = 320;
const ACCENT_RATIO = 0.1;
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Unable to create WebGL shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "Unknown shader compile error.";
    gl.deleteShader(shader);
    throw new Error(info);
  }

  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error("Unable to create WebGL program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "Unknown program link error.";
    gl.deleteProgram(program);
    throw new Error(info);
  }

  return program;
}

function makeSeededParticles(count: number) {
  const particles = new Float32Array(count * 8);
  for (let index = 0; index < count; index += 1) {
    const shell = Math.pow(Math.random(), 0.72);
    const base = index * 8;

    particles[base + 0] = index * 2.399963229728653 + (Math.random() - 0.5) * 0.5; // angle
    particles[base + 1] = shell; // shell
    particles[base + 2] = Math.random() * Math.PI * 2; // phase
    particles[base + 3] = 0.04 + shell * 0.22 + Math.random() * 0.04; // spin
    particles[base + 4] = 0.12 + Math.random() * 0.18; // lift
    particles[base + 5] = 0.55 + (1 - shell) * 1.35; // size
    particles[base + 6] = Math.random() < ACCENT_RATIO ? 1 : 0; // accent
    particles[base + 7] = Math.random() * 2.8 + shell * 1.4; // twist
  }

  return particles;
}

const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 aCorner;
in float aAngle;
in float aShell;
in float aPhase;
in float aSpin;
in float aLift;
in float aSize;
in float aAccent;
in float aTwist;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;

out vec2 vCorner;
out float vAlpha;
out float vAccent;
out float vDepth;

vec3 rotateX(vec3 p, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
}

vec3 rotateY(vec3 p, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
}

vec3 fieldPosition(float t) {
  float breathWave = 0.5 + 0.5 * sin(t * 0.72 + aPhase);
  float breath = mix(0.46, 1.0, breathWave);
  float shellRadius = mix(0.18, 1.0, aShell) * breath;
  float swirl = aAngle + t * (0.12 + aSpin) + aTwist * 0.18;
  float lane = sin(t * aLift + aPhase * 1.6);
  float ripple = cos(t * (aLift * 0.74 + 0.05) + aPhase * 1.2);

  vec3 p = vec3(
    cos(swirl) * shellRadius,
    lane * (0.12 + aShell * 0.18) + ripple * 0.04,
    sin(swirl * 1.32 + aPhase) * shellRadius * 0.58
  );

  p.x *= 1.0 - aShell * 0.14;
  p.z *= mix(0.82, 1.14, aShell);
  p.y += sin(swirl * 2.4 + aPhase) * shellRadius * 0.045;

  return p;
}

vec2 projectToScreen(vec3 p) {
  float perspective = 1.0 / (1.82 - p.z * 0.72);
  return vec2(
    p.x * perspective * uResolution.y * 0.42,
    p.y * perspective * uResolution.y * 0.30
  );
}

void main() {
  vec3 current = fieldPosition(uTime);
  float trailTime = 0.042 + aShell * 0.028;
  vec3 previous = fieldPosition(uTime - trailTime);

  float cursorTiltX = uPointer.x * 0.62 + sin(uTime * 0.08) * 0.03;
  float cursorTiltY = -uPointer.y * 0.44;

  current = rotateY(current, cursorTiltX);
  current = rotateX(current, cursorTiltY);
  previous = rotateY(previous, cursorTiltX);
  previous = rotateX(previous, cursorTiltY);

  vec2 center = uResolution * vec2(0.585, 0.5);
  vec2 currentPixel = center + projectToScreen(current);
  vec2 previousPixel = center + projectToScreen(previous);

  currentPixel += vec2(uPointer.x * uResolution.x * 0.035, -uPointer.y * uResolution.y * 0.024);

  vec2 motion = currentPixel - previousPixel;
  float speed = length(motion);
  vec2 direction = speed > 0.0001 ? motion / speed : vec2(1.0, 0.0);
  vec2 perpendicular = vec2(-direction.y, direction.x);

  float perspective = 1.0 / (1.82 - current.z * 0.72);
  float baseSize = mix(4.0, 12.0, aShell) * aSize * perspective;
  float stretch = clamp(1.0 + speed * 0.03, 1.0, 3.6);
  vec2 local = vec2(
    aCorner.x * baseSize * stretch * 1.15,
    aCorner.y * baseSize * 0.76
  );

  vec2 finalPixel = currentPixel + direction * local.x + perpendicular * local.y;
  vec2 clip = finalPixel / uResolution * 2.0 - 1.0;

  gl_Position = vec4(clip * vec2(1.0, -1.0), current.z * 0.0001, 1.0);
  vCorner = aCorner;
  vAlpha = clamp(0.12 + aShell * 0.52 + speed * 0.02 + aAccent * 0.08, 0.08, 0.95);
  vAccent = aAccent;
  vDepth = clamp((current.z + 0.9) / 1.8, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vCorner;
in float vAlpha;
in float vAccent;
in float vDepth;

out vec4 outColor;

void main() {
  vec2 p = vec2(vCorner.x * 0.68, vCorner.y);
  float dist = length(p);
  float glow = smoothstep(1.0, 0.0, dist);
  float core = smoothstep(0.28, 0.0, dist);

  vec3 white = vec3(1.0);
  vec3 gold = vec3(0.8509804, 0.6549020, 0.2901961);
  vec3 color = mix(white, gold, vAccent);
  color *= 0.42 + core * 1.12 + vDepth * 0.14;

  float alpha = vAlpha * glow * glow;
  outColor = vec4(color, alpha);
}
`;

export function ParticleField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotionSafe();

  useEffect(() => {
    if (reducedMotion) return;

    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const container = root;
    const canvasEl = canvas;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) return;

    const glContext = gl;

    const particleCount = clamp(
      Math.round((container.clientWidth * container.clientHeight) / 3200),
      PARTICLE_COUNT_MIN,
      PARTICLE_COUNT_MAX
    );
    const particleData = makeSeededParticles(particleCount);
    const program = createProgram(glContext, VERTEX_SHADER, FRAGMENT_SHADER);
    const vao = glContext.createVertexArray();
    const particleBuffer = glContext.createBuffer();
    const cornerBuffer = glContext.createBuffer();

    if (!vao || !particleBuffer || !cornerBuffer) {
      if (vao) glContext.deleteVertexArray(vao);
      if (particleBuffer) glContext.deleteBuffer(particleBuffer);
      if (cornerBuffer) glContext.deleteBuffer(cornerBuffer);
      glContext.deleteProgram(program);
      return;
    }

    const locations = {
      aCorner: glContext.getAttribLocation(program, "aCorner"),
      aAngle: glContext.getAttribLocation(program, "aAngle"),
      aShell: glContext.getAttribLocation(program, "aShell"),
      aPhase: glContext.getAttribLocation(program, "aPhase"),
      aSpin: glContext.getAttribLocation(program, "aSpin"),
      aLift: glContext.getAttribLocation(program, "aLift"),
      aSize: glContext.getAttribLocation(program, "aSize"),
      aAccent: glContext.getAttribLocation(program, "aAccent"),
      aTwist: glContext.getAttribLocation(program, "aTwist"),
    };
    const uniforms = {
      uTime: glContext.getUniformLocation(program, "uTime"),
      uResolution: glContext.getUniformLocation(program, "uResolution"),
      uPointer: glContext.getUniformLocation(program, "uPointer"),
    };

    const corners = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ]);

    glContext.bindVertexArray(vao);

    glContext.bindBuffer(glContext.ARRAY_BUFFER, cornerBuffer);
    glContext.bufferData(glContext.ARRAY_BUFFER, corners, glContext.STATIC_DRAW);
    if (locations.aCorner >= 0) {
      glContext.enableVertexAttribArray(locations.aCorner);
      glContext.vertexAttribPointer(locations.aCorner, 2, glContext.FLOAT, false, 0, 0);
    }

    glContext.bindBuffer(glContext.ARRAY_BUFFER, particleBuffer);
    glContext.bufferData(glContext.ARRAY_BUFFER, particleData, glContext.STATIC_DRAW);

    const stride = 8 * 4;
    const offsets = {
      aAngle: 0,
      aShell: 4,
      aPhase: 8,
      aSpin: 12,
      aLift: 16,
      aSize: 20,
      aAccent: 24,
      aTwist: 28,
    };

    for (const [key, offset] of Object.entries(offsets) as Array<
      [keyof typeof offsets, number]
    >) {
      const location = locations[key];
      if (location < 0) continue;
      glContext.enableVertexAttribArray(location);
      glContext.vertexAttribPointer(location, 1, glContext.FLOAT, false, stride, offset);
      glContext.vertexAttribDivisor(location, 1);
    }

    glContext.bindVertexArray(null);

    glContext.enable(glContext.BLEND);
    glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE);
    glContext.disable(glContext.DEPTH_TEST);
    glContext.clearColor(0, 0, 0, 0);

    let frameId = 0;
    let targetPointer = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));

      canvasEl.width = width;
      canvasEl.height = height;
      canvasEl.style.width = `${rect.width}px`;
      canvasEl.style.height = `${rect.height}px`;
      glContext.viewport(0, 0, width, height);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvasEl.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      targetPointer.x = clamp((x - 0.5) * 2, -1, 1);
      targetPointer.y = clamp((y - 0.5) * 2, -1, 1);
    }

    function handlePointerLeave() {
      targetPointer = { x: 0, y: 0 };
    }

    function draw(timestamp: number) {
      const time = timestamp * 0.001;

      pointer.x += (targetPointer.x - pointer.x) * 0.08;
      pointer.y += (targetPointer.y - pointer.y) * 0.08;

      glContext.clear(glContext.COLOR_BUFFER_BIT);
      glContext.useProgram(program);
      glContext.bindVertexArray(vao);

      if (uniforms.uTime) glContext.uniform1f(uniforms.uTime, time);
      if (uniforms.uResolution) {
        glContext.uniform2f(uniforms.uResolution, canvasEl.width, canvasEl.height);
      }
      if (uniforms.uPointer) glContext.uniform2f(uniforms.uPointer, pointer.x, pointer.y);

      glContext.drawArraysInstanced(glContext.TRIANGLE_STRIP, 0, 4, particleCount);
      glContext.bindVertexArray(null);

      frameId = requestAnimationFrame(draw);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (frameId === 0) frameId = requestAnimationFrame(draw);
        } else if (frameId !== 0) {
          cancelAnimationFrame(frameId);
          frameId = 0;
        }
      },
      { threshold: 0 }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    let listenersAttached = false;

    function attachPointerListeners() {
      if (listenersAttached) return;
      canvasEl.addEventListener("pointermove", handlePointerMove);
      canvasEl.addEventListener("pointerleave", handlePointerLeave);
      listenersAttached = true;
    }

    function detachPointerListeners() {
      if (!listenersAttached) return;
      canvasEl.removeEventListener("pointermove", handlePointerMove);
      canvasEl.removeEventListener("pointerleave", handlePointerLeave);
      listenersAttached = false;
      targetPointer = { x: 0, y: 0 };
    }

    function handlePointerQueryChange(event: MediaQueryListEvent) {
      if (event.matches) attachPointerListeners();
      else detachPointerListeners();
    }

    if (pointerQuery.matches) attachPointerListeners();
    pointerQuery.addEventListener("change", handlePointerQueryChange);

    return () => {
      if (frameId !== 0) cancelAnimationFrame(frameId);
      observer.disconnect();
      resizeObserver.disconnect();
      detachPointerListeners();
      pointerQuery.removeEventListener("change", handlePointerQueryChange);
      glContext.deleteBuffer(particleBuffer);
      glContext.deleteBuffer(cornerBuffer);
      glContext.deleteVertexArray(vao);
      glContext.deleteProgram(program);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div ref={rootRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-vortex-pulse bg-[radial-gradient(circle_at_58%_50%,rgba(217,167,74,0.14),transparent_20%),radial-gradient(circle_at_58%_50%,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_58%_50%,rgba(15,15,14,0.12),transparent_58%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 animate-vortex-drift bg-[radial-gradient(circle_at_58%_50%,rgba(217,167,74,0.07),transparent_16%),radial-gradient(circle_at_58%_50%,rgba(255,255,255,0.04),transparent_34%)] mix-blend-screen"
      />

      <canvas
        ref={canvasRef}
        data-testid="particle-field-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-10 h-full w-full pointer-events-auto mix-blend-screen"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_58%_50%,transparent_36%,rgba(15,15,14,0.34)_72%,rgba(15,15,14,0.9)_100%)]"
      />
    </div>
  );
}
