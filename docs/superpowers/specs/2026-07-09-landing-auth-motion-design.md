# Motion y presentación premium — Landing + Auth (Fase 1)

## Objetivo

Elevar la landing pública (`app/(public)/page.tsx`) y las páginas de autenticación
(`login`, `registro`, `recuperar-password`, `actualizar-password`) a un nivel de
motion y pulido visual inspirado en Apple, Cursor, Linear y Antigravity: scroll
reveals con profundidad, parallax sutil, glow de cursor, transiciones fluidas
entre estados y entre páginas. Sin añadir secciones de contenido nuevas — se
trata de pulir lo existente, no de expandir la landing.

Esta es la Fase 1 de un esfuerzo en dos fases. La Fase 2 (dashboard de
estudiante) hereda el sistema de motion definido aquí y se especifica por
separado más adelante.

## Decisiones confirmadas

- **Librería de animación:** Framer Motion (ya es dependencia del proyecto y ya
  se usa en `LoginForm.tsx`/`LoginBranding.tsx`). No se añaden GSAP ni otras
  librerías de animación.
- **Alcance de contenido:** solo se pulen las secciones existentes (Hero,
  Catálogo de cursos, panel de marca de Auth, formularios de Auth). No se
  agregan secciones nuevas (sin "método", sin testimonios, sin CTA final
  nuevo) en esta fase.
- **Referencias visuales:** antes de tocar código de producción se generan 3
  imágenes de referencia horizontales con `/imagegen-frontend-web` (Hero,
  Catálogo, panel de marca de Auth) para fijar la dirección visual concreta.
  Son referencias de estilo/composición, no assets finales del sitio.
- **Calibración de motion:** timing, easing y "feel" de cada micro-interacción
  se calibran siguiendo los principios de `/emil-design-eng` (curvas de
  easing intencionales, duración proporcional a la distancia recorrida, nada
  de rebote gratuito).
- **Estilo del fondo del Hero:** se evoluciona el lenguaje SVG de
  líneas/puntos existente (`HeroBackground.tsx`), no se reemplaza por mesh
  gradient ni por imagen generada como fondo real.
- **Header:** gana estado "compacto" al hacer scroll (blur + borde inferior),
  con indicador de link activo que se desliza (`layoutId`).
- **Cursor:** glow radial dorado que sigue el cursor con inercia (`useSpring`)
  en Hero y cards del Catálogo; se desactiva en touch/mobile (no hay cursor) y
  con `prefers-reduced-motion`.

## Arquitectura de archivos

```
lib/motion.ts                        (nuevo) — variantes compartidas, hook useScrollReveal,
                                                helper de reduced-motion
components/motion/CursorGlow.tsx     (nuevo) — glow que sigue al cursor, reutilizable
components/SiteHeader.tsx            (nuevo, extraído del header actual de page.tsx)

app/(public)/page.tsx                (modificado) — usa SiteHeader, aplica variantes de lib/motion
app/(public)/HeroBackground.tsx      (modificado) — capas con parallax vía useTransform
app/(public)/CatalogoList.tsx        (modificado) — stagger reveal
app/(public)/CursoCard.tsx           (nuevo, extraído de CatalogoList) — hover elevado + borde iluminado
app/(public)/layout.tsx              (modificado o nuevo) — AnimatePresence para transición entre rutas de (public)

app/(public)/login/LoginBranding.tsx     (modificado) — parallax del SVG compartido
app/(public)/login/LoginForm.tsx         (modificado) — homologa hover/press con Hero
app/(public)/registro/*                  (modificado) — mismo tratamiento que login
app/(public)/recuperar-password/*        (modificado) — mismo tratamiento
app/(public)/actualizar-password/*       (modificado) — mismo tratamiento
```

## `lib/motion.ts`

- `fadeUp`, `fadeIn`, `scaleIn`: variantes de Framer Motion con easing
  `[0.16, 1, 0.3, 1]` (el easeOutExpo ya usado en el proyecto).
- `staggerContainer(delayChildren?, staggerChildren?)`: helper que devuelve una
  variante contenedora para orquestar entradas secuenciales (hero, cards).
- `useScrollReveal()`: wrapper sobre `whileInView` + `viewport={{ once: true,
  margin: "-10% 0px" }}` para que las secciones/tarjetas entren una sola vez
  al cruzar el viewport.
- `useReducedMotionSafe()`: envuelve `useReducedMotion` de Framer Motion; los
  componentes que lo consumen deben desactivar parallax/glow de cursor y
  dejar solo fades cortos (~150ms) cuando devuelve `true`. Esto es necesario
  porque el CSS global (`prefers-reduced-motion` en `globals.css`) solo cubre
  animaciones/transiciones CSS, no los transforms inline que aplica Framer
  Motion vía JS.

## `components/motion/CursorGlow.tsx`

- Client component. Usa `useMotionValue` + `useSpring` sobre `onMouseMove` del
  contenedor padre para posicionar un `radial-gradient` dorado de baja
  opacidad (`~0.08–0.12`) que sigue al cursor con inercia suave.
- Se monta condicionalmente: no se renderiza si `useReducedMotionSafe()` es
  `true`, y se ignora en dispositivos sin `hover`/`pointer: fine` (media query
  o `window.matchMedia`).
- Reutilizado en Hero y en `LoginBranding`/panel de marca de Auth.

## `SiteHeader.tsx`

- Extraído del `<header>` inline actual de `page.tsx` para poder reutilizarlo
  si hace falta en Auth más adelante.
- Usa `useScroll` de Framer Motion: entre 0 y ~80px de scroll interpola
  (`useTransform`) padding vertical, opacidad de fondo y blur, con spring
  suave (`useSpring` sobre el progreso) — sin salto brusco de estado.
- El link activo (si aplica) tiene un indicador que se desliza con
  `layoutId="nav-indicator"` entre ítems.

## Hero (`page.tsx` + `HeroBackground.tsx`)

- `HeroBackground.tsx` separa el SVG actual en 3 grupos (líneas de fondo,
  líneas medias, puntos/partículas). Cada grupo recibe un `useTransform` sobre
  `scrollYProgress` de la sección para moverse a velocidad distinta
  (parallax), además de mantener el `drift` infinito existente como
  movimiento ambiental de fondo.
- `CursorGlow` se superpone detrás del contenido del hero, delante del SVG.
- El badge, headline, subtítulo, CTAs y stats pasan de clases
  `animate-fade-up` (CSS) a un único `motion.div` contenedor con
  `staggerContainer` + variantes `fadeUp` por hijo — la secuencia de entrada
  queda orquestada en un solo lugar en vez de delays sueltos por elemento.
- CTAs: `whileHover={{ scale: 1.02, boxShadow: ... }}`,
  `whileTap={{ scale: 0.98 }}` con transición corta y crisp (~120–150ms,
  siguiendo el principio de emil-design-eng de que el "press" debe sentirse
  inmediato).

## Catálogo (`CatalogoList.tsx` + `CursoCard.tsx` nuevo)

- El heading de la sección y el contenedor de la lista usan
  `useScrollReveal()`.
- `CursoCard.tsx` (extraído): `motion.li` con variante `fadeUp` dentro de un
  `staggerContainer` en `CatalogoList` (stagger ~60–80ms entre cards).
- Hover: `whileHover={{ y: -4 }}` + transición del `border`/sombra a un
  gradiente dorado sutil (vía cambio de clase o `boxShadow` animado) — nunca
  con `transition-all` genérico, transiciones específicas por propiedad.
- El precio hace un fade-in corto al entrar en viewport (parte del mismo
  `fadeUp` del card, no una animación de conteo numérico — se descarta
  count-up por complejidad innecesaria para el valor que aporta).

## Auth (Login / Registro / Recuperar / Actualizar password)

- El panel de marca (`LoginBranding.tsx` y equivalente donde exista en
  Registro) reutiliza el `HeroBackground` evolucionado (con parallax) en vez
  de mantener su propio SVG estático duplicado, y añade `CursorGlow`.
- Inputs: el `ring` de foco dorado pasa de transición CSS instantánea a una
  transición de opacidad/escala vía Framer Motion (`AnimatePresence` sobre un
  pseudo-elemento de foco), para que el "encendido" del glow se sienta
  fluido.
- Botón primario y botón de Google homologan su `whileHover`/`whileTap` con
  el de los CTAs del Hero (mismo lenguaje de interacción en todas las
  superficies de acción del sitio).
- Transición entre rutas de `(public)` (Login ↔ Registro, y hacia/desde
  Recuperar/Actualizar contraseña): se añade `template.tsx` (no `layout.tsx`,
  para que se re-monte por navegación) en `app/(public)/` con `AnimatePresence
  mode="wait"` y un cross-fade corto (~150–200ms) entre páginas, evitando el
  corte seco actual.

## Accesibilidad y performance

- Todo motion no trivial (parallax, cursor glow, stagger) respeta
  `useReducedMotionSafe()`: con la preferencia activada, se recorta a fades de
  ~150ms sin transforms de posición ni glow de cursor.
- `CursorGlow` y el parallax del Hero usan `useMotionValue`/`useSpring`
  exclusivamente (no `setState` en cada evento de `mousemove`/`scroll`) para
  evitar re-renders y mantener 60fps.
- No se modifica ningún `focus-visible:ring` ni estructura de `aria-*`
  existente; el motion se añade alrededor de la accesibilidad ya validada en
  el spec de login (`2026-07-07-login-redesign-design.md`), no la reemplaza.
- `AnimatePresence` de transición entre rutas no debe robar el foco del
  teclado ni bloquear el anuncio de errores (`role="alert"`) de los
  formularios.

## Fuera de alcance

- Cambios de paleta/tokens en `tailwind.config.ts`.
- Secciones nuevas de contenido en la landing (método, testimonios, CTA
  final, footer extendido).
- Fase 2 (dashboard de estudiante, cursos, etc.) — spec separado posterior.
- Imágenes generadas como asset final de producción (solo como referencia de
  diseño previa a la implementación).
- Efectos 3D/canvas o animaciones cinemáticas de scroll-storytelling
  (descartado en la fase de brainstorming a favor de "scroll-driven con
  profundidad" moderado).

## Testing

- Actualizar tests existentes (`LoginForm.test.tsx`, `CatalogoList.test.tsx`)
  para que sigan pasando con la nueva estructura de componentes
  (`CursoCard.tsx` extraído, wrappers de motion).
- Nuevo test para `CursoCard.tsx`: render de datos, no debe romperse si
  `useReducedMotionSafe()` devuelve `true` (mockear `useReducedMotion` de
  framer-motion).
- Verificación manual (no automatizable con vitest/jsdom): efecto de parallax,
  glow de cursor y transición entre rutas se validan corriendo `next dev` y
  probando en navegador, incluyendo con "reduce motion" activado en el SO.
