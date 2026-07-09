# Vórtice de partículas + tarjetas con glow al hover — Landing + Auth

## Objetivo

Llevar a producción el fondo de partículas (vórtice respirante con líneas de
cometa) y el tratamiento de tarjetas con brillo al hover, validados de forma
iterativa en un mockup interactivo, sobre el Hero de la landing y el panel de
marca de `/login`, y sobre las tarjetas del catálogo de cursos y los cuatro
paneles de formularios de Auth. Extiende el sistema de motion de la Fase 1
(`docs/superpowers/specs/2026-07-09-landing-auth-motion-design.md`) sin
agregar secciones de contenido nuevas.

## Decisiones confirmadas

- **Motor de partículas: Canvas 2D a medida, sin dependencia nueva.**
  Se evaluó tsParticles, pero el diseño final (partículas en radios/"spokes"
  que respiran en conjunto de forma sincronizada, con deriva libre
  independiente por partícula, orientación de estela tangente al radio, e
  inclinación magnética + parallax hacia el cursor) es física completamente a
  medida sin equivalente en los presets de tsParticles. Replicarla dentro del
  sistema de plugins de tsParticles sería más código y más fragil que portar
  la implementación en Canvas ya validada en el mockup. Se mantiene la
  decisión original de no sumar dependencias de animación.
- **Colores:** tokens ya existentes (`gold-400`/`gold-500` como acento,
  `mist-400`/`mist-500` como neutro), sin tocar `tailwind.config.ts`. Acento
  dorado en ~12% de las partículas (dirección "acento mínimo", la más cercana
  a Cursor.com de las dos exploradas en el mockup).
- **Alcance de partículas:** Hero (`app/(public)/page.tsx`) y panel de marca
  de `/login` (`LoginBranding.tsx`) — mismas dos superficies que ya comparten
  `HeroBackground`/`CursorGlow` hoy. `registro`, `recuperar-password` y
  `actualizar-password` no tienen panel de marca (layout de una sola columna)
  y no se les agrega uno como parte de este trabajo.
- **Alcance de glow en tarjetas:** `CatalogoCursoCard.tsx` y el panel
  `rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12` compartido
  por las cuatro páginas de Auth (`login`, `registro`, `recuperar-password`,
  `actualizar-password`).
- **Tipo de glow:** solo al hover (`border-color` + `box-shadow`), quietas en
  reposo — no hay animación constante. Se descartó la primera versión (borde
  con gradiente cónico rotando permanentemente) por sentirse ocupada/ruidosa
  en reposo.
- **Fuera de alcance:** el rediseño más amplio "estilo Cursor" (cambio de
  paleta a nivel de tokens, rehacer layout de secciones, aplicar a toda la
  plataforma interna) discutido y descompuesto en fases A–D queda aparte, sin
  iniciar. Este spec cubre únicamente las dos piezas ya prototipadas y
  aprobadas: el vórtice de partículas y el glow de tarjetas.
- **Accesibilidad/perf:** `ParticleField` no se monta si
  `useReducedMotionSafe()` es `true` (mismo patrón que `CursorGlow`); pausa su
  loop de `requestAnimationFrame` cuando su contenedor sale del viewport
  (`IntersectionObserver`); no usa `setState` por frame (dibuja
  imperativamente sobre el canvas, igual que el resto del sistema de motion).

## `components/motion/ParticleField.tsx`

Client component sin props, mismo formato que `CursorGlow.tsx`. Un solo
`<canvas>` absoluto `inset-0`, dimensionado vía `ResizeObserver` +
`devicePixelRatio`.

**Estructura ("vórtice"):** las partículas se agrupan en ~18–36 "radios"
(spokes) según el ancho del contenedor, cada uno con 6 partículas en
fracciones fijas de radio (`[0.16, 0.34, 0.52, 0.7, 0.88, 1.0]`, con jitter
pequeño). El slot más cercano al centro es más chico/opaco (lejos, en
profundidad); el más externo es más grande/brillante (cerca del
espectador) — simula profundidad sin un motor 3D real.

**Respiración (breathing):** un único ciclo compartido, sincronizado entre
todas las partículas, gobernado por una función seno pura sobre el tiempo
transcurrido (no un random walk): `raw = (sin(t·ω − π/2) + 1) / 2`, con
`radiusFraction = BREATH_MIN + (1 − BREATH_MIN) · raw`. Una onda seno ya
tiene velocidad cero en ambos extremos (contracción total / expansión
total) y velocidad máxima a mitad de camino — exactamente el perfil
"lento cerca del centro → acelera hacia afuera → frena antes de
contraerse" sin necesitar una curva de easing separada. `BREATH_PERIOD` =
6.5s por ciclo completo; `BREATH_MIN` = 0.42 (nunca colapsa a un punto).

**Rotación:** todas las partículas comparten el mismo ángulo global
(`globalAngle = t · ROTATION_SPEED`, 0.045 rad/s) — debe ser uniforme (no
diferencial por radio) para que los radios se mantengan como líneas rectas
en vez de enroscarse.

**Deriva libre (wander):** cada partícula suma un desplazamiento propio e
independiente (`wanderAmp·sin(t·wanderFreq + wanderPhase)` en X e Y, con
amplitud/frecuencia/fase aleatorias por partícula) sobre su posición de
vórtice — evita que la estructura se sienta como un wireframe mecánico
mientras conserva la agrupación y la respiración compartidas.

**Estela tipo cometa:** cada partícula se dibuja como un `strokeStyle` con
gradiente lineal (transparente → color) desde una cola hacia la cabeza,
orientada a lo largo del radio (dirección de expansión/contracción), más un
punto brillante en la cabeza. El largo de la estela escala con la
velocidad instantánea de respiración (`|breathVelocity|`, derivada
analítica de la función seno), calculada una sola vez por frame y
reutilizada por todas las partículas — no es una velocidad estimada por
diferencia de posición entre frames.

**Interacción con el cursor:** dos efectos, ambos con `pointer: fine` y sin
`prefers-reduced-motion`:
1. *Inclinación magnética:* el centro del vórtice se desplaza suavemente
   (spring simple, no `useSpring` de Framer Motion — un lerp manual
   `lean += (target − lean) · 0.06` es suficiente y evita una dependencia
   extra dentro del propio canvas) hacia la posición del cursor relativa al
   centro del contenedor, sin romper la formación.
2. *Squash horizontal:* un factor de escala en X (`1 − |nx| · 0.12`, donde
   `nx` es la posición X del cursor normalizada) simula parallax/profundidad
   barata — una rotación 3D real de cámara no es realista en Canvas 2D puro,
   así que se aproxima con este squash en vez de intentar un motor 3D.

**Seguimiento del cursor:** a diferencia de `CursorGlow.tsx` (que tiene un
bug conocido: `onPointerMove` en un elemento con `pointer-events-none`
nunca puede recibir el evento, porque ese CSS excluye al elemento del
hit-testing), `ParticleField` escucha `pointermove`/`pointerleave`
directamente en el propio `<canvas>`, que sí tiene `pointer-events: auto`
por defecto. No se toca `CursorGlow.tsx` en este trabajo.

## Tarjetas con glow al hover

`CatalogoCursoCard.tsx`: se reemplaza `border border-white/10 ...
hover:border-gold-500/40` por un tratamiento que agrega, solo en hover,
`border-color: gold-500`, un `box-shadow` compuesto (anillo sutil +
sombra difusa + resplandor dorado) y mantiene el `whileHover={{ y: -4 }}`
de Framer Motion ya existente. Transición vía Tailwind (`transition`,
`duration-300`), sin animación en reposo.

Los cuatro paneles de Auth (`rounded-[20px] border border-white/[0.08]
bg-white/[0.03] p-12`, uno por página) reciben el mismo tratamiento de
hover: borde y `box-shadow` dorados que aparecen al pasar el cursor sobre
el panel completo.

## Testing

- `ParticleField.test.tsx`: no renderiza `<canvas>` cuando
  `useReducedMotionSafe()` devuelve `true`; renderiza
  `data-testid="particle-field-canvas"` en caso contrario. La física del
  vórtice (breathing, wander, inclinación) no es verificable de forma
  significativa en jsdom — se valida manualmente en navegador, mismo
  criterio que `HeroBackground` (parallax) y `CursorGlow` (spring).
- Se re-ejecutan los tests existentes de `CatalogoCursoCard.test.tsx`,
  `HeroBackground.test.tsx`, `LoginForm.test.tsx` y equivalentes de Auth
  para confirmar que no hay regresiones (aseveran sobre texto/links, no
  sobre estructura exacta de clases).

## Verificación manual

En navegador, con `next dev`, en `/` y `/login`:
- El vórtice respira de forma sincronizada, las partículas derivan
  libremente sin verse mecánicas, y la estructura se inclina levemente
  hacia el cursor sin romper la agrupación.
- Las tarjetas del catálogo y los paneles de Auth están quietos en reposo y
  ganan el glow dorado solo al pasar el cursor.
- Con "reduce motion" activado en el SO: no se monta el canvas de
  partículas, no hay `CursorGlow`; el resto de la página funciona sin
  errores.
