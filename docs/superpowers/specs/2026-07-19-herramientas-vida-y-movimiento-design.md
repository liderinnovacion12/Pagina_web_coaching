# Herramientas y Comunicación — más vida y menos predecible

## Contexto

Feedback: la página de Herramientas (`/herramientas`) se siente "sin
vida y muy predecible". Tres causas identificadas en el brainstorming:

1. Las tarjetas de grupos son todas visualmente iguales, sin importar
   el tipo de canal (WhatsApp vs Dropbox) o la categoría.
2. Solo hay una animación de entrada al cargar/filtrar la página —
   nada reacciona al hacer scroll, y el hover es mínimo.
3. El banner superior es genérico (icono + texto + círculo decorativo
   borroso), no comunica que esto es comunicación *en vivo* del
   equipo.

## Alcance

- `components/estudiante/herramientas/HerramientasHub.tsx` — banner
  (indicador "en vivo" + métrica real), cambia cómo se renderizan las
  tarjetas de la grilla/lista (scroll-reveal en vez de stagger al
  montar).
- `components/estudiante/herramientas/GrupoCard.tsx` — acento de color
  por `tipoCanal`, hover más rico (glow + icono reactivo) en vista
  grid, hover liviano en vista lista.
- `components/estudiante/herramientas/HerramientasHub.test.tsx` —
  tests existentes + nuevos para el acento de color y el indicador "en
  vivo".

Sin cambios en: `GrupoPrincipalCard.tsx` (ya usa verde WhatsApp fijo,
correcto), `IndicadoresPanel.tsx`, `HerramientasToolbar.tsx`,
`CategoriaChips.tsx`, `Paginacion.tsx`, modelo de datos.

## Diseño

### 1. Banner: indicador "en vivo" + métrica real

En `HerramientasHub.tsx`, junto al eyebrow text actual ("Prioridad #1
para nuevos agentes"):

```tsx
<div className="mt-4 flex items-center gap-2">
  <span className="relative flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-whatsapp opacity-75" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-whatsapp" />
  </span>
  <span className="font-mono text-xs uppercase tracking-wider text-whatsapp">
    En vivo
  </span>
</div>
```

- `animate-ping` es una animación de Tailwind ya disponible por
  defecto (no requiere configuración adicional) — un punto que pulsa
  hacia afuera con opacidad decreciente, patrón estándar de "estado en
  vivo".
- Respeta `prefers-reduced-motion` automáticamente: la media query
  global ya existente en `app/globals.css` (`@media
  (prefers-reduced-motion: reduce) { *, *::before, *::after {
  animation-duration: 0.01ms !important; ... } }`) cubre cualquier
  `animation-*` de Tailwind, incluida `animate-ping`, sin necesidad de
  lógica adicional en el componente.

El círculo decorativo borroso (`<div className="h-40 w-40 rounded-full
bg-whatsapp/10 blur-2xl" />`) se reemplaza por un bloque de métrica
real, usando el mismo `gruposDeProyecto.length` que ya alimenta
`IndicadoresPanel`:

```tsx
<motion.div
  variants={blurFadeUp}
  aria-hidden="true"
  className="hidden flex-col items-center justify-center gap-1 sm:flex"
>
  <span className="font-display text-6xl font-bold text-white">
    {gruposDeProyecto.length}
  </span>
  <span className="font-mono text-xs uppercase tracking-wider text-mist-400">
    Grupos activos
  </span>
</motion.div>
```

`aria-hidden="true"` se mantiene (es un elemento decorativo/redundante
— el conteo real y accesible ya vive en `IndicadoresPanel`, que no
tiene `aria-hidden`).

### 2. Tarjetas de grupo: acento de color por tipo de canal

`GrupoCard.tsx` hoy usa siempre el acento dorado (`border-gold-500/20
bg-gold-500/10 text-gold-300`, hover `border-white/20`) sin importar
el canal. Pasa a depender de `grupo.tipoCanal`:

```tsx
const ACENTO_CANAL: Record<
  GrupoComunidad["tipoCanal"],
  { badge: string; hoverBorde: string; link: string }
> = {
  whatsapp: {
    badge: "border-whatsapp/20 bg-whatsapp/10 text-whatsapp",
    hoverBorde: "hover:border-whatsapp/40",
    link: "text-whatsapp hover:text-whatsapp-dark",
  },
  dropbox: {
    badge: "border-gold-500/20 bg-gold-500/10 text-gold-300",
    hoverBorde: "hover:border-gold-500/40",
    link: "text-gold-300 hover:text-gold-200",
  },
};
```

- Aplica al icono (badge), al borde en hover, y al link de acción
  ("Unirse ↗" / "Abrir carpeta ↗") — en ambas vistas (`grid` y
  `lista`).
- `whatsapp-dark` ya existe en `tailwind.config.ts`
  (`whatsapp.dark: "#1EBE5D"`), usado hoy en el botón de WhatsApp del
  dashboard — se reutiliza aquí en vez de definir un color nuevo.

### 3. Movimiento: revelado al hacer scroll

Cada `GrupoCard` dentro de la grilla/lista de `HerramientasHub.tsx`
deja de recibir su animación desde el `staggerContainer` del padre
(que dispara todo de una vez al montar/filtrar) y pasa a envolverse en
`ScrollReveal` (ya usado en otras páginas del sitio), con un pequeño
delay creciente por posición para mantener el efecto cascada cuando
varias tarjetas entran en pantalla a la vez:

```tsx
{gruposPagina.map((grupo, indice) => (
  <ScrollReveal
    key={grupo.id}
    variants={blurFadeUpConDelay(Math.min(indice, 8) * 0.05)}
  >
    <GrupoCard grupo={grupo} vista={vista} />
  </ScrollReveal>
))}
```

Donde `blurFadeUpConDelay` es una pequeña función agregada a
`lib/motion.ts` que devuelve una copia de `blurFadeUp` con
`transition.delay` ajustado:

```tsx
export function blurFadeUpConDelay(delay: number): Variants {
  return {
    hidden: blurFadeUp.hidden,
    visible: {
      ...blurFadeUp.visible,
      transition: { ...blurFadeUp.visible.transition, delay },
    },
  };
}
```

- El contenedor de la grilla/lista dentro de `HerramientasHub.tsx`
  deja de ser un `motion.div` con `staggerContainer` (ya no aplica —
  cada tarjeta maneja su propio revelado) y pasa a ser un `div` plano
  con la misma clase condicional (`grid gap-4 sm:grid-cols-2
  lg:grid-cols-3` / `flex flex-col gap-3`).
- `ScrollReveal` usa `once` por defecto en `true` — cada tarjeta se
  revela una sola vez, no se repite si el usuario vuelve a scrollear
  hacia arriba y abajo.
- Sin cambios en el mensaje de "No encontramos grupos con ese nombre."

### 4. Movimiento: hover más rico (vista grid)

`GrupoCard.tsx`, vista `grid` únicamente. Se agrega `group` al
contenedor (ya existente en otras tarjetas del sitio, ej.
`ProyectoCard.tsx`), un resplandor de fondo con el color del canal que
aparece en hover, y el icono reacciona con una leve escala:

```tsx
<motion.div
  variants={blurFadeUp}
  whileHover={{ y: -6 }}
  className={`group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors ${acento.hoverBorde}`}
>
  <div
    aria-hidden="true"
    className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${
      grupo.tipoCanal === "whatsapp" ? "bg-whatsapp/20" : "bg-gold-500/20"
    }`}
  />
  <div className="relative">
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 ${acento.badge}`}
    >
      <Icono className="h-5 w-5" aria-hidden="true" />
    </span>
    {/* resto del contenido sin cambios */}
  </div>
</motion.div>
```

Vista `lista`: solo cambia el acento de color (badge/borde/link) según
`tipoCanal` — sin resplandor ni escala de icono, para no sobrecargar
filas densas.

## Accesibilidad

- El punto "en vivo" es puramente decorativo/atmosférico —
  `animate-ping` ya respeta `prefers-reduced-motion` vía la regla
  global existente; el texto "En vivo" en sí no depende de la
  animación para ser comprendido.
- El resplandor de hover (`aria-hidden="true"`) es decorativo, no
  aporta información — no afecta lectores de pantalla.
- `ScrollReveal` sigue el mismo patrón ya auditado en este proyecto
  (marca `inert` el contenido no visible cuando corresponde, gestiona
  `prefers-reduced-motion` internamente vía `useReducedMotionSafe`).
- El contraste de los nuevos acentos de color (verde WhatsApp, dorado)
  ya está validado en otras partes del sitio (botones, badges) — no se
  introducen combinaciones de color nuevas.

## Testing

- `HerramientasHub.test.tsx`: se agregan tests para el indicador "en
  vivo" (texto presente) y el bloque de métrica (número de grupos
  activos coincide con `gruposDeProyecto.length`).
- `GrupoCard.test.tsx` (nuevo, no existe hoy): tests para el acento de
  color según `tipoCanal` en ambas vistas (verificar clases aplicadas
  al link/icono, no valores de animación).
- `lib/motion.test.ts`: test para `blurFadeUpConDelay` (verifica que
  el delay se aplique correctamente sin alterar el resto del
  variant).
- Verificación manual en navegador (según disponibilidad de
  herramienta de navegador en la sesión que ejecute el plan) +
  `npm run build` obligatorio: confirmar que las tarjetas se revelan
  al hacer scroll (no todas de golpe al cargar), que el hover muestra
  el resplandor/icono reactivo en vista grid, que los colores de canal
  se ven correctamente en ambas vistas, y que `prefers-reduced-motion`
  desactiva el pulso "en vivo" y las animaciones de entrada.

## Fuera de alcance

- Cambios a `GrupoPrincipalCard.tsx`, `IndicadoresPanel.tsx`,
  `HerramientasToolbar.tsx`, `CategoriaChips.tsx`, `Paginacion.tsx`.
- Interacción de scroll propia para el banner (parallax, etc. —
  descartado explícitamente en el brainstorming).
- Diferenciación visual por categoría (Miami, Orlando, etc. —
  descartado a favor de diferenciación por tipo de canal).
- Cambios al modelo de datos o a la página de admin.
- Nuevas dependencias.
