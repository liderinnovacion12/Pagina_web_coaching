# Bienvenida — coreografía de entrada/salida y títulos dinámicos

## Contexto

Segunda iteración sobre la página de Bienvenida (`app/(estudiante)/dashboard/`),
ya con el revelado por scroll de
`docs/superpowers/specs/2026-07-16-fase-b-bienvenida-scroll-reveal-design.md`
implementado (`ScrollReveal`, `TeamLeaderCard`). El usuario pidió, mirando de
nuevo alkares.com:

- Quitar el marco del video de bienvenida.
- Animaciones de entrada **distintas** entre secciones (no la misma
  transición repetida 10 veces), con salida real (no solo permanecer
  visible para siempre).
- Dejar de usar el patrón "ícono pequeño pegado al título" — reemplazarlo
  por números de índice tenues y/o íconos reposicionados a mayor escala,
  variando posición y tamaño por sección.
- Variar la alineación/posición de los títulos de sección (no todos
  izquierda-fijo).

Research de referencia (alkares.com, capturado con Playwright en
`docs/superpowers/specs/2026-07-14-hero-scroll-parallax-design.md` y esta
conversación): títulos sin ícono, de escala y alineación variable
(izquierda-gigante en una sección, compacto-arriba-izquierda con grilla al
lado en otra, centrado en el hero), con números de índice grandes y tenues
(01, 02, 03) como identificador discreto en vez de iconografía.

## Alcance

Solo `app/(estudiante)/dashboard/DashboardContent.tsx` y una extensión de
`components/motion/ScrollReveal.tsx` (ya existente). Ninguna otra página.

## Diseño

### 1. Video de Bienvenida: sin envoltura

Se elimina tanto la card exterior (borde, fondo degradado, padding, hover)
como el marco interno del reproductor (borde, sombra). El video queda
apoyado directo sobre el fondo de la página — el kicker "Video de
inducción" con el punto pulsante se mantiene igual, sin caja:

```tsx
<ScrollReveal variants={revealUp} once={false}>
  <div className="flex items-center gap-2 px-1 pb-4">
    <span className="flex h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
    <p className="font-mono text-xs uppercase tracking-wider text-mist-400">
      Video de inducción
    </p>
  </div>
  <div className="relative aspect-video overflow-hidden rounded-xl">
    <iframe
      src="https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1"
      title="Video de bienvenida — Team 100% Real Estate"
      allow="fullscreen"
      allowFullScreen
      className="h-full w-full"
    />
  </div>
</ScrollReveal>
```

Se conserva `rounded-xl overflow-hidden` (es forma, no "marco") pero se
quitan `border`, `bg-ink-950`, `shadow-2xl` y el efecto hover de opacidad
que dependía de la card ahora eliminada.

### 2. `ScrollReveal` aprende a salir, no solo entrar

Se agrega un prop opcional `once?: boolean` (default `true`, para no romper
el comportamiento ya usado en el resto del archivo si se omite):

```tsx
export function ScrollReveal({
  variants,
  className,
  children,
  once = true,
}: {
  variants: Variants;
  className?: string;
  children?: ReactNode;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { ...SCROLL_REVEAL_VIEWPORT, once });
  // resto sin cambios
}
```

En `DashboardContent.tsx`, las 14 instancias existentes de `<ScrollReveal>`
pasan `once={false}` — la sección se anima hacia "hidden" al salir del
viewport (scroll hacia arriba) y vuelve a animar hacia "visible" al
reingresar, en vez de quedar fijada la primera vez que se revela.

### 3. Cuatro variantes de movimiento (en vez de una sola)

Se definen 4 variantes en `DashboardContent.tsx` (mismo archivo, mismo
patrón que ya usa `cardVariants`/`containerVariants` — no se crea un
primitivo compartido nuevo porque esta coreografía es específica de esta
página):

```tsx
const EASE = [0.16, 1, 0.3, 1] as const;

const revealUp: Variants = {
  hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

const revealLeft: Variants = {
  hidden: { opacity: 0, x: -40, filter: "blur(4px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

const revealRight: Variants = {
  hidden: { opacity: 0, x: 40, filter: "blur(4px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

const revealScale: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};
```

`revealUp` reemplaza el uso directo de `cardVariants` en los bloques de
contenido que NO son encabezados de sección (Cabecera Principal, Video,
Banner WhatsApp, Dos Columnas, Separador, Misión/Visión, Filosofía) — mismo
movimiento que ya existía, para mantener el ancla minimalista fuera de los
títulos. `cardVariants`/`containerVariants` siguen existiendo para el
stagger interno de las grillas (Dos Columnas, Team Leaders, Valores,
Galería) — no se tocan.

Los 5 encabezados con título reciben, en este orden de aparición en la
página, una variante distinta cada uno (sin repetir la inmediatamente
anterior):

| Encabezado | Variante |
|---|---|
| Cultura y Equipo | `revealLeft` |
| Team Leaders | `revealScale` |
| Nuestros Valores | `revealRight` |
| Filosofía de Equipo | `revealUp` |
| Galería del Equipo | `revealLeft` |

### 4. Los 5 encabezados: sin ícono-viñeta, decoración propia por sección

**Cultura y Equipo** — índice "01" gigante y tenue superpuesto detrás del
título, alineado a la izquierda (como hoy):

```tsx
<ScrollReveal variants={revealLeft} once={false} className="relative">
  <span
    aria-hidden="true"
    className="absolute -left-2 -top-6 font-mono text-7xl font-bold text-gold-500/10 sm:text-8xl"
  >
    01
  </span>
  <h2 className="relative font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
    Cultura y Equipo
  </h2>
  <p className="relative mt-2.5 text-lg text-mist-400">
    Conoce a los líderes y los principios que nos guían.
  </p>
</ScrollReveal>
```

**Team Leaders** — el ícono `Users` se mantiene pero mucho más grande
(antes `h-5 w-5` visible junto al texto; ahora `h-16 w-16`/`h-20 w-20` en
tono muy tenue, posicionado detrás/a un costado del título, no como viñeta
en línea):

```tsx
<ScrollReveal variants={revealScale} once={false} className="relative flex items-center px-1">
  <Users
    aria-hidden="true"
    className="absolute -left-3 -top-2 h-16 w-16 text-gold-500/10 sm:h-20 sm:w-20"
  />
  <h3 className="relative font-display text-xl font-bold text-white">Team Leaders</h3>
</ScrollReveal>
```

**Nuestros Valores** — índice "02" a la derecha del título (en vez de un
ícono a la izquierda):

```tsx
<ScrollReveal variants={revealRight} once={false} className="relative flex items-center gap-3 px-1">
  <h3 className="font-display text-xl font-bold text-white">Nuestros Valores</h3>
  <span aria-hidden="true" className="font-mono text-4xl font-bold text-gold-500/15">
    02
  </span>
</ScrollReveal>
```

**Filosofía de Equipo** — el ícono `Lightbulb` (hoy `h-6 w-6` justo arriba
del título) pasa a `h-20 w-20`, tenue, reposicionado arriba a la derecha de
la card, detrás del texto:

```tsx
{/* dentro de la ScrollReveal (revealUp) que ya envuelve toda la card */}
<Lightbulb aria-hidden="true" className="absolute right-6 top-6 h-20 w-20 text-gold-500/10" />
<h2 className="relative mt-3.5 font-display text-2xl font-bold text-white">
  Filosofía de Equipo
</h2>
{/* resto de la card sin cambios */}
```

**Galería del Equipo** — índice "03", y el encabezado pasa a estar
centrado (variedad de alineación frente a los otros 4, que quedan a la
izquierda):

```tsx
<ScrollReveal
  variants={revealLeft}
  once={false}
  className="relative flex flex-col items-center gap-1 px-1 text-center"
>
  <span aria-hidden="true" className="font-mono text-2xl font-bold text-gold-500/20">
    03
  </span>
  <h3 className="font-display text-xl font-bold text-white">Galería del Equipo</h3>
</ScrollReveal>
```

Nota: cuando la Galería queda centrada, la grilla de fotos debajo
(`grid grid-cols-2 gap-4 sm:grid-cols-4`) no cambia — solo el encabezado
se centra, no el contenido.

Los imports `Heart` e `ImageIcon` de `lucide-react` se eliminan de
`DashboardContent.tsx` (ya no se usan como viñeta de encabezado y ningún
otro lugar del archivo los usa). `Users` y `Lightbulb` se conservan
(reutilizados, solo cambia tamaño/posición/opacidad). `Target`, `Eye` y
`Check` no se tocan — son íconos de las tarjetas individuales de Misión/
Visión/Valores, no de encabezados de sección, fuera de alcance de este
cambio.

### Accesibilidad

- Todos los elementos decorativos (índices numéricos, íconos reposicionados)
  llevan `aria-hidden="true"` — no son contenido, son parte del fondo
  visual del título, igual que ya se hace hoy con los íconos existentes.

**Correcciones encontradas durante la revisión de código (no previstas en
la redacción original de este spec):**

- **`once={false}` sí tenía una consecuencia de accesibilidad real que este
  spec subestimó**: al ser puramente visual (opacity/blur), el contenido
  oculto seguía siendo enfocable por teclado y clickeable aunque invisible
  — un enlace podía "desaparecer" pero seguir en el tab order. Se corrigió
  agregando el atributo HTML `inert={!isInView}` al `motion.div` raíz de
  `ScrollReveal` (afecta a las 14 instancias de esta página automáticamente,
  sin tocar cada call site). `inert` saca todo el subárbol del tab order,
  del click y del árbol de accesibilidad mientras el contenido está oculto.
  **Efecto secundario documentado, no un bug**: si un usuario de teclado
  enfoca un enlace dentro de una sección (ej. el banner de WhatsApp o
  "Enlaces de Interés") y luego sigue scrolleando sin volver a tabular, al
  salir esa sección del viewport se vuelve `inert` y el navegador quita el
  foco automáticamente (típicamente a `<body>`) — es el comportamiento
  estándar de `inert` con contenido enfocado, no un error de esta
  implementación.
- **`prefers-reduced-motion` NO estaba cubierto por `ScrollReveal`,
  contrario a lo que decía la versión original de este párrafo.** La regla
  global de `app/globals.css` solo acorta `animation-duration`/
  `transition-duration` vía CSS, y Framer Motion anima `animate` vía JS, no
  vía esas propiedades CSS — así que no había ningún mecanismo real
  evitando que un usuario con reduced motion viera secciones ocultas
  (`opacity: 0`, y tras el fix de arriba, también `inert`) hasta scrollear
  exactamente a esa sección. Se corrigió agregando `useReducedMotionSafe()`
  (el hook ya usado en `ParticleField`/`HeroContent`/`TeamLeaderCard`) a
  `ScrollReveal`: cuando reduced motion está activo, el contenido se
  muestra de inmediato y nunca queda `inert`, sin importar la posición de
  scroll.

Ambas correcciones viven enteramente en `components/motion/ScrollReveal.tsx`
— ninguna requirió tocar `DashboardContent.tsx`.

### Testing

- `components/motion/ScrollReveal.test.tsx` (existente): se agrega un caso
  que verifica que el prop `once` se pasa correctamente a `useInView` (se
  puede verificar con un mock de `useInView` de framer-motion, siguiendo el
  patrón ya usado para mockear `@/lib/motion` en otros tests del proyecto).
- `app/(estudiante)/dashboard/page.test.tsx` (existente): no debería
  requerir cambios — sigue verificando presencia de contenido/atributos,
  no clases decorativas ni animación.
- Verificación manual en navegador (obligatoria, dado que jsdom no ejecuta
  `IntersectionObserver` de forma realista): confirmar que el video se ve
  sin marco, que cada encabezado usa su propia variante/posición, que las
  secciones se ocultan de nuevo al scrollear hacia arriba y se revelan otra
  vez al volver a bajar (comportamiento `once={false}`), y que
  `prefers-reduced-motion: reduce` sigue mostrando todo estático de
  inmediato.

## Fuera de alcance

- Cualquier otra página de la Fase A/B.
- Los íconos de las tarjetas individuales (Team Leaders ya tiene su propio
  parallax de foto, Misión/Visión/Valores mantienen sus badges de ícono sin
  cambios).
- Nuevas dependencias — todo se logra con Framer Motion ya instalado
  (`useInView`, `animate`, `variants`).
