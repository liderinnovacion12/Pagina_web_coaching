# Bienvenida — paneles horizontales tipo alkares.com (Cabecera + Video)

## Contexto

Cuarta iteración sobre la página de Bienvenida (`/dashboard`), sobre lo ya
construido en los tres ciclos anteriores (`bienvenida-scroll-reveal`,
`bienvenida-choreografia`, `bienvenida-entrada-lateral`). El usuario compartió
un video de referencia de alkares.com mostrando un patrón de "scrollytelling"
horizontal: el scroll vertical nativo se traduce en desplazamiento horizontal
de paneles a pantalla completa, con transición de fondo negro→blanco, zoom en
imágenes, y revelado de texto por panel.

Nota: no se tuvo acceso directo al archivo de video — el diseño se basa en la
descripción textual del usuario más el research previo de alkares.com ya
documentado en este proyecto (grilla de tarjetas entrando desde el borde,
usado como base de `bienvenida-entrada-lateral`).

Decisión previa documentada en
`docs/superpowers/specs/2026-07-16-fase-a-reorganizacion-premium-design.md`
("Explícitamente fuera de este proceso") excluía cualquier librería nueva
(GSAP, Lenis, Three.js). Se mantiene esa decisión: esta feature se construye
con `framer-motion` (ya instalado), sin dependencias nuevas.

## Alcance

Solo `app/(estudiante)/dashboard/DashboardContent.tsx` (secciones **Cabecera
Principal** y **Video de Bienvenida** únicamente) y un componente nuevo,
`components/estudiante/dashboard/HorizontalIntroPanels.tsx`. Ninguna otra
página ni sección de Bienvenida.

Decisiones de alcance confirmadas con el usuario:

- **Solo desktop** (`lg:` / ≥1024px). En mobile/tablet se mantiene sin
  cambios el layout vertical actual de esas dos secciones.
- **Solo Cabecera + Video** se convierten en paneles horizontales — el resto
  de Bienvenida (Banner WhatsApp, Dos Columnas, Cultura y Equipo, Team
  Leaders, Misión y Visión, Nuestros Valores, Filosofía de Equipo, Galería
  del Equipo) continúa exactamente con la coreografía vertical ya construida
  en los ciclos anteriores, sin tocar.
- **Tema oscuro/dorado sin cambios** — no se replica la transición negro→
  blanco de la referencia; en su lugar se usa un glow radial dorado (mismo
  recurso ya usado en `HeroBackground.tsx`/`ParticleField.tsx`) como
  sustituto, manteniendo coherencia con el resto de la plataforma.

## Diseño

### 1. Arquitectura del pin + scrub horizontal

Mecanismo (sin GSAP, con `framer-motion`):

```tsx
const runwayRef = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({
  target: runwayRef,
  offset: ["start start", "end end"],
});
const trackX = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
```

- Contenedor "runway": `<div ref={runwayRef} className="relative h-[200vh]">`
  — la altura extra es el recorrido de scroll a consumir para completar la
  transición entre los 2 paneles (100vh de "asentamiento" por panel).
- Contenedor pin: `<div className="sticky top-0 h-screen overflow-hidden">`
  dentro del runway — queda fijo en pantalla mientras el runway se desliza
  por debajo.
- Track: `<motion.div style={{ x: trackX }} className="flex h-full w-[200vw]">`
  con 2 hijos de `w-screen h-full shrink-0` (Panel Cabecera, Panel Video).
  `trackX` va de `"0%"` a `"-50%"` del ancho del track (200vw), es decir
  0 → -100vw, deslizando el panel 2 a la vista.
- Efectos internos de cada panel usan sub-rangos del mismo `scrollYProgress`
  (ej. `[0, 0.5]` dominante panel 1, `[0.5, 1]` dominante panel 2) vía
  `useTransform` adicionales — sin necesidad de `ScrollTrigger`.

### 2. Contenido y efectos por panel

**Panel 1 — Cabecera:**

- Título "Bienvenido a `<span className="text-gradient-gold">Team 100% Real
  Estate</span>`" escala de `text-[46px] sm:text-[54px]` (tamaño actual) a
  `text-[110px] lg:text-[140px]` — técnica "escala tipográfica dramática" ya
  listada en el toolkit de Fase A.
- Glow radial dorado (`radial-gradient`, mismo patrón que
  `HeroBackground.tsx`) crece en opacidad/tamaño desde la parte inferior del
  panel a medida que avanza el progreso local (`useTransform(scrollYProgress,
  [0, 0.5], [0, 1])` sobre `opacity`/`scale` del glow).
- El título tiene un parallax horizontal sutil, más lento que el track del
  panel (mismo patrón de capas a velocidad diferencial que
  `HeroScrollLayer` ya usa en el Hero de la landing pública):
  `useTransform(scrollYProgress, [0, 0.5], [0, -40])` aplicado como `x`
  adicional sobre el título (no sobre todo el panel).

**Panel 2 — Video:**

- El video (mismo `<div className="relative aspect-video overflow-hidden
  rounded-xl"><iframe ... /></div>` que ya existe hoy, sin marco ni etiqueta,
  igual que quedó en `bienvenida-entrada-lateral`) entra deslizando con el
  track.
- Al activarse (progreso local `[0.5, 0.75]`) hace zoom-in sutil:
  `useTransform(scrollYProgress, [0.5, 0.75], [0.94, 1])` sobre `scale`.
- El subtítulo existente ("by Wilmar Sosa y Samuel Oropeza") se revela con
  fade + `translateY` en el mismo rango, reutilizando el patrón
  `opacity`/`y`/`blur` ya usado en `revealUp`.

### 3. Accesibilidad y fallbacks

- **Un solo condicional decide la versión a renderizar:** `isDesktop &&
  !reducedMotion` → paneles horizontales; en cualquier otro caso (mobile,
  tablet, o `prefers-reduced-motion` activo) → se renderiza el JSX vertical
  actual de Cabecera + Video, sin cambios. Se evita un estado intermedio
  raro (pin fijo sin movimiento se vería roto).
- **Hook nuevo `useIsDesktop()`** (no existe hoy en el codebase), basado en
  `window.matchMedia("(min-width: 1024px)")`. Retorna `false` por defecto
  en SSR (evita hydration mismatch); un usuario desktop con JS lento ve el
  layout vertical por un instante antes de hidratar.
- **Contenido enfocable fuera de pantalla:** mientras el panel Video está
  desplazado fuera de vista, su `iframe` no debe ser alcanzable con Tab ni
  expuesto a lectores de pantalla. Se deriva un booleano de
  `scrollYProgress` con `useMotionValueEvent` (cruce de umbral en 0.5) y se
  aplica `inert` al panel inactivo — mismo mecanismo que `ScrollReveal` ya
  usa en el resto de la página, aplicado aquí a nivel de panel.

### 4. Testing

- Tests unitarios de `HorizontalIntroPanels.tsx`: con `isDesktop=false` o
  `reducedMotion=true` (mockeados vía `vi.mock`) se renderiza el contenido
  vertical original (mismo texto del H1, mismo `iframe`); con ambos `true`
  se renderiza la estructura de paneles (roles/textos presentes, sin
  verificar valores exactos de transform).
- Verificación manual en navegador (Playwright, como en ciclos anteriores):
  - Viewport desktop (≥1024px): el scroll vertical se traduce en
    desplazamiento horizontal fluido entre los 2 paneles.
  - El panel Video no es alcanzable por teclado (Tab) mientras está fuera
    de vista (panel Cabecera activo).
  - Viewport mobile (<1024px): el layout es idéntico al actual, sin
    paneles ni scroll horizontal.
  - Con `prefers-reduced-motion: reduce` activado en desktop: también cae
    al layout vertical (no queda "pineado" sin movimiento).

## Fuera de alcance

- Cualquier otra sección de Bienvenida (Banner WhatsApp, Dos Columnas,
  Cultura y Equipo, Team Leaders, Misión y Visión, Nuestros Valores,
  Filosofía de Equipo, Galería del Equipo).
- Cualquier otra página de la plataforma (incluida la landing pública `/`).
- Nuevas dependencias (GSAP, Lenis, Three.js, Spline, etc.).
- Transición de fondo negro→blanco literal de la referencia.
- Comportamiento de scroll horizontal en mobile/tablet.
- El ajuste de aspect-ratio de fotos de Team Leaders (resuelto aparte, commit
  `4db75b8`, fuera de este ciclo).
