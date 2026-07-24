"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

const PARTICLE_COUNT_MIN = 280;
const PARTICLE_COUNT_MAX = 600;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "Unknown compile error.";
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const vertShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    throw new Error("Unable to create WebGL program.");
  }
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  gl.deleteShader(vertShader);
  gl.deleteShader(fragShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "Unknown link error.";
    gl.deleteProgram(program);
    throw new Error(info);
  }
  return program;
}

// 8 floats per particle (sin dash)
function makeSeededParticles(count: number) {
  const data = new Float32Array(count * 8);
  for (let i = 0; i < count; i++) {
    const shell = Math.pow(Math.random(), 0.6);
    const base  = i * 8;
    data[base + 0] = i * 2.399963229728653 + (Math.random() - 0.5) * 0.5;
    data[base + 1] = shell;
    data[base + 2] = Math.random() * Math.PI * 2;
    data[base + 3] = 0.04 + shell * 0.14 + Math.random() * 0.06;
    data[base + 4] = 0.06 + Math.random() * 0.18;
    data[base + 5] = 0.5  + (1 - shell) * 1.2 + Math.random() * 0.4;
    const r = Math.random();
    const accent = r < 0.18 ? 0.8 + Math.random() * 0.2
               : r < 0.40 ? 0.35 + Math.random() * 0.35
               : Math.random() * 0.12;
    data[base + 6] = accent;
    data[base + 7] = Math.random() * 2.4 + shell * 1.6;
  }
  return data;
}

// ─── Vertex Shader ─────────────────────────────────────────────────────────
const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2  aCorner;
in float aAngle;
in float aShell;
in float aPhase;
in float aSpin;
in float aLift;
in float aSize;
in float aAccent;
in float aTwist;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uPointer;
uniform float uFocusMode;

out vec2  vUV;
out float vAlpha;
out float vAccent;
out float vDepth;

vec3 rotateX(vec3 p, float a) {
  float s = sin(a), c = cos(a);
  return vec3(p.x, p.y*c - p.z*s, p.y*s + p.z*c);
}
vec3 rotateY(vec3 p, float a) {
  float s = sin(a), c = cos(a);
  return vec3(p.x*c - p.z*s, p.y, p.x*s + p.z*c);
}

vec3 fieldPosition(float t) {
  float driftSpeed = 0.012 + aSpin * 0.012;
  float baseX = sin(aAngle) * 1.55;
  float baseY = cos(aAngle * 1.28 + aPhase) * 1.05;
  float driftX = t * driftSpeed;
  float driftY = sin(t * 0.07 + aPhase) * 0.14;

  float finalX = mod(baseX + driftX + 1.7, 3.4) - 1.7;
  float finalY = mod(baseY + driftY + 1.2, 2.4) - 1.2;

  // Oscilación de nebulosa: tres frecuencias independientes en Z + perturbación lateral
  float nebZ = sin(t * aLift * 0.9  + aPhase * 1.4) * 0.38
             + sin(t * aLift * 0.34 + aPhase * 2.1) * 0.22
             + cos(t * 0.11         + aPhase * 0.6) * 0.14;
  finalX += cos(t * 0.18 + aPhase * 1.8) * 0.06;
  finalY += sin(t * 0.22 + aPhase * 1.3) * 0.04;

  vec3 p = vec3(finalX, finalY, nebZ);
  p = rotateX(p, 0.30);
  return p;
}

vec2 projectToScreen(vec3 p) {
  float persp = 1.0 / (1.58 - p.z * 0.52);
  return p.xy * persp;
}

void main() {
  vec3  current  = fieldPosition(uTime);
  float trail    = 0.030 + aShell * 0.022;
  vec3  previous = fieldPosition(uTime - trail);

  float autoX = sin(uTime * 0.07) * 0.055;
  float autoY = cos(uTime * 0.05) * 0.04;
  float ctX   = uPointer.x * 0.45 + autoX;
  float ctY   = -uPointer.y * 0.32 + autoY;

  current  = rotateY(rotateX(current,  ctY), ctX);
  previous = rotateY(rotateX(previous, ctY), ctX);

  vec2 center      = uResolution * 0.5;
  float screenScale = uResolution.y * 0.64;
  vec2 basePixel     = center + projectToScreen(current)  * screenScale;
  vec2 prevBasePixel = center + projectToScreen(previous) * screenScale;

  // ── Focus mode: flujo perimetral alrededor del login card ─────────────────
  float borderW = 410.0, borderH = 510.0;
  float perim   = (borderW + borderH) * 2.0;
  float pPos    = mod(aAngle * 48.0 + uTime * 0.040 * perim, perim);
  vec2 tOff;
  if      (pPos < borderW)               tOff = vec2(-borderW*0.5 + pPos, borderH*0.5);
  else if (pPos < borderW + borderH)     tOff = vec2(borderW*0.5, borderH*0.5 - (pPos - borderW));
  else if (pPos < borderW*2.0 + borderH) tOff = vec2(borderW*0.5 - (pPos - (borderW + borderH)), -borderH*0.5);
  else                                   tOff = vec2(-borderW*0.5, -borderH*0.5 + (pPos - (borderW*2.0 + borderH)));
  
  // Dispersar las partículas en una banda más ancha y suave alrededor del perímetro
  float offsetAmt = sin(uTime * 2.5 + aPhase * 2.0) * 12.0 + (aPhase - 3.14159) * 28.0;
  tOff += normalize(tOff) * offsetAmt;
  vec2 targetPixel = center + tOff;

  float ppPos = mod(aAngle * 48.0 + (uTime - trail) * 0.040 * perim, perim);
  vec2 ptOff;
  if      (ppPos < borderW)               ptOff = vec2(-borderW*0.5 + ppPos, borderH*0.5);
  else if (ppPos < borderW + borderH)     ptOff = vec2(borderW*0.5, borderH*0.5 - (ppPos - borderW));
  else if (ppPos < borderW*2.0 + borderH) ptOff = vec2(borderW*0.5 - (ppPos - (borderW + borderH)), -borderH*0.5);
  else                                    ptOff = vec2(-borderW*0.5, -borderH*0.5 + (ppPos - (borderW*2.0 + borderH)));
  
  float prevOffsetAmt = sin((uTime - trail) * 2.5 + aPhase * 2.0) * 12.0 + (aPhase - 3.14159) * 28.0;
  ptOff += normalize(ptOff) * prevOffsetAmt;
  vec2 prevTargetPixel = center + ptOff;

  // Solo un subconjunto de las partículas migran hacia la tarjeta para evitar densidad excesiva
  float focusInfluence = uFocusMode * smoothstep(0.40, 0.70, aShell);

  vec2 currentPixel  = mix(basePixel,     targetPixel,     focusInfluence);
  vec2 previousPixel = mix(prevBasePixel, prevTargetPixel, focusInfluence);

  vec2 camShift = vec2(uPointer.x * uResolution.x * 0.032, -uPointer.y * uResolution.y * 0.022);
  currentPixel  += camShift;
  previousPixel += camShift;

  // Magnético al cursor
  vec2  pxPointer = center + vec2(uPointer.x * uResolution.x * 0.5, -uPointer.y * uResolution.y * 0.5);
  vec2  toPtr     = pxPointer - currentPixel;
  float distPtr   = length(toPtr);
  if (distPtr < 240.0) {
    float inf = smoothstep(240.0, 0.0, distPtr);
    float mf  = mix(0.16, 0.04, focusInfluence);
    float of  = mix(0.13, 0.02, focusInfluence);
    currentPixel += toPtr * mf * inf + vec2(-toPtr.y, toPtr.x) * of * inf;
  }

  // ── QUAD redondo (sin elongación de dash) ─────────────────────────────────
  float depth    = clamp((current.z + 0.9) / 1.8, 0.0, 1.0);
  float persp    = 1.0 / (1.58 - current.z * 0.52);
  float baseSize = mix(4.5, 12.5, aShell) * aSize * persp;
  baseSize = mix(baseSize, baseSize * 1.18, focusInfluence);
  baseSize *= mix(0.5, 1.3, depth);

  // Quad simétrico → punto/círculo en el fragment shader
  vec2 local = aCorner * baseSize;

  vec2 finalPixel = currentPixel + local;
  vec2 clip       = finalPixel / uResolution * 2.0 - 1.0;

  gl_Position = vec4(clip * vec2(1.0, -1.0), current.z * 0.0001, 1.0);
  vUV    = aCorner;

  float alpha = clamp(0.30 + aShell * 0.55 + aAccent * 0.06, 0.22, 0.98);
  vAlpha  = mix(alpha, clamp(alpha * 1.5, 0.33, 0.99), focusInfluence) * mix(0.36, 1.0, depth);
  vAccent = mix(aAccent, 0.92, focusInfluence * 0.8);
  vDepth  = depth;
}
`;

// ─── Fragment Shader: punto/círculo con glow gaussiano ──────────────────────
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2  vUV;
in float vAlpha;
in float vAccent;
in float vDepth;

uniform float uOpacity;

out vec4 outColor;

void main() {
  float dist = length(vUV);          // 0 en centro, 1 en borde del quad
  
  // Glow gaussiano suave (punto circular)
  float glow = exp(-dist * dist * 3.2);
  // Núcleo brillante concentrado
  float core = exp(-dist * dist * 22.0);

  vec3 white  = vec3(0.96, 0.97, 1.0);
  vec3 gold   = vec3(0.0, 0.79, 0.34);
  vec3 copper = vec3(0.0, 0.62, 0.22);

  vec3 color;
  if      (vAccent > 0.6) color = mix(gold,   vec3(0.37, 1.0, 0.66), (vAccent - 0.6) / 0.4);
  else if (vAccent > 0.2) color = mix(copper, gold,                   (vAccent - 0.2) / 0.4);
  else                    color = mix(white,  copper,                   vAccent / 0.2);

  color *= 0.63 + core * 1.83 + vDepth * 0.20;

  float alpha = vAlpha * pow(glow, 1.4) * uOpacity;
  outColor = vec4(color, alpha);
}
`;

export function ParticleField() {
  const rootRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotionSafe();

  useEffect(() => {
    if (reducedMotion) return;
    const root   = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true, antialias: true,
      premultipliedAlpha: false, preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const canvasEl  = canvas;
    const glContext = gl;

    const particleCount = clamp(
      Math.round((window.innerWidth * window.innerHeight) / 2800),
      PARTICLE_COUNT_MIN,
      PARTICLE_COUNT_MAX
    );
    const particleData = makeSeededParticles(particleCount);
    const program      = createProgram(glContext, VERTEX_SHADER, FRAGMENT_SHADER);
    const vao          = glContext.createVertexArray();
    const pBuf         = glContext.createBuffer();
    const cBuf         = glContext.createBuffer();

    if (!vao || !pBuf || !cBuf) {
      if (vao) glContext.deleteVertexArray(vao);
      if (pBuf) glContext.deleteBuffer(pBuf);
      if (cBuf) glContext.deleteBuffer(cBuf);
      glContext.deleteProgram(program);
      return;
    }

    const loc = {
      aCorner: glContext.getAttribLocation(program, "aCorner"),
      aAngle:  glContext.getAttribLocation(program, "aAngle"),
      aShell:  glContext.getAttribLocation(program, "aShell"),
      aPhase:  glContext.getAttribLocation(program, "aPhase"),
      aSpin:   glContext.getAttribLocation(program, "aSpin"),
      aLift:   glContext.getAttribLocation(program, "aLift"),
      aSize:   glContext.getAttribLocation(program, "aSize"),
      aAccent: glContext.getAttribLocation(program, "aAccent"),
      aTwist:  glContext.getAttribLocation(program, "aTwist"),
    };
    const uni = {
      uTime:       glContext.getUniformLocation(program, "uTime"),
      uResolution: glContext.getUniformLocation(program, "uResolution"),
      uPointer:    glContext.getUniformLocation(program, "uPointer"),
      uOpacity:    glContext.getUniformLocation(program, "uOpacity"),
      uFocusMode:  glContext.getUniformLocation(program, "uFocusMode"),
    };

    const corners = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    glContext.bindVertexArray(vao);

    glContext.bindBuffer(glContext.ARRAY_BUFFER, cBuf);
    glContext.bufferData(glContext.ARRAY_BUFFER, corners, glContext.STATIC_DRAW);
    if (loc.aCorner >= 0) {
      glContext.enableVertexAttribArray(loc.aCorner);
      glContext.vertexAttribPointer(loc.aCorner, 2, glContext.FLOAT, false, 0, 0);
    }

    glContext.bindBuffer(glContext.ARRAY_BUFFER, pBuf);
    glContext.bufferData(glContext.ARRAY_BUFFER, particleData, glContext.STATIC_DRAW);

    const stride = 8 * 4;
    const offsets = { aAngle:0, aShell:4, aPhase:8, aSpin:12, aLift:16, aSize:20, aAccent:24, aTwist:28 };
    for (const [key, offset] of Object.entries(offsets) as Array<[keyof typeof offsets, number]>) {
      const location = loc[key];
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

    let frameId         = 0;
    let targetPointer   = { x: 0, y: 0 };
    const pointer       = { x: 0, y: 0 };
    let entranceOpacity = 0.0;
    let targetFocus     = 0.0;
    let focusMode       = 0.0;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
      const w = Math.max(1, Math.round(window.innerWidth  * dpr));
      const h = Math.max(1, Math.round(window.innerHeight * dpr));
      canvasEl.width  = w; canvasEl.height = h;
      canvasEl.style.width  = `${window.innerWidth}px`;
      canvasEl.style.height = `${window.innerHeight}px`;
      glContext.viewport(0, 0, w, h);
    }

    function handlePointerMove(e: PointerEvent) {
      targetPointer.x = clamp((e.clientX / window.innerWidth  - 0.5) * 2, -1, 1);
      targetPointer.y = clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1);
    }
    function handlePointerLeave() { targetPointer = { x: 0, y: 0 }; }
    function handleFocusIn(e: FocusEvent) {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) targetFocus = 1.0;
    }
    function handleFocusOut() { targetFocus = 0.0; }

    function draw(ts: number) {
      const time = ts * 0.001;
      pointer.x  += (targetPointer.x - pointer.x) * 0.08;
      pointer.y  += (targetPointer.y - pointer.y) * 0.08;
      if (entranceOpacity < 1.0) entranceOpacity = Math.min(1.0, entranceOpacity + 0.007);
      focusMode  += (targetFocus - focusMode) * 0.055;

      glContext.clear(glContext.COLOR_BUFFER_BIT);
      glContext.useProgram(program);
      glContext.bindVertexArray(vao);

      if (uni.uTime)       glContext.uniform1f(uni.uTime, time);
      if (uni.uResolution) glContext.uniform2f(uni.uResolution, canvasEl.width, canvasEl.height);
      if (uni.uPointer)    glContext.uniform2f(uni.uPointer, pointer.x, pointer.y);
      if (uni.uOpacity)    glContext.uniform1f(uni.uOpacity, entranceOpacity);
      if (uni.uFocusMode)  glContext.uniform1f(uni.uFocusMode, focusMode);

      glContext.drawArraysInstanced(glContext.TRIANGLE_STRIP, 0, 4, particleCount);
      glContext.bindVertexArray(null);
      frameId = requestAnimationFrame(draw);
    }

    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        if (frameId === 0) frameId = requestAnimationFrame(draw);
      } else if (frameId !== 0) {
        cancelAnimationFrame(frameId); frameId = 0;
      }
    }, { threshold: 0 });
    io.observe(root);

    const ro = new ResizeObserver(resize);
    ro.observe(document.body);
    resize();

    window.addEventListener("pointermove",  handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("focusin",      handleFocusIn);
    window.addEventListener("focusout",     handleFocusOut);

    return () => {
      if (frameId !== 0) cancelAnimationFrame(frameId);
      io.disconnect(); ro.disconnect();
      window.removeEventListener("pointermove",  handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("focusin",      handleFocusIn);
      window.removeEventListener("focusout",     handleFocusOut);
      glContext.deleteBuffer(pBuf);
      glContext.deleteBuffer(cBuf);
      glContext.deleteVertexArray(vao);
      glContext.deleteProgram(program);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={rootRef}
      className="particle-field fixed inset-0 z-0 h-screen w-screen pointer-events-none overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        data-testid="particle-field-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-10 h-full w-full pointer-events-none mix-blend-screen"
      />
    </div>
  );
}
