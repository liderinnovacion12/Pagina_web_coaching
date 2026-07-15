# Hero scroll parallax — diseño

## Contexto

Se investigaron 5 sitios con estética "3D premium" (andrewcunliffe.ai, vibemeai.net,
alkares.com, b150.ai, scheer-imc.com) para identificar qué adoptar en la landing
pública de Team 100% Real Estate. Fetch del HTML crudo (sin ejecutar JS) mostró:

- **alkares.com**: GSAP + ScrollTrigger, Lenis (scroll inercial), Barba.js
  (transiciones SPA), shaders WebGL/GLSL propios.
- **b150.ai**: GSAP + ScrollTrigger + Lenis, más contenido.
- **andrewcunliffe.ai**: Next.js + Turbopack (mismo motor que este proyecto) +
  Framer Motion + canvas/WebGL + Lenis. El más cercano arquitectónicamente.
- **vibemeai.net**: Next.js + Turbopack, sin firmas claras en el HTML estático
  (no investigado a fondo — fuera de alcance de este spec).
- **scheer-imc.com**: landing de marketing (HubSpot) de un producto de training
  gamificado, sin señales de WebGL — no aporta técnica visual relevante aquí.

Patrón común en los tres sitios "3D reales": no es 3D en toda la página, es un
elemento canvas/WebGL puntual (hero) + animación **ligada al scroll** (no solo
on-mount) + scroll suave.

El proyecto ya tiene un elemento WebGL de nivel comparable: `ParticleField`
(`components/motion/ParticleField.tsx`), un sistema de partículas WebGL2
instanciado con shaders GLSL propios, reactivo al cursor, usado en `/login` y en
la landing (`app/(public)/page.tsx`). Lo que falta frente a los sitios de
referencia es la reactividad al **scroll**: hoy `ParticleField` es
`position: fixed`, no cambia con el scroll, y al no tener el `<section id="cursos">`
un fondo opaco propio, el canvas de partículas queda visible detrás del catálogo
de cursos indefinidamente en vez de desvanecerse al salir del hero.

## Decisión de alcance (confirmada con el usuario)

- Solo la **landing pública, sección hero** (`app/(public)/page.tsx` +
  `HeroBackground.tsx` + `HeroContent.tsx` + el uso de `ParticleField` ahí). No
  se toca `/login` ni `/recuperar-password`, que usan `ParticleField` con su
  propio "focus mode" — quedan intactos.
- **Sin nuevas dependencias**: no se suma GSAP, ScrollTrigger, Lenis ni Three.js.
  Todo se implementa con `framer-motion` (`useScroll` + `useTransform`), que ya
  está instalado y es la única librería de animación permitida por
  `docs/design-system.md`.
- Primer paso de una posible secuencia mayor. El tilt 3D por cursor en
  `HeroContent` (explorado como "Opción 2" en la conversación) queda **fuera de
  este spec** — se evaluará después de validar este cambio en el navegador.

## Diseño

### Comportamiento objetivo

Al hacer scroll desde el tope de la página hacia `#cursos`:

1. El fondo del hero (`HeroBackground` + `ParticleField`) se desvanece
   (`opacity` 1 → 0) y se desplaza ligeramente hacia arriba/abajo (parallax),
   en vez de quedar fijo y visible por siempre detrás del catálogo.
2. `HeroContent` se mueve a una velocidad de desplazamiento ligeramente distinta
   a la del fondo (offset de `y` menor), reforzando la sensación de profundidad
   por capas.
3. El progreso de scroll se mide sobre la altura del propio contenedor del hero
   (no de toda la página), así el efecto termina de resolverse justo antes de
   llegar al catálogo.

### Implementación técnica

- En `app/(public)/page.tsx`, el `<div>` que envuelve `HeroBackground` +
  `ParticleField` + `HeroContent` pasa a ser un componente cliente propio (o se
  extrae la lógica de scroll a un wrapper `HeroScrollLayer` dentro de
  `app/(public)/`) que:
  - Toma un `ref` sobre el contenedor del hero.
  - Usa `useScroll({ target: heroRef, offset: ["start start", "end start"] })`
    de Framer Motion para obtener `scrollYProgress` acotado a la sección hero.
  - Deriva con `useTransform`:
    - `bgOpacity`: `1 → 0`
    - `bgY`: `0 → ~80px` (fondo, parallax más lento)
    - `contentY`: `0 → ~40px` (contenido, se mueve menos que el fondo)
- `HeroBackground` se envuelve en un `motion.div` con
  `style={{ opacity: bgOpacity, y: bgY }}` (fondo con fade + parallax). El
  wrapper de `ParticleField` recibe **solo** `style={{ opacity: bgOpacity }}`
  (sin `y`): se descartó aplicarle también el parallax porque eso convertiría
  a ese wrapper en el *containing block* del `position: fixed` interno del
  canvas (regla CSS: un `transform` en un ancestro "atrapa" a los
  descendientes `fixed`), lo cual interactúa mal con que `ParticleField` fija
  el tamaño del `<canvas>` vía JS a `window.innerWidth/innerHeight` — el
  canvas terminaría recortado/mal alineado dentro del wrapper en vez de
  cubrir el viewport limpiamente. En su lugar, el bug de que el canvas se vea
  detrás del catálogo de cursos se resuelve solo con el fade de opacidad: al
  llegar a `scrollYProgress = 1`, `bgOpacity` es `0` y el canvas (aunque
  sigue técnicamente `fixed` al viewport) queda invisible.
- `HeroContent` se envuelve en un `motion.div` con `style={{ y: contentY }}`
  dentro de `HeroScrollLayer` — no recibe un prop `style` propio, sus
  animaciones de entrada (`stagger`/`blurFadeUp`) internas no se tocan.

### Accesibilidad

- Reutiliza el hook existente `useReducedMotionSafe` (`lib/motion.ts`). Si
  `prefers-reduced-motion` está activo, los `useTransform` no se aplican
  (valores estáticos: `opacity: 1`, `y: 0`), igual que ya hace `ParticleField`
  al desactivarse por completo con reduced motion.
- No cambia ningún contraste, foco ni estructura semántica existente.

### Testing

- `HeroBackground.test.tsx` y `HeroContent.test.tsx` existentes probablemente
  necesiten un mock de `useScroll`/`IntersectionObserver`/`matchMedia` en jsdom
  (Framer Motion's `useScroll` depende de APIs de scroll del DOM real). Se
  revisa en el plan de implementación qué mocks ya existen en
  `vitest.setup.ts` y se añaden los que falten.
- Verificación manual en navegador (`npm run dev`) es obligatoria antes de dar
  el cambio por terminado: confirmar que el fondo se desvanece al hacer scroll,
  que no hay salto/flash, y que `/login` sigue viéndose exactamente igual (no
  debe haber regresión ahí).

## Fuera de alcance

- Tilt 3D por cursor en `HeroContent` (Opción 2 — pendiente, a evaluar después).
- Lenis / scroll suave global del sitio.
- Cualquier cambio a `/login`, `/recuperar-password`, dashboard o catálogo de
  cursos más allá de que el canvas de partículas ya no se filtre detrás de
  `#cursos`.
- vibemeai.net y scheer-imc.com no se investigaron a fondo (no aportaron señales
  técnicas claras vía fetch estático) — si se quiere inspeccionar su JS en
  runtime más adelante, requiere un navegador real, no `curl`.
