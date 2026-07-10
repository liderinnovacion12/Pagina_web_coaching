"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

const PARTICLE_COUNT_MIN = 80;
const PARTICLE_COUNT_MAX = 150;

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
    const shell = Math.pow(Math.random(), 0.68);
    const base = index * 8;

    particles[base + 0] = index * 2.399963229728653 + (Math.random() - 0.5) * 0.45; // angle
    particles[base + 1] = shell; // shell
    particles[base + 2] = Math.random() * Math.PI * 2; // phase
    particles[base + 3] = 0.05 + shell * 0.18 + Math.random() * 0.05; // spin
    particles[base + 4] = 0.08 + Math.random() * 0.16; // lift
    particles[base + 5] = 0.65 + (1 - shell) * 1.8; // size factor

    const rand = Math.random();
    let accent = 0.0;
    if (rand < 0.15) {
      accent = 0.8 + Math.random() * 0.2; // Oro
    } else if (rand < 0.35) {
      accent = 0.35 + Math.random() * 0.35; // Ámbar
    } else {
      accent = Math.random() * 0.15; // Blanco
    }
    particles[base + 6] = accent;
    particles[base + 7] = Math.random() * 2.2 + shell * 1.8; // twist
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
uniform float uFocusMode; // 0.0 = normal drift, 1.0 = agrupados alrededor del login

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
  // Distribución inicial flotante
  float x = sin(aAngle) * 1.5;
  float y = cos(aAngle * 1.34 + aPhase) * 1.0;
  
  // Desplazamiento lateral de viento continuo
  float driftSpeed = 0.015 + aSpin * 0.015;
  float driftX = t * driftSpeed;
  float driftY = sin(t * 0.08 + aPhase) * 0.12;

  // Envoltura cilíndrica infinita
  float finalX = mod(x + driftX + 1.6, 3.2) - 1.6;
  float finalY = mod(y + driftY + 1.1, 2.2) - 1.1;

  float z = sin(t * aLift * 0.5 + aPhase) * 0.55;

  vec3 p = vec3(finalX, finalY, z);
  p = rotateX(p, 0.28);

  return p;
}

vec2 projectToScreen(vec3 p) {
  float perspective = 1.0 / (1.55 - p.z * 0.5);
  return p.xy * perspective;
}

void main() {
  vec3 current = fieldPosition(uTime);
  float trailTime = 0.035 + aShell * 0.025;
  vec3 previous = fieldPosition(uTime - trailTime);

  // Paneo autónomo de cámara
  float autoTiltX = sin(uTime * 0.06) * 0.05;
  float autoTiltY = cos(uTime * 0.05) * 0.035;

  float cursorTiltX = uPointer.x * 0.48 + autoTiltX;
  float cursorTiltY = -uPointer.y * 0.35 + autoTiltY;

  // Aplicamos rotación de la cámara
  current = rotateY(current, cursorTiltX);
  current = rotateX(current, cursorTiltY);
  previous = rotateY(previous, cursorTiltX);
  previous = rotateX(previous, cursorTiltY);

  vec2 center = uResolution * 0.5;
  
  // Posiciones base proyectadas (en píxeles)
  vec2 basePixel = center + projectToScreen(current) * uResolution.y * 0.65;
  vec2 prevBasePixel = center + projectToScreen(previous) * uResolution.y * 0.65;

  // EFECTO MAGNÉTICO AL INGRESO DE CREDENCIALES (Alineamiento alrededor del login card)
  // SM login card es ~384px de ancho y ~480px de alto. Añadimos margen para formar un halo.
  float borderW = 410.0;
  float borderH = 510.0;
  float perimeter = (borderW + borderH) * 2.0;
  float flowSpeed = 0.045; // Velocidad del flujo de partículas alrededor del marco
  
  // Posición en el perímetro de la tarjeta
  float pPos = mod(aAngle * 42.0 + uTime * flowSpeed * perimeter, perimeter);
  vec2 targetOffset;
  if (pPos < borderW) {
    targetOffset = vec2(-borderW * 0.5 + pPos, borderH * 0.5);
  } else if (pPos < borderW + borderH) {
    targetOffset = vec2(borderW * 0.5, borderH * 0.5 - (pPos - borderW));
  } else if (pPos < borderW * 2.0 + borderH) {
    targetOffset = vec2(borderW * 0.5 - (pPos - (borderW + borderH)), -borderH * 0.5);
  } else {
    targetOffset = vec2(-borderW * 0.5, -borderH * 0.5 + (pPos - (borderW * 2.0 + borderH)));
  }
  
  // Micro onda oscilatoria para que el halo perimetral respire en 3D
  float wave = sin(uTime * 3.8 + aPhase * 2.0) * 8.0;
  targetOffset += normalize(targetOffset) * wave;
  vec2 targetPixel = center + targetOffset;

  // Calculamos el objetivo de estela (previousTarget)
  float prevPPos = mod(aAngle * 42.0 + (uTime - trailTime) * flowSpeed * perimeter, perimeter);
  vec2 prevTargetOffset;
  if (prevPPos < borderW) {
    prevTargetOffset = vec2(-borderW * 0.5 + prevPPos, borderH * 0.5);
  } else if (prevPPos < borderW + borderH) {
    prevTargetOffset = vec2(borderW * 0.5, borderH * 0.5 - (prevPPos - borderW));
  } else if (prevPPos < borderW * 2.0 + borderH) {
    prevTargetOffset = vec2(borderW * 0.5 - (prevPPos - (prevPPos - (borderW + borderH))), -borderH * 0.5);
  } else {
    prevTargetOffset = vec2(-borderW * 0.5, -borderH * 0.5 + (prevPPos - (borderW * 2.0 + borderH)));
  }
  prevTargetOffset += normalize(prevTargetOffset) * sin((uTime - trailTime) * 3.8 + aPhase * 2.0) * 8.0;
  vec2 prevTargetPixel = center + prevTargetOffset;

  // Mezcla de posiciones final en base al modo focus
  vec2 currentPixel = mix(basePixel, targetPixel, uFocusMode);
  vec2 previousPixel = mix(prevBasePixel, prevTargetPixel, uFocusMode);

  // Cámara interactiva básica
  currentPixel += vec2(uPointer.x * uResolution.x * 0.035, -uPointer.y * uResolution.y * 0.025);
  previousPixel += vec2(uPointer.x * uResolution.x * 0.035, -uPointer.y * uResolution.y * 0.025);

  // REACCIÓN MAGNÉTICA LOCAL: Atracción al cursor (se atenúa en modo focus para respetar la tarjeta)
  vec2 pointerPixel = center + vec2(uPointer.x * uResolution.x * 0.5, -uPointer.y * uResolution.y * 0.5);
  vec2 toPointer = pointerPixel - currentPixel;
  float distToPointer = length(toPointer);
  if (distToPointer < 260.0) {
    float influence = smoothstep(260.0, 0.0, distToPointer);
    float mouseForce = mix(0.18, 0.05, uFocusMode);
    float orbitForce = mix(0.15, 0.03, uFocusMode);
    
    vec2 pull = toPointer * mouseForce * influence;
    vec2 orbit = vec2(-toPointer.y, toPointer.x) * orbitForce * influence;
    currentPixel += pull + orbit;
  }

  vec2 motion = currentPixel - previousPixel;
  if (length(motion) > uResolution.x * 0.22) {
    motion = vec2(0.0);
  }

  float speed = length(motion);
  vec2 direction = speed > 0.0001 ? motion / speed : vec2(1.0, 0.0);
  vec2 perpendicular = vec2(-direction.y, direction.x);

  // Profundidad y perspectiva
  float depth = clamp((current.z + 0.9) / 1.8, 0.0, 1.0);
  float perspective = 1.0 / (1.55 - current.z * 0.5);
  
  float baseSize = mix(6.0, 16.0, aShell) * aSize * perspective;
  // Escalado y brillo mayor en modo focus para un efecto de halo brillante
  baseSize = mix(baseSize, baseSize * 1.15, uFocusMode);
  baseSize *= mix(0.55, 1.35, depth);

  float stretch = clamp(1.0 + speed * 0.045, 1.0, 3.2);
  vec2 local = vec2(
    aCorner.x * baseSize * stretch * 1.15,
    aCorner.y * baseSize * 0.82
  );

  vec2 finalPixel = currentPixel + direction * local.x + perpendicular * local.y;
  vec2 clip = finalPixel / uResolution * 2.0 - 1.0;

  gl_Position = vec4(clip * vec2(1.0, -1.0), current.z * 0.0001, 1.0);
  vCorner = aCorner;
  
  float alpha = clamp(0.18 + aShell * 0.44 + speed * 0.025 + aAccent * 0.06, 0.12, 0.95);
  // Incrementamos brillo global cuando se agrupan
  vAlpha = mix(alpha, clamp(alpha * 1.35, 0.22, 0.98), uFocusMode) * mix(0.25, 1.0, depth);
  
  vAccent = mix(aAccent, 0.95, uFocusMode * 0.75); // Se vuelven más doradas al enfocarse
  vDepth = depth;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vCorner;
in float vAlpha;
in float vAccent;
in float vDepth;

uniform float uOpacity;

out vec4 outColor;

void main() {
  vec2 p = vec2(vCorner.x * 0.7, vCorner.y);
  float dist = length(p);
  
  float glow = exp(-dist * dist * 3.0);
  float core = exp(-dist * dist * 24.0);

  vec3 white = vec3(0.96, 0.97, 1.0);
  vec3 gold = vec3(0.92, 0.72, 0.36);
  vec3 copper = vec3(0.85, 0.52, 0.24);
  
  vec3 color;
  if (vAccent > 0.6) {
    color = mix(gold, vec3(0.98, 0.85, 0.58), (vAccent - 0.6) / 0.4);
  } else if (vAccent > 0.2) {
    color = mix(copper, gold, (vAccent - 0.2) / 0.4);
  } else {
    color = mix(white, copper, vAccent / 0.2);
  }

  color *= 0.45 + core * 1.25 + vDepth * 0.15;

  float alpha = vAlpha * glow * glow * uOpacity;
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
      Math.round((window.innerWidth * window.innerHeight) / 9500), // Densidad súper baja (estilo imagen fondo estrellas sueltas)
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
      uOpacity: glContext.getUniformLocation(program, "uOpacity"),
      uFocusMode: glContext.getUniformLocation(program, "uFocusMode"),
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
    let entranceOpacity = 0.0;
    let targetFocusMode = 0.0;
    let focusMode = 0.0;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
      const width = Math.max(1, Math.round(window.innerWidth * dpr));
      const height = Math.max(1, Math.round(window.innerHeight * dpr));

      canvasEl.width = width;
      canvasEl.height = height;
      canvasEl.style.width = `${window.innerWidth}px`;
      canvasEl.style.height = `${window.innerHeight}px`;
      glContext.viewport(0, 0, width, height);
    }

    function handlePointerMove(event: PointerEvent) {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      targetPointer.x = clamp((x - 0.5) * 2, -1, 1);
      targetPointer.y = clamp((y - 0.5) * 2, -1, 1);
    }

    function handlePointerLeave() {
      targetPointer = { x: 0, y: 0 };
    }

    // Oyentes globales de foco en cualquier input (para agrupar partículas alrededor del login)
    function handleFocusIn(event: FocusEvent) {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        targetFocusMode = 1.0;
      }
    }

    function handleFocusOut() {
      targetFocusMode = 0.0;
    }

    function draw(timestamp: number) {
      const time = timestamp * 0.001;

      pointer.x += (targetPointer.x - pointer.x) * 0.08;
      pointer.y += (targetPointer.y - pointer.y) * 0.08;

      if (entranceOpacity < 1.0) {
        entranceOpacity = Math.min(1.0, entranceOpacity + 0.008);
      }

      // Transición suave de focusMode
      focusMode += (targetFocusMode - focusMode) * 0.06;

      glContext.clear(glContext.COLOR_BUFFER_BIT);
      glContext.useProgram(program);
      glContext.bindVertexArray(vao);

      if (uniforms.uTime) glContext.uniform1f(uniforms.uTime, time);
      if (uniforms.uResolution) {
        glContext.uniform2f(uniforms.uResolution, canvasEl.width, canvasEl.height);
      }
      if (uniforms.uPointer) glContext.uniform2f(uniforms.uPointer, pointer.x, pointer.y);
      if (uniforms.uOpacity) glContext.uniform1f(uniforms.uOpacity, entranceOpacity);
      if (uniforms.uFocusMode) glContext.uniform1f(uniforms.uFocusMode, focusMode);

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
    resizeObserver.observe(document.body);
    resize();

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      if (frameId !== 0) cancelAnimationFrame(frameId);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
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
