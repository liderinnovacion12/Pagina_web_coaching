# Fase B — Bienvenida: revelado por scroll

## Contexto

Primera página de la Fase B (reconstrucción sección por sección), dentro del
proceso de rediseño total acordado en
`docs/superpowers/specs/2026-07-16-fase-a-reorganizacion-premium-design.md`.

El usuario pidió el efecto de "transición con el scroll" de alkares.com
aplicado a la página de Bienvenida (`app/(estudiante)/dashboard/`), con
estilo minimalista. Se investigó el sitio con Playwright (scroll real,
capturas paso a paso): alkares usa un patrón de **pin de GSAP ScrollTrigger**
— una sección queda fija en pantalla durante ~3600px de scroll mientras su
contenido interno se transforma (título gigante se atenúa a fondo, tarjetas
se deslizan horizontalmente).

**Decisión (acordada con el usuario):** no replicar el pin/scroll-jacking
literal — es una técnica de portafolio de agencia que introduce fricción en
una página cuyo objetivo es que el estudiante llegue rápido a su contenido,
y requeriría GSAP (dependencia nueva, ya descartada en la Fase A). En su
lugar, se traduce la *sensación* (la página se revela a medida que se
scrollea, en vez de aparecer toda junta) usando el mecanismo ya disponible
en el proyecto: revelado por sección basado en `whileInView` de Framer
Motion, sin pin, sin dependencias nuevas.

## Alcance

Solo `app/(estudiante)/dashboard/` (`page.tsx` + `DashboardContent.tsx`).
Ninguna otra página de la Fase A se toca en este spec.

## Las 10 secciones actuales

En el orden en que aparecen hoy en `DashboardContent.tsx`:

1. Cabecera Principal (H1 + subtítulo)
2. Video de Bienvenida (embed Loom)
3. Banner de Comunidad WhatsApp
4. Dos columnas: Cómo Usar la Plataforma + Accesos Rápidos
5. *(separador visual, sin contenido propio — no lleva revelado propio)*
6. Cabecera Cultura y Equipo
7. **Team Leaders** (tratamiento protagonista, ver más abajo)
8. Misión & Visión
9. Nuestros Valores
10. Filosofía de Equipo
11. Galería de Equipo

## Diseño

### 1. De "todo junto al cargar" a "cada sección al hacer scroll"

Hoy, `DashboardContent.tsx` envuelve **todo** el contenido en un único
`motion.div` con `variants={containerVariants}` +
`initial="hidden" animate="visible"` — todas las secciones animan juntas,
una sola vez, apenas monta la página (con `staggerChildren` para el
desfase entre ellas). Esto se reemplaza por: cada una de las 10 secciones
se convierte en su propio punto de disparo, usando `whileInView` en vez de
`animate`, con la constante `SCROLL_REVEAL_VIEWPORT` que ya existe en
`lib/motion.ts` (`{ once: true, margin: "-10% 0px" }`) pero hoy no se usa en
ningún lugar del proyecto:

**Corrección tras verificación manual:** la primera implementación usó
`whileInView` directamente (prop de Framer Motion). Se descubrió en
verificación en navegador que `whileInView` **no oculta el contenido en el
HTML renderizado por el servidor** — es un comportamiento intencional de
Framer Motion (para no dejar contenido invisible si JavaScript falla en
cargar), pero como efecto secundario, en una carga fresca de `/dashboard`
(recarga, URL directa, pestaña nueva) **todas las secciones aparecen
visibles de inmediato, sin revelado alguno** — contrario al objetivo de este
spec. Se reemplaza por un componente compartido `ScrollReveal`
(`components/motion/ScrollReveal.tsx`) que usa el hook `useInView` +
la prop `animate` (en vez de la prop `whileInView`) — `animate` sí respeta
el estado inicial oculto durante el renderizado en servidor (es el mismo
mecanismo que ya usa `HeroContent.tsx` con éxito), y `useInView` retorna
`false` en el servidor, así que el HTML inicial sale oculto de verdad:

```tsx
// components/motion/ScrollReveal.tsx
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
  children: ReactNode;
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
```

Uso en `DashboardContent.tsx` — cada uno de los puntos de disparo (bloque
único o grilla) se envuelve con `<ScrollReveal>` en vez del `motion.div`
crudo:

```tsx
// Patrón para una sección de bloque único (ej. Cabecera, Video, Banner WhatsApp,
// Cabecera Cultura, Misión/Visión, Filosofía):
<ScrollReveal variants={cardVariants}>
  {/* contenido de la sección, sin cambios */}
</ScrollReveal>
```

```tsx
// Patrón para una sección con grilla interna (ej. Team Leaders, Valores,
// Galería, y el bloque de Dos Columnas): el contenedor de la sección dispara
// por scroll, sus hijos mantienen el stagger interno que ya tienen hoy.
<ScrollReveal variants={containerVariants} className="grid gap-6 sm:grid-cols-2">
  {items.map((item) => (
    <motion.div key={item.id} variants={cardVariants}>
      {/* tarjeta, sin cambios */}
    </motion.div>
  ))}
</ScrollReveal>
```

`cardVariants` y `containerVariants` (ya definidos en el archivo, sin
cambios en sus valores) se reutilizan tal cual — el lenguaje visual de la
transición (fade + `y` + blur, ease-out premium) es idéntico al planeado
originalmente, lo único que cambió es el mecanismo de disparo (`ScrollReveal`
con `useInView`+`animate` en vez de `whileInView` crudo), para que funcione
correctamente en cargas frescas de página, no solo en navegación interna
tipo SPA.

`ScrollReveal` vive en `components/motion/` (no en
`components/estudiante/dashboard/`) porque es un primitivo reutilizable —
cualquier página futura de la Fase B que necesite revelado por scroll SSR-
seguro debería usar este mismo componente en vez de reimplementar el patrón
`whileInView` con el mismo bug.

### 2. Team Leaders: sección protagonista

Además del revelado estándar (con un desplazamiento `y` inicial mayor y
duración más larga que el resto — más "peso" al entrar), cada tarjeta de
Team Leader recibe un parallax propio en su foto: la imagen se desplaza a
una velocidad ligeramente distinta que el borde de la tarjeta mientras esa
tarjeta cruza el viewport, usando la misma técnica (`useScroll` +
`useTransform` acotado a un `ref` propio) que ya se construyó para
`HeroScrollLayer` en la landing — no es una técnica nueva, es la que el
proyecto ya usa.

Esto requiere extraer el `.map()` de tarjetas de Team Leader (hoy inline en
`DashboardContent.tsx`) a su propio componente cliente
`components/estudiante/dashboard/TeamLeaderCard.tsx`, porque cada tarjeta
necesita su propio `ref` y su propio `useScroll` (el progreso de scroll de
cada tarjeta es independiente de la otra). El componente:

- Recibe `miembro: MiembroEquipo` (mismo tipo que ya se usa).
- Mantiene exactamente el mismo marcado/clases que la tarjeta actual
  (imagen, degradado, nombre, cargo, teléfono) — foto de fondo, nombre,
  cargo y teléfono no cambian.
- Envuelve la `<Image fill .../>` en un `motion.div` con una posición
  ligeramente más alta que el contenedor (para que el movimiento vertical no
  deje huecos vacíos en los bordes), `style={{ y }}` con `y` derivado de
  `useTransform(scrollYProgress, [0, 1], [-16, 16])` (rango pequeño,
  sutil), y el contenedor de la tarjeta mantiene su `overflow-hidden`
  existente para recortar el exceso.
- Mantiene el `whileHover={{ y: -6 }}` que la tarjeta ya tiene hoy — el
  parallax de scroll y el hover conviven (son transforms en distintos
  elementos: el hover mueve la tarjeta completa, el parallax mueve solo la
  imagen adentro).

### 3. Limpieza de metadata decorativa

Feedback del usuario al revisar el spec: el badge `4 min` en la sección de
Video de Bienvenida (`<span className="rounded-full bg-white/[0.04] ...">4
min</span>`, junto al label "Video de inducción") es información de bajo
valor que no aporta nada al estudiante — se elimina.

Esto es contenido/copy, no mecanismo de revelado, así que amplía
puntualmente el alcance de este spec (que originalmente excluía cambios de
contenido) para este único elemento. No se tocan la etiqueta "Video de
inducción" ni el resto de esa sección.

**Principio general (aplica también a las próximas páginas de la Fase B,
anotado también en la Fase A):** evitar badges/pills decorativos que
muestren metadata de bajo valor (duración, contadores, etiquetas sin
función) — usar ese tipo de elemento solo cuando el dato realmente le sirve
al usuario para decidir algo (ej. el badge de "Completado" en `CursoCard` sí
es información accionable; un badge de "4 min" en un video que se ve una
sola vez no lo es).

### Accesibilidad

- `whileInView` respeta `prefers-reduced-motion` de la misma forma que
  `animate` lo hace hoy: la app ya tiene soporte global (`app/globals.css`,
  mencionado en `docs/design-system.md §7`), y los propios `cardVariants`
  no cambian.
- El parallax de imagen en `TeamLeaderCard` se desactiva bajo reduced motion
  usando el hook existente `useReducedMotionSafe` (mismo patrón que
  `ParticleField`/`HeroScrollLayer`): si `reducedMotion` es `true`, `y` se
  fija en `0` sin aplicar `useTransform`.

### Testing

- `app/(estudiante)/dashboard/page.test.tsx` (existente): sus asserts son
  sobre contenido (headings, links, cantidad de fotos), no sobre el momento
  en que se dispara la animación — no debería requerir cambios, pero se
  verifica en el plan. jsdom no ejecuta `IntersectionObserver` de forma
  realista (ya está stubbeado en `vitest.setup.ts` para no fallar), así que
  los tests seguirán verificando presencia/contenido, no comportamiento de
  scroll.
- `components/estudiante/dashboard/TeamLeaderCard.test.tsx` (nuevo): test de
  render directo del componente extraído (nombre, cargo, teléfono con
  `href="tel:..."`, imagen con `alt` correcto), siguiendo el patrón de
  mocking de `useReducedMotionSafe` ya usado en `HeroBackground.test.tsx`/
  `HeroScrollLayer.test.tsx`.
- Verificación manual en navegador: confirmar que cada sección se revela al
  llegar a ella con el scroll (no todas juntas al cargar), que Team Leaders
  se siente más "pesada"/protagonista que el resto, que el parallax de las
  fotos es sutil (no marea, no genera huecos en los bordes), y que
  `prefers-reduced-motion: reduce` deja todo estático y visible de
  inmediato.

## Fuera de alcance

- Pin/scroll-jacking al estilo alkares (descartado explícitamente).
- GSAP, Lenis o cualquier dependencia nueva.
- Cambios de contenido, copy, o al orden de las 10 secciones — este spec es
  puramente sobre el mecanismo de revelado, no reorganiza qué dice cada
  sección (eso ya se decidió que no aplica para Bienvenida en la Fase A).
  Única excepción: el badge `4 min` (ver "3. Limpieza de metadata
  decorativa" arriba), que se elimina por ser metadata de bajo valor.
- Cualquier otra página de la Fase A.
