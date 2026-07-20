# Eventos — línea de tiempo cronológica interactiva

## Contexto

Feedback: la página de Eventos se organiza hoy en dos categorías fijas
(Internacional / Nacional EEUU), cada una con su propia grilla simple
de tarjetas, sin ningún orden cronológico visible ni interactividad.
El usuario pidió un enfoque "novedoso e interactivo" para organizar y
visualizar los eventos.

Decisiones confirmadas durante el brainstorming:

- El orden cronológico pasa a ser el eje organizador principal (no la
  categoría).
- Visualización: línea de tiempo vertical con un marcador de "hoy".
- Un evento con varias fechas (ej. el mismo evento en Miami y luego en
  Orlando) se divide en una parada por fecha, cada una en su lugar
  cronológico correcto — no una tarjeta por evento.
- El video de YouTube (si existe) se muestra solo en la parada más
  temprana de ese evento; las demás fechas del mismo evento no lo
  repiten.
- Paradas pasadas: atenuadas. Marcador de "hoy": dorado, el punto más
  visible. Paradas próximas/en curso: brillo normal del sitio.
- La categoría se conserva como etiqueta visual en cada parada + chips
  de filtro arriba (Todos / Internacional / Nacional EEUU).
- Toque interactivo: al cargar la página, scroll automático hasta el
  marcador de "hoy"; la línea vertical se "llena" de color a medida
  que se hace scroll hacia abajo (efecto de progreso).

## Alcance

- `lib/db/eventos.types.ts` — nueva función pura `construirLineaDeTiempo`
  (aplana eventos→paradas por fecha, ordena cronológicamente, decide en
  qué parada va el video).
- `components/estudiante/eventos/ParadaEvento.tsx` (nuevo) — una parada
  individual de la línea de tiempo.
- `components/estudiante/eventos/EventosTimeline.tsx` (nuevo, reemplaza
  `EventosGrid.tsx`) — línea de tiempo completa: marcador de hoy, chips
  de filtro, línea de progreso con scroll, auto-scroll inicial.
- `app/(estudiante)/eventos/page.tsx` — actualiza el import.
- Se eliminan `EventoCard.tsx` y `EventosGrid.tsx` (y sus tests) — sin
  otros usos en el proyecto (confirmado por búsqueda en todo el
  repositorio), completamente reemplazados por el nuevo diseño.

## Diseño

### 1. `construirLineaDeTiempo`: aplanar eventos a paradas por fecha

```tsx
export type ParadaLineaDeTiempo = {
  claveParada: string; // `${evento.id}:${fecha.id}`
  evento: Evento;
  fecha: FechaEvento;
  estado: EstadoFecha;
  mostrarVideo: boolean;
};

export function construirLineaDeTiempo(
  eventos: Evento[],
  hoy: string
): ParadaLineaDeTiempo[] {
  const paradas: ParadaLineaDeTiempo[] = [];

  for (const evento of eventos) {
    const fechasOrdenadas = [...evento.fechas].sort((a, b) =>
      a.fechaInicio.localeCompare(b.fechaInicio)
    );

    fechasOrdenadas.forEach((fecha, indice) => {
      paradas.push({
        claveParada: `${evento.id}:${fecha.id}`,
        evento,
        fecha,
        estado: calcularEstadoFecha(fecha.fechaInicio, fecha.fechaFin, hoy),
        mostrarVideo: Boolean(evento.youtubeUrl) && indice === 0,
      });
    });
  }

  return paradas.sort((a, b) => a.fecha.fechaInicio.localeCompare(b.fecha.fechaInicio));
}
```

- Reutiliza `calcularEstadoFecha` (ya existe en este archivo).
- `mostrarVideo` es `true` solo para la fecha más temprana de cada
  evento (`indice === 0` después de ordenar las fechas de ese evento
  específicamente) — así el video no se repite en paradas posteriores
  del mismo evento, incluso si esas paradas terminan lejos entre sí en
  la línea de tiempo global.
- El orden final es 100% por `fechaInicio`, sin importar a qué evento
  pertenezca cada parada ni su categoría.

### 2. `EventosTimeline.tsx`: línea vertical + marcador de "hoy" + filtro

Estructura:

```tsx
"use client";
// ... imports

export function EventosTimeline({ eventos }: { eventos: Evento[] }) {
  const [filtro, setFiltro] = useState<CategoriaEvento | "todos">("todos");
  const contenedorRef = useRef<HTMLDivElement>(null);
  const marcadorHoyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const hoy = hoyIso();
  const paradas = useMemo(() => construirLineaDeTiempo(eventos, hoy), [eventos, hoy]);
  const paradasFiltradas = useMemo(
    () => (filtro === "todos" ? paradas : paradas.filter((p) => p.evento.categoria === filtro)),
    [paradas, filtro]
  );

  // Índice donde insertar el marcador de "hoy" dentro de la lista filtrada
  const indiceHoy = paradasFiltradas.findIndex((p) => p.fecha.fechaInicio >= hoy);
  const posicionMarcador = indiceHoy === -1 ? paradasFiltradas.length : indiceHoy;

  // Scroll automático al marcador de "hoy" al montar
  useEffect(() => {
    marcadorHoyRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [reducedMotion]);

  // Línea de progreso: se llena según cuánto se ha scrolleado el contenedor de la timeline
  const { scrollYProgress } = useScroll({
    target: contenedorRef,
    offset: ["start center", "end center"],
  });
  const alturaLinea = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">Eventos</h1>
        <p className="mt-2 text-lg text-mist-400">
          Mantente informado sobre próximos eventos del equipo
        </p>
      </div>

      {/* chips de filtro: Todos / Internacional / Nacional EEUU */}

      <div ref={contenedorRef} className="relative pl-8">
        {/* línea base, tenue */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" aria-hidden="true" />
        {/* línea de progreso dorada, se llena con el scroll */}
        <motion.div
          className="absolute left-3 top-0 w-px bg-gold-500"
          style={{ height: reducedMotion ? "100%" : alturaLinea }}
          aria-hidden="true"
        />

        {paradasFiltradas.map((parada, indice) => (
          <div key={parada.claveParada}>
            {indice === posicionMarcador && (
              <div ref={marcadorHoyRef} className="...">HOY</div>
            )}
            <ParadaEvento parada={parada} />
          </div>
        ))}
        {posicionMarcador === paradasFiltradas.length && (
          <div ref={marcadorHoyRef} className="...">HOY</div>
        )}
      </div>

      {/* botón "Solicitar más información" (se mantiene, sin cambios de comportamiento) */}
    </div>
  );
}
```

Notas:
- `useScroll`/`useTransform` para la línea de progreso sigue el mismo
  patrón ya usado en `HorizontalIntroPanels.tsx` (dashboard) — no es
  una técnica nueva en este proyecto.
- Con `prefers-reduced-motion`, la línea de progreso se muestra
  siempre al 100% (sin animación ligada al scroll) y el
  `scrollIntoView` inicial usa `behavior: "auto"` (salto instantáneo,
  sin scroll suave).
- El marcador de "hoy" se posiciona por índice dentro de la lista ya
  ordenada/filtrada — si no hay ninguna parada futura, el marcador
  aparece al final (después de todo lo pasado).
- El botón "Solicitar más Información" (WhatsApp) se mantiene
  exactamente igual que hoy, al final de la página.

### 3. `ParadaEvento.tsx`: una parada individual

```tsx
export function ParadaEvento({ parada }: { parada: ParadaLineaDeTiempo }) {
  const { evento, fecha, estado, mostrarVideo } = parada;
  const idVideo = mostrarVideo && evento.youtubeUrl ? extraerIdVideoYoutube(evento.youtubeUrl) : null;
  const esPasado = estado === "realizado";

  return (
    <div className={`relative pb-10 pl-6 ${esPasado ? "opacity-40" : ""}`}>
      <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-ink-950 bg-white/30" aria-hidden="true" />
      <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-mist-400">
        {CATEGORIA_EVENTO_INFO[evento.categoria].titulo}
      </span>
      <h3 className="mt-2 font-display text-lg font-bold text-white">{evento.titulo}</h3>
      <p className="mt-1 text-sm text-mist-400">{evento.subtitulo}</p>
      {idVideo && (
        <div className="mt-3 aspect-video max-w-sm overflow-hidden rounded-xl border border-white/[0.08]">
          <iframe
            src={`https://www.youtube.com/embed/${idVideo}`}
            title={`Video de ${evento.titulo}`}
            className="h-full w-full"
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mist-300">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-mist-500" aria-hidden="true" />
          {formatearRangoFecha(fecha.fechaInicio, fecha.fechaFin)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-mist-400">
          <MapPin className="h-3.5 w-3.5 text-mist-500" aria-hidden="true" />
          {fecha.ubicacion}
        </span>
        {estado === "en_ejecucion" && (
          <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-2 py-0.5 text-[11px] font-semibold text-gold-300">
            En ejecución
          </span>
        )}
      </div>
    </div>
  );
}
```

- Reutiliza `extraerIdVideoYoutube`/`formatearRangoFecha`/
  `CATEGORIA_EVENTO_INFO` ya existentes en `eventos.types.ts` — sin
  cambios a esas funciones.
- `esPasado` (basado en `estado === "realizado"`) controla la
  atenuación — coincide con el estado ya calculado por
  `calcularEstadoFecha`, no se agrega lógica de fecha nueva acá.
- El pequeño punto (`span` absoluto) marca la posición de esta parada
  sobre la línea vertical del padre.

## Accesibilidad

- La línea vertical (base y de progreso) es puramente decorativa —
  `aria-hidden="true"` en ambas.
- El marcador de "hoy" y cada parada siguen en el flujo normal de
  lectura del documento — nada queda oculto ni `inert`, la atenuación
  visual de lo pasado es solo estética (no reduce el contraste por
  debajo de niveles legibles ni quita la información).
- `prefers-reduced-motion` desactiva tanto el scroll automático suave
  al cargar (usa salto instantáneo) como la animación de la línea de
  progreso ligada al scroll (se muestra siempre completa).
- Los chips de filtro siguen el mismo patrón de accesibilidad ya
  usado en `CategoriaChips.tsx` de Herramientas (botones con
  `aria-current` o equivalente).

## Testing

- `eventos.types.test.ts`: tests nuevos para `construirLineaDeTiempo`
  — verifica el aplanado (N fechas → N paradas), el orden cronológico
  correcto mezclando fechas de distintos eventos, y que `mostrarVideo`
  sea `true` solo en la fecha más temprana de cada evento.
- `ParadaEvento.test.tsx` (nuevo): verifica que se muestre
  título/fecha/ubicación/categoría, que el video aparezca solo cuando
  `mostrarVideo` es `true`, y que el estado "en ejecución" muestre su
  badge.
- `EventosTimeline.test.tsx` (nuevo, reemplaza `EventosGrid.test.tsx`):
  verifica que las paradas aparezcan en orden cronológico
  independientemente de su categoría, que el filtro de categoría
  funcione, y que el marcador de "hoy" aparezca en la posición
  correcta (usando fechas mockeadas conocidas, no la fecha real del
  sistema).
- Verificación manual en navegador (según disponibilidad de
  herramienta de navegador en la sesión que ejecute el plan) +
  `npm run build` obligatorio: confirmar el scroll automático al
  marcador de "hoy" al cargar, que la línea se llena progresivamente
  al hacer scroll, que el filtro de categoría funciona, y que
  `prefers-reduced-motion` desactiva ambos efectos de scroll.

## Fuera de alcance

- Cambios al formulario de admin de eventos (`EventoForm.tsx`) o al
  modelo de datos (`Evento`/`FechaEvento`).
- Cualquier otra página de la plataforma.
- Nuevas dependencias.
