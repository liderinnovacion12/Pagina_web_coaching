"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

const PARTICLE_COUNT_MIN = 280;
const PARTICLE_COUNT_MAX = 600;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader.");
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
  const vs = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    throw new Error("Unable to create WebGL program.");
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "Unknown program link error.";
    gl.deleteProgram(program);
    throw new Error(info);
  }
  return program;
}

function makeSeededParticles(count: number) {
  // 10 floats per particle: angle, shell, phase, spin, lift, size, accent, twist, dashLen, dashAngle
  const particles = new Float32Array(count * 10);
  for (let i = 0; i < count; i++) {
    const shell = Math.pow(Math.random(), 0.6);
    const base = i * 10;

    particles[base + 0] = i * 2.399963229728653 + (Math.random() - 0.5) * 0.5; // angle
    particles[base + 1] = shell;
    particles[base + 2] = Math.random() * Math.PI * 2;  // phase
    particles[base + 3] = 0.04 + shell * 0.14 + Math.random() * 0.06; // spin
    particles[base + 4] = 0.06 + Math.random() * 0.18;  // lift freq
    particles[base + 5] = 0.5 + (1 - shell) * 1.2 + Math.random() * 0.4; // size

    const rand = Math.random();
    let accent = 0.0;
    if (rand < 0.18) accent = 0.8 + Math.random() * 0.2;      // Gold
    else if (rand < 0.40) accent = 0.35 + Math.random() * 0.35; // Amber
    else accent = Math.random() * 0.12;                           // White/Silver
    particles[base + 6] = accent;

    particles[base + 7] = Math.random() * 2.4 + shell * 1.6; // twist
    // Longitud del dash (ratio largo/ancho): entre 2.5 y 6.0
    particles[base + 8] = 2.5 + Math.random() * 3.5;
    // Ángulo del dash en reposo (rotación local del trazo)
    particles[base + 9] = Math.random() * Math.PI;
  }
  return particles;
}

// ─────────────────────────────── VERTEX SHADER ───────────────────────────────
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
in float aDashLen;   // Elongación del dash (ratio)
in float aDashAngle; // Ángulo base del dash en reposo

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uOpacity;
uniform float uFocusMode;

out vec2 vUV;        // Coordenadas locales del quad para el fragment shader
out float vAlpha;
out float vAccent;
out float vDepth;
out float vDashLen;

// ── Rotaciones ────────────────────────────────────────────────────────────────
vec3 rotateX(vec3 p, float a) {
  float s = sin(a), c = cos(a);
  return vec3(p.x, p.y*c - p.z*s, p.y*s + p.z*c);
}
vec3 rotateY(vec3 p, float a) {
  float s = sin(a), c = cos(a);
  return vec3(p.x*c - p.z*s, p.y, p.x*s + p.z*c);
}

// ── Posición en el campo de nebulosa ─────────────────────────────────────────
vec3 fieldPosition(float t) {
  // Desplazamiento continuo de viento
  float driftSpeed  = 0.012 + aSpin * 0.012;
  float baseX       = sin(aAngle) * 1.55;
  float baseY       = cos(aAngle * 1.28 + aPhase) * 1.05;
  float driftX      = t * driftSpeed;
  float driftY      = sin(t * 0.07 + aPhase) * 0.14;

  float finalX = mod(baseX + driftX + 1.7, 3.4) - 1.7;
  float finalY = mod(baseY + driftY + 1.2, 2.4) - 1.2;

  // Oscilación nebulosa tridimensional: combina varias frecuencias para que
  // no sea periódica ni predecible, dando textura de nube viva.
  float nebZ =  sin(t * aLift * 0.9  + aPhase * 1.4) * 0.38
              + sin(t * aLift * 0.34 + aPhase * 2.1) * 0.22
              + cos(t * 0.11         + aPhase * 0.6) * 0.14;

  // Ondulación lateral extra (efecto viento turbulento)
  finalX += cos(t * 0.18 + aPhase * 1.8) * 0.06;
  finalY += sin(t * 0.22 + aPhase * 1.3) * 0.04;

  vec3 p = vec3(finalX, finalY, nebZ);
  // Inclinación base del plano galáctico
  p = rotateX(p, 0.30);
  return p;
}

vec2 projectToScreen(vec3 p) {
  float persp = 1.0 / (1.58 - p.z * 0.52);
  return p.xy * persp;
}

void main() {
  vec3 current  = fieldPosition(uTime);
  float trail   = 0.030 + aShell * 0.022;
  vec3 previous = fieldPosition(uTime - trail);

  // Paneo autónomo cámara
  float autoX = sin(uTime * 0.07) * 0.055;
  float autoY = cos(uTime * 0.05) * 0.04;

  float ctX = uPointer.x * 0.45 + autoX;
  float ctY = -uPointer.y * 0.32 + autoY;

  current  = rotateY(rotateX(current,  ctY), ctX);
  previous = rotateY(rotateX(previous, ctY), ctX);

  vec2 center       = uResolution * 0.5;
  float screenScale = uResolution.y * 0.64;

  vec2 basePixel      = center + projectToScreen(current)  * screenScale;
  vec2 prevBasePixel  = center + projectToScreen(previous) * screenScale;

  // ── FOCUS MODE: flujo perimetral alrededor de la tarjeta de login ──────────
  float borderW   = 410.0;
  float borderH   = 510.0;
  float perim     = (borderW + borderH) * 2.0;
  float flowSpeed = 0.040;

  float pPos = mod(aAngle * 48.0 + uTime * flowSpeed * perim, perim);
  vec2 tOff;
  if      (pPos < borderW)              tOff = vec2(-borderW*0.5 + pPos, borderH*0.5);
  else if (pPos < borderW + borderH)    tOff = vec2(borderW*0.5,  borderH*0.5 - (pPos - borderW));
  else if (pPos < borderW*2.0 + borderH) tOff = vec2(borderW*0.5 - (pPos - (borderW + borderH)), -borderH*0.5);
  else                                  tOff = vec2(-borderW*0.5, -borderH*0.5 + (pPos - (borderW*2.0 + borderH)));

  float wave = sin(uTime * 3.5 + aPhase * 2.0) * 7.0;
  tOff += normalize(tOff) * wave;
  vec2 targetPixel = center + tOff;

  // Prev target (para cálculo de estela)
  float ppPos = mod(aAngle * 48.0 + (uTime - trail) * flowSpeed * perim, perim);
  vec2 ptOff;
  if      (ppPos < borderW)               ptOff = vec2(-borderW*0.5 + ppPos, borderH*0.5);
  else if (ppPos < borderW + borderH)     ptOff = vec2(borderW*0.5,  borderH*0.5 - (ppPos - borderW));
  else if (ppPos < borderW*2.0 + borderH) ptOff = vec2(borderW*0.5 - (ppPos - (borderW + borderH)), -borderH*0.5);
  else                                    ptOff = vec2(-borderW*0.5, -borderH*0.5 + (ppPos - (borderW*2.0 + borderH)));
  ptOff += normalize(ptOff) * sin((uTime - trail)*3.5 + aPhase*2.0) * 7.0;
  vec2 prevTargetPixel = center + ptOff;

  vec2 currentPixel  = mix(basePixel,     targetPixel,     uFocusMode);
  vec2 previousPixel = mix(prevBasePixel, prevTargetPixel, uFocusMode);

  // Ajuste de cámara
  vec2 camShift = vec2(uPointer.x * uResolution.x * 0.032, -uPointer.y * uResolution.y * 0.022);
  currentPixel  += camShift;
  previousPixel += camShift;

  // ── Magnético al cursor (reducido en focus mode) ───────────────────────────
  vec2 pxPointer = center + vec2(uPointer.x * uResolution.x * 0.5, -uPointer.y * uResolution.y * 0.5);
  vec2 toPtr     = pxPointer - currentPixel;
  float distPtr  = length(toPtr);
  if (distPtr < 240.0) {
    float inf = smoothstep(240.0, 0.0, distPtr);
    float mf  = mix(0.16, 0.04, uFocusMode);
    float of  = mix(0.13, 0.02, uFocusMode);
    currentPixel += toPtr * mf * inf + vec2(-toPtr.y, toPtr.x) * of * inf;
  }

  // ── Estela / dash direction ───────────────────────────────────────────────
  vec2 motion    = currentPixel - previousPixel;
  bool jumpCut   = length(motion) > uResolution.x * 0.20;
  if (jumpCut) motion = vec2(0.0);

  float speed    = length(motion);
  // Dirección del dash: si hay velocidad usamos la dirección del movimiento;
  // si está quieto usamos el ángulo base del dash para que nunca sea un punto.
  vec2 dir;
  if (speed > 0.4) {
    dir = motion / speed;
  } else {
    dir = vec2(cos(aDashAngle + uTime * aSpin * 0.6 + aPhase),
               sin(aDashAngle + uTime * aSpin * 0.6 + aPhase));
  }
  vec2 perp = vec2(-dir.y, dir.x);

  // Profundidad y perspectiva
  float depth   = clamp((current.z + 0.9) / 1.8, 0.0, 1.0);
  float persp   = 1.0 / (1.58 - current.z * 0.52);

  // Tamaño: más notorio que antes pero sin dominar la pantalla
  float baseSize = mix(5.0, 14.0, aShell) * aSize * persp;
  baseSize = mix(baseSize, baseSize * 1.18, uFocusMode);
  baseSize *= mix(0.5, 1.3, depth);

  // Elongación del dash: combina la elongación base del atributo + velocidad
  float dashRatio  = aDashLen + speed * 0.08;   // se estira más al moverse
  dashRatio        = clamp(dashRatio, 2.2, 9.0);

  // Quad: x → dirección larga del dash, y → ancho corto
  vec2 local = vec2(
    aCorner.x * baseSize * dashRatio, // largo
    aCorner.y * baseSize              // ancho (sin escalar)
  );

  vec2 finalPixel = currentPixel + dir * local.x + perp * local.y;
  vec2 clip       = finalPixel / uResolution * 2.0 - 1.0;

  gl_Position = vec4(clip * vec2(1.0, -1.0), current.z * 0.0001, 1.0);

  // UV local: vUV.x ∈ [-1,1] a lo largo del dash, vUV.y ∈ [-1,1] en el ancho
  vUV     = aCorner;          // aCorner ya es [-1,1] en xy
  vDashLen = dashRatio;

  float alpha = clamp(0.20 + aShell * 0.46 + speed * 0.024 + aAccent * 0.05, 0.14, 0.96);
  vAlpha  = mix(alpha, clamp(alpha * 1.4, 0.24, 0.99), uFocusMode) * mix(0.22, 1.0, depth);
  vAccent = mix(aAccent, 0.92, uFocusMode * 0.8);
  vDepth  = depth;
}
`;

// ─────────────────────────────── FRAGMENT SHADER ─────────────────────────────
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2  vUV;
in float vAlpha;
in float vAccent;
in float vDepth;
in float vDashLen;

uniform float uOpacity;

out vec4 outColor;

void main() {
  // vUV.x ∈ [-1, 1] en el eje largo del dash
  // vUV.y ∈ [-1, 1] en el eje corto (ancho)
  
  // Cápsula elongada: atenuamos sólo a lo largo del eje x (largo)
  // Eje corto: Gaussian muy apretado → trazo fino
  // Eje largo: caída de tipo cápsula (suave en los extremos, plano en el centro)

  float halfLen = 1.0; // normalizado a ±1
  
  // Distancia al eje central a lo largo del largo del dash
  float alongX  = abs(vUV.x) / halfLen;            // 0 en centro, 1 en punta
  float capsule = smoothstep(1.0, 0.65, alongX);   // transición suave en los extremos

  // Eje corto: Gaussian estrecho → dash delgado
  float thin   = exp(-vUV.y * vUV.y * 9.5);

  // Combinamos: el dash tiene forma de trazo con bordes redondeados
  float glow   = capsule * thin;

  // Núcleo brillante a lo largo del centro del trazo
  float core   = capsule * exp(-vUV.y * vUV.y * 42.0);

  // Paleta
  vec3 white  = vec3(0.96, 0.97, 1.0);
  vec3 gold   = vec3(0.94, 0.74, 0.38);
  vec3 copper = vec3(0.86, 0.54, 0.25);

  vec3 color;
  if (vAccent > 0.6)       color = mix(gold,   vec3(0.98, 0.86, 0.60), (vAccent - 0.6) / 0.4);
  else if (vAccent > 0.2)  color = mix(copper, gold,                   (vAccent - 0.2) / 0.4);
  else                     color = mix(white,  copper,                   vAccent / 0.2);

  color *= 0.42 + core * 1.20 + vDepth * 0.14;

  float alpha = vAlpha * glow * glow * uOpacity;
  outColor = vec4(color, alpha);
}
`;

export function ParticleField() {
  const rootRef  = useRef<HTMLDivElement>(null);
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

    const particleCount = clamp(
      Math.round((window.innerWidth * window.innerHeight) / 2800),
      PARTICLE_COUNT_MIN,
      PARTICLE_COUNT_MAX
    );
    const particleData = makeSeededParticles(particleCount);
    const program      = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    const vao          = gl.createVertexArray();
    const pBuf         = gl.createBuffer();
    const cBuf         = gl.createBuffer();

    if (!vao || !pBuf || !cBuf) {
      if (vao) gl.deleteVertexArray(vao);
      if (pBuf) gl.deleteBuffer(pBuf);
      if (cBuf) gl.deleteBuffer(cBuf);
      gl.deleteProgram(program);
      return;
    }

    const loc = {
      aCorner:    gl.getAttribLocation(program, "aCorner"),
      aAngle:     gl.getAttribLocation(program, "aAngle"),
      aShell:     gl.getAttribLocation(program, "aShell"),
      aPhase:     gl.getAttribLocation(program, "aPhase"),
      aSpin:      gl.getAttribLocation(program, "aSpin"),
      aLift:      gl.getAttribLocation(program, "aLift"),
      aSize:      gl.getAttribLocation(program, "aSize"),
      aAccent:    gl.getAttribLocation(program, "aAccent"),
      aTwist:     gl.getAttribLocation(program, "aTwist"),
      aDashLen:   gl.getAttribLocation(program, "aDashLen"),
      aDashAngle: gl.getAttribLocation(program, "aDashAngle"),
    };
    const uni = {
      uTime:       gl.getUniformLocation(program, "uTime"),
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uPointer:    gl.getUniformLocation(program, "uPointer"),
      uOpacity:    gl.getUniformLocation(program, "uOpacity"),
      uFocusMode:  gl.getUniformLocation(program, "uFocusMode"),
    };

    const corners = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);

    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuf);
    gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);
    if (loc.aCorner >= 0) {
      gl.enableVertexAttribArray(loc.aCorner);
      gl.vertexAttribPointer(loc.aCorner, 2, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, pBuf);
    gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.STATIC_DRAW);

    // 10 floats per particle × 4 bytes
    const stride = 10 * 4;
    const attrOffsets: Record<keyof typeof loc, number> = {
      aCorner: -1, // separate buffer, skip
      aAngle:     0,
      aShell:     4,
      aPhase:     8,
      aSpin:      12,
      aLift:      16,
      aSize:      20,
      aAccent:    24,
      aTwist:     28,
      aDashLen:   32,
      aDashAngle: 36,
    };

    for (const [key, offset] of Object.entries(attrOffsets) as Array<[keyof typeof loc, number]>) {
      if (key === "aCorner") continue;
      const location = loc[key];
      if (location < 0) continue;
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 1, gl.FLOAT, false, stride, offset);
      gl.vertexAttribDivisor(location, 1);
    }

    gl.bindVertexArray(null);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    let frameId        = 0;
    let targetPointer  = { x: 0, y: 0 };
    const pointer      = { x: 0, y: 0 };
    let entranceOpacity = 0.0;
    let targetFocus    = 0.0;
    let focusMode      = 0.0;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const canvasEl = canvas;
    const glContext = gl;

    function resize() {
      const w = Math.max(1, Math.round(window.innerWidth  * dpr));
      const h = Math.max(1, Math.round(window.innerHeight * dpr));
      canvasEl.width  = w;
      canvasEl.height = h;
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
        cancelAnimationFrame(frameId);
        frameId = 0;
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
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove",  handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("focusin",      handleFocusIn);
      window.removeEventListener("focusout",     handleFocusOut);
      gl.deleteBuffer(pBuf);
      gl.deleteBuffer(cBuf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-0 h-screen w-screen pointer-events-none overflow-hidden"
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
