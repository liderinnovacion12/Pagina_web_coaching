# Aliados y Proyectos Inmobiliarios Aliados — layouts interactivos premium

## Contexto

El usuario pidió sacar estas dos páginas del patrón de grilla de tarjetas
uniforme que usa el resto del sitio, con algo "más interactivo y
diferente". Durante la exploración se encontró un bug de movimiento
preexistente en ambas páginas: `AliadoCard`/`ProyectoCard` usan
`variants={blurFadeUp}`, pero su grilla contenedora (`AliadosGrid.tsx`,
`ProyectosAliadosGrid.tsx`) es un `<div>` plano sin `initial`/`animate` —
sin un ancestro `motion` que provea el estado "hidden"/"visible", la
propagación de variantes nunca ocurre. Se verificó empíricamente
(Playwright) que esto NO deja las tarjetas invisibles (framer-motion no
aplica ningún estilo del variant sin contexto), pero sí significa que
las tarjetas hoy no tienen ninguna animación de entrada — solo el
encabezado de cada página se anima. Este ciclo corrige eso de paso, ya
que ambos componentes se reescriben de todas formas.

## Alcance

- `components/estudiante/aliados/AliadosGrid.tsx` — pasa de grilla a
  layout maestro-detalle.
- `components/estudiante/aliados/AliadoCard.tsx` — se elimina (su
  contenido se integra directamente en el nuevo panel de detalle de
  `AliadosGrid.tsx`, ya no aplica como "tarjeta" independiente).
- `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx` —
  pasa de grilla de 2 columnas a showcase de scroll horizontal.
- `components/estudiante/proyectos-aliados/ProyectoCard.tsx` — se
  ajustan solo las clases de ancho (de "item de grilla" a "item de fila
  con scroll"), el contenido interno no cambia.
- `app/(estudiante)/aliados/page.tsx` y
  `app/(estudiante)/proyectos-inmobiliarios-aliados/page.tsx` — sin
  cambios (mismas props, mismo contrato).

## Diseño

### 1. Aliados: layout maestro-detalle

**Estructura:**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Mail, Phone } from "lucide-react";
import type { Aliado } from "@/lib/db/aliados.types";
import { parsearContactos } from "@/lib/db/aliados.types";
import { blurFadeUp, staggerContainer, useReducedMotionSafe } from "@/lib/motion";

export function AliadosGrid({ aliados }: { aliados: Aliado[] }) {
  const [seleccionadoId, setSeleccionadoId] = useState(aliados[0]?.id);
  const reducedMotion = useReducedMotionSafe();
  const seleccionado = aliados.find((a) => a.id === seleccionadoId) ?? aliados[0];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08)}
      className="flex flex-col gap-10"
    >
      <motion.div variants={blurFadeUp}>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Aliados Estratégicos del Equipo
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          Contactos y aliados que trabajan con el Team Wilmar & Samuel.
        </p>
      </motion.div>

      <motion.div
        variants={blurFadeUp}
        className="flex flex-col gap-8 lg:flex-row"
      >
        {/* Lista maestro */}
        <div className="flex shrink-0 flex-row gap-2 overflow-x-auto lg:w-72 lg:flex-col lg:overflow-visible">
          {aliados.map((aliado) => {
            const activo = aliado.id === seleccionado?.id;
            return (
              <button
                key={aliado.id}
                type="button"
                aria-current={activo}
                onClick={() => setSeleccionadoId(aliado.id)}
                className={`shrink-0 rounded-xl border px-5 py-4 text-left font-display font-semibold transition-colors duration-200 ${
                  activo
                    ? "border-gold-500/30 bg-gold-500/10 text-gold-200"
                    : "border-white/[0.06] bg-white/[0.02] text-white hover:border-white/15"
                }`}
              >
                {aliado.servicio}
              </button>
            );
          })}
        </div>

        {/* Panel de detalle */}
        <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
          <AnimatePresence mode="wait">
            {seleccionado && (
              <motion.div
                key={seleccionado.id}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  {seleccionado.imagenUrl ? (
                    <Image
                      src={seleccionado.imagenUrl}
                      alt={seleccionado.servicio}
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold-500/20 bg-gold-500/10 text-gold-300"
                      aria-hidden="true"
                    >
                      <Building2 className="h-6 w-6" />
                    </span>
                  )}
                  <h2 className="font-display text-xl font-bold text-white">
                    {seleccionado.servicio}
                  </h2>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-mist-300">
                  {seleccionado.descripcion}
                </p>

                <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-5">
                  {parsearContactos(seleccionado).map((contacto, indice) => (
                    <div
                      key={`${contacto.nombre}-${indice}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                    >
                      {parsearContactos(seleccionado).length > 1 && (
                        <span className="font-medium text-mist-300">{contacto.nombre}</span>
                      )}
                      {contacto.telefono && (
                        <a
                          href={`tel:${contacto.telefono}`}
                          className="inline-flex items-center gap-1.5 text-gold-300 transition hover:text-gold-200"
                        >
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          {contacto.telefono}
                        </a>
                      )}
                      {contacto.correo && (
                        <a
                          href={`mailto:${contacto.correo}`}
                          className="inline-flex items-center gap-1.5 text-gold-300 transition hover:text-gold-200"
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                          {contacto.correo}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

Notas de diseño:

- `AliadoCard.tsx` deja de existir como componente — su contenido (avatar,
  servicio, descripción, contactos) se integra directamente en el panel
  de detalle de `AliadosGrid.tsx`, ya que ahora solo se renderiza UN
  aliado a la vez (el seleccionado), no una lista de tarjetas repetidas.
- La lista maestro es horizontal-scrollable en mobile (`flex-row
  overflow-x-auto`) y vertical en desktop (`lg:flex-col`) — evita un
  segundo layout completamente distinto para mobile.
- `imagenUrl` de `Aliado` se usa en el panel de detalle igual que hoy en
  `AliadoCard.tsx`: si el aliado seleccionado tiene foto, se muestra;
  si no, cae al ícono `Building2` genérico — mismo comportamiento
  condicional que ya existe, solo reubicado en el panel de detalle.

### 2. Proyectos Inmobiliarios Aliados: showcase horizontal

**`ProyectosAliadosGrid.tsx`:**

```tsx
"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { staggerContainer, blurFadeUp, useReducedMotionSafe } from "@/lib/motion";
import { ProyectoCard } from "./ProyectoCard";

const SCROLL_AMOUNT_PX = 400;

export function ProyectosAliadosGrid({ proyectos }: { proyectos: ProyectoAliado[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  function desplazar(direccion: 1 | -1) {
    scrollRef.current?.scrollBy({
      left: SCROLL_AMOUNT_PX * direccion,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08)}
      className="flex flex-col gap-10"
    >
      <motion.div variants={blurFadeUp}>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Proyectos Inmobiliarios Aliados
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          Desarrollos y proyectos con los que trabajamos junto al Team Wilmar & Samuel.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-mist-300">
            Comisión regular: <span className="font-semibold text-white">6%</span>
          </span>
          <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-sm text-gold-200">
            Comisión para el equipo: <span className="font-semibold">7%</span>
          </span>
        </div>
      </motion.div>

      <motion.div variants={blurFadeUp} className="relative">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        >
          {proyectos.map((proyecto) => (
            <ProyectoCard key={proyecto.id} proyecto={proyecto} />
          ))}
        </div>

        <button
          type="button"
          aria-label="Proyecto anterior"
          onClick={() => desplazar(-1)}
          className="absolute -left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-ink-950/90 text-white backdrop-blur-md transition hover:border-gold-500/40 hover:text-gold-300 sm:flex"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Proyecto siguiente"
          onClick={() => desplazar(1)}
          className="absolute -right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-ink-950/90 text-white backdrop-blur-md transition hover:border-gold-500/40 hover:text-gold-300 sm:flex"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </motion.div>
    </motion.div>
  );
}
```

**`ProyectoCard.tsx`:** sin cambios de contenido — solo se ajusta la
`className` raíz para pasar de "item de grilla" a "item de fila con
scroll":

```tsx
// antes:
className="group relative h-[440px] overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950"

// después:
className="group relative h-[440px] w-[320px] shrink-0 snap-center overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950 sm:w-[380px]"
```

El resto del archivo (imagen, degradado, badge de precio, footer con
WhatsApp) no cambia.

Notas de diseño:

- `variants={blurFadeUp}` en `ProyectoCard.tsx` ya no tiene efecto útil
  (el bug de propagación descrito en Contexto) y se elimina — la entrada
  de todo el showcase (fila completa) se anima como una sola unidad vía
  `motion.div variants={blurFadeUp}` en `ProyectosAliadosGrid.tsx`
  (mismo patrón que ya usa el encabezado), en vez de intentar animar
  cada tarjeta individualmente dentro de un contenedor de scroll
  horizontal (que no se presta bien al scroll-linked reveal usado en
  otras páginas).
- `SCROLL_AMOUNT_PX = 400` es una aproximación al ancho de una tarjeta +
  gap (`w-[380px]` + `gap-6`/24px ≈ 404px en desktop) — no se mide el
  ancho real vía ref para mantenerlo simple; un desplazamiento
  aproximado es aceptable para esta interacción.
- Las flechas se ocultan en mobile (`hidden sm:flex`) — en pantallas
  chicas el scroll táctil nativo ya es el mecanismo principal.

## Accesibilidad

- **Aliados:** los ítems de la lista maestro son `<button>` reales,
  navegables con teclado, con `aria-current="true"` en el activo. La
  transición del panel de detalle (`AnimatePresence`) respeta
  `prefers-reduced-motion` (`initial={false}` cuando reduced motion está
  activo, evitando cualquier animación de entrada/salida).
- **Proyectos:** las flechas son `<button>` reales con `aria-label`
  descriptivo. El scroll programático usa `behavior: "auto"` (instantáneo)
  en vez de `"smooth"` cuando el usuario prefiere reduced motion. El
  contenedor de scroll horizontal es alcanzable con teclado de forma
  nativa del navegador (flechas del teclado al enfocarlo).

## Testing

- **`AliadoCard.test.tsx` (existe hoy, 4 tests) se elimina** junto con
  `AliadoCard.tsx` — sus casos (un solo contacto no repite el nombre,
  dos contactos anteponen el nombre a cada teléfono/correo, sin
  `imagenUrl` muestra el ícono de respaldo, líneas de teléfono/correo
  faltantes no generan un link vacío) se migran como tests nuevos contra
  el panel de detalle de `AliadosGrid.tsx` (renderizando el aliado
  correspondiente ya seleccionado por defecto, o seleccionándolo primero
  con `userEvent.click` si no es el primero de la lista).
- **`AliadosGrid.test.tsx` (existe hoy, 2 tests) — uno necesita un
  ajuste menor**: el test del título/subtítulo no cambia, pero el test
  "renderiza una tarjeta por cada aliado" necesita actualizarse, porque
  el primer aliado de prueba queda seleccionado por defecto y su nombre
  aparece dos veces (botón de la lista + título del panel de detalle) —
  `screen.getByText(...)` fallaría por encontrar múltiples coincidencias
  donde antes esperaba una sola. Se corrige usando
  `getAllByText(...).toHaveLength(2)` para ese caso. Se agregan tests
  nuevos para: click en un ítem de la lista cambia el contenido del
  panel de detalle, y `aria-current` marca el ítem activo correctamente.
- **`ProyectosAliadosGrid.test.tsx` (existe hoy, 4 tests) no necesita
  cambios**: a diferencia de Aliados, el showcase de Proyectos sigue
  renderizando TODAS las tarjetas simultáneamente (solo cambia el layout
  de grilla a fila con scroll), así que los 4 tests existentes
  (tarjeta por proyecto, badge de precio condicional, link de WhatsApp,
  comisiones) siguen pasando sin modificación. Se agregan tests nuevos
  para confirmar que los botones "Proyecto anterior"/"Proyecto
  siguiente" existen con su `aria-label` correcto.
- `ProyectoCard.tsx` no tiene test dedicado hoy (no existe
  `ProyectoCard.test.tsx`) — no se crea uno nuevo en este ciclo, ya que
  su único cambio es de clases de ancho/posicionamiento, cubierto
  indirectamente por los tests de `ProyectosAliadosGrid.test.tsx`.
- Verificación manual en navegador: maestro-detalle de Aliados funciona
  con teclado y mouse; showcase de Proyectos se desliza con scroll-snap
  y con las flechas; ambas páginas respetan `prefers-reduced-motion`; sin
  overflow horizontal a nivel de página (el scroll horizontal debe
  quedar contenido dentro del showcase, no filtrarse al `<body>`).

## Fuera de alcance

- Cambios al modelo de datos (`Aliado`, `ProyectoAliado`) o a las
  páginas de admin (`/admin/aliados`, `/admin/proyectos-inmobiliarios-aliados`).
- Medir el ancho real de las tarjetas de Proyectos vía ref (se usa una
  aproximación fija).
- Cualquier otra página de la plataforma.
- Nuevas dependencias.
