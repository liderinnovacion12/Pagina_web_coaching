# Eventos — Diseño

**Fecha:** 2026-07-16
**Nav item:** "Eventos" (`components/estudiante/nav-config.ts`, grupo "Comunidad", `href: null` actualmente → `/eventos`)

## 1. Contexto y alcance

A diferencia de los últimos tres módulos (Curso de Rentas, CRM, Oficinas — páginas estáticas hardcodeadas), este es el módulo con más volumen y variabilidad de datos hasta ahora: un catálogo de eventos organizados en 2 categorías fijas, con varias tarjetas de evento por categoría, y cada tarjeta con un número variable de fechas (2 a 6). Las fechas/estados de eventos cambian con frecuencia real (el propio contenido de referencia muestra actualizaciones trimestrales), así que — decisión explícita del usuario — **este módulo sí tiene tabla en base de datos y CRUD admin**, a diferencia de los tres anteriores.

**Decisión clave que diferencia este módulo de "Aliados Estratégicos"** (el precedente más cercano en volumen de datos): en vez de columnas de texto paralelas (el truco usado en `aliados` para hasta 2 contactos), acá se usa una **tabla hija real** (`eventos_fechas`, FK a `eventos`) porque cada fecha necesita datos estructurados (fecha de inicio, fecha de fin, ubicación) y el número de fechas por evento varía mucho más (2 a 6, no 1 a 2).

**Decisión clave sobre el estado de cada fecha:** decisión explícita del usuario — el estado ("Realizado con éxito" / "En ejecución" / próximo sin badge) **se calcula, no se guarda**. Esto requiere guardar fechas reales (`date`), no solo texto libre como en la referencia. Consecuencia esperada: los datos semilla (fechas reales extraídas de la referencia) van a mostrar estados distintos a los de las capturas de pantalla del sitio de referencia, porque esas capturas están "congeladas" en un momento del tiempo — el estado calculado siempre refleja la fecha real al momento de ver la página, no un estado fijo. Esto es el comportamiento correcto y esperado, no un bug.

## 2. Modelo de datos

### Tabla `eventos`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `categoria` | `categoria_evento` (enum: `'internacional'`, `'nacional_eeuu'`) | |
| `titulo` | text | ej. "Florida como destino inmobiliario" |
| `subtitulo` | text | ej. "Cronograma de eventos 2026 · Bogotá, Distrito Capital" |
| `youtube_url` | text, nullable | link normal de YouTube (`watch?v=...`), no el de embed — se convierte en tiempo de render. `null` si el evento no tiene video (ej. "Legacy Impact 360"). |
| `orden` | int | orden dentro de su categoría |
| `activo` | boolean | default true |
| `creado_en` | timestamptz | |

### Tabla `eventos_fechas` (hija de `eventos`, `on delete cascade`)

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `evento_id` | uuid | FK a `eventos(id) on delete cascade` |
| `fecha_inicio` | date | |
| `fecha_fin` | date | igual a `fecha_inicio` si el evento dura un solo día |
| `ubicacion` | text | ej. "Bogotá, Colombia", "Evento On line", "Orlando, FL" |
| `creado_en` | timestamptz | |

Sin columna `orden` en `eventos_fechas` — las fechas de un evento se ordenan cronológicamente por `fecha_inicio` al leerlas, no requieren curación manual de orden.

RLS: mismo patrón que el resto del catálogo — `select using (true)` (lectura pública) en ambas tablas, `for all using (is_admin())` (escritura solo admin) en ambas.

### Categorías (no viven en base de datos)

Las 2 categorías son fijas y su título/subtítulo de sección se hardcodean en un lookup map en código (mismo patrón que `ETIQUETA_CATEGORIA` en `lib/db/grupos-comunidad.types.ts`), no en la base de datos — no tiene sentido hacer editable algo que son solo 2 valores fijos:

```ts
export const CATEGORIA_EVENTO_INFO: Record<CategoriaEvento, { titulo: string; subtitulo: string }> = {
  internacional: {
    titulo: "Eventos Internacionales",
    subtitulo: "Conferencias y eventos fuera de EE.UU.",
  },
  nacional_eeuu: {
    titulo: "Eventos Nacionales en EE.UU.",
    subtitulo: "Conferencias y networking dentro de Estados Unidos",
  },
};
```

### Función pura `calcularEstadoFecha`

```ts
export type EstadoFecha = "realizado" | "en_ejecucion" | "proximo";

export function calcularEstadoFecha(fechaInicio: string, fechaFin: string, hoyIso: string): EstadoFecha {
  if (hoyIso < fechaInicio) return "proximo";
  if (hoyIso > fechaFin) return "realizado";
  return "en_ejecucion";
}
```

Las tres fechas (`fechaInicio`, `fechaFin`, `hoyIso`) son strings `"YYYY-MM-DD"` — se comparan lexicográficamente, no como objetos `Date`. Esto evita por completo los problemas de zona horaria de comparar objetos `Date` (que `lib/calendario/recurrencia.ts` sí necesita resolver porque maneja horarios de clases en vivo con hora real; acá solo importa el día calendario, así que la comparación de strings ISO es más simple y no tiene ese problema). `hoyIso` se pasa como parámetro en vez de calcularse internamente con `new Date()` — así la función es pura y testeable con cualquier "hoy" simulado.

### Extracción del ID de YouTube

```ts
export function extraerIdVideoYoutube(url: string): string | null {
  const coincidencia = url.match(/[?&]v=([^&]+)/);
  return coincidencia ? coincidencia[1] : null;
}
```

Se guarda el link normal (`watch?v=`) en la base de datos — más natural para que el admin lo pegue tal cual lo copia de YouTube — y esta función extrae el ID para armar la URL de embed (`https://www.youtube.com/embed/<id>`) en tiempo de render, mismo patrón que la conversión de dirección→URL de mapa en Oficinas.

## 3. Contenido real (datos semilla)

**Categoría `internacional`:**

1. **Florida como destino inmobiliario** — subtítulo "Cronograma de eventos 2026 · Bogotá, Distrito Capital" — video `https://www.youtube.com/watch?v=jV468IGkYtg` — orden 1
   - Fechas (todas en "Bogotá, Colombia"): 2026-01-30 a 2026-01-31, 2026-03-13 a 2026-03-14, 2026-05-22 a 2026-05-23, 2026-07-24 a 2026-07-25, 2026-09-25 a 2026-09-26, 2026-11-20 a 2026-11-21

**Categoría `nacional_eeuu`:**

2. **Eventos New York** — subtítulo "Conferencias y networking en la Gran Manzana" — video `https://www.youtube.com/watch?v=gSeIYfPnJ40` — orden 1
   - Fechas (todas en "New York, NY"): 2026-04-25 a 2026-04-26, 2026-08-22 a 2026-08-23, 2026-10-24 a 2026-10-25
3. **Legacy Impact 360** — subtítulo "Planificación trimestral · Conferencias, entrenamientos y networking" — sin video (`youtube_url = null`) — orden 2
   - Fechas: 2026-04-06 a 2026-04-06 ("Evento On line"), 2026-06-29 a 2026-06-29 ("Evento On line"), 2026-11-05 a 2026-11-05 ("Orlando, FL"), 2027-01-21 a 2027-01-27 ("Miami, FL")
4. **Tu sueño, tu casa Fest** — subtítulo "Evento especial de fin de semana · Orlando, Florida" — video `https://www.youtube.com/watch?v=b1ae3zIeE1k` — orden 3
   - Fechas (todas en "Orlando, FL"): 2026-06-06 a 2026-06-07, 2026-09-26 a 2026-09-27

**Encabezado de página:** "Eventos" / "Mantente informado sobre próximos eventos del equipo"

**CTA final:** botón "Solicitar más Información" → `https://wa.link/o926ih`, `target="_blank" rel="noopener noreferrer"`.

## 4. Diseño visual (compacto, sin emojis)

Decisión explícita del usuario: diseño más compacto que la referencia (que usa tarjetas grandes y un grid de "chips" de fecha espaciados), y sin emojis literales (los íconos de `lucide-react` sí se usan, igual que CRM/Oficinas).

- Tarjeta de evento más angosta que la referencia (`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6`, mismo patrón de tarjeta estándar del resto de la app).
- Si el evento tiene video: iframe de YouTube en tamaño reducido (no ancho completo de la tarjeta — ej. `max-w-sm` o similar dentro de la tarjeta), mismo tratamiento de contenedor (`aspect-video rounded-xl border`) que los mapas de Oficinas y el video de Loom del dashboard.
- Las fechas se listan en filas compactas (una línea por fecha: rango de fechas formateado + ubicación + badge de estado si aplica), no en un grid de chips grandes — permite ver las 2-6 fechas de un evento sin ocupar mucho espacio vertical.
- **Badges de estado**, dentro de la paleta ya documentada en `docs/design-system.md` (`ink`/`gold`/`mist`, sin introducir colores nuevos):
  - `"realizado"` → badge neutro `mist` (`border-white/10 text-mist-400`), texto "Realizado con éxito" — es solo información histórica, no necesita destacarse.
  - `"en_ejecucion"` → badge dorado (`border-gold-500/20 bg-gold-500/10 text-gold-300`), texto "En ejecución" — reutiliza el acento "activo/destacado" ya establecido en toda la app.
  - `"proximo"` → sin badge (igual que la referencia — un evento futuro no necesita etiqueta, la ausencia de badge ya comunica "aún no pasó").
- Formato de fecha mostrado: se construye a partir de `fechaInicio`/`fechaFin` reales con una función de formateo simple en español (ej. "30 y 31 de enero" o "21 al 27 de enero, 2027" para rangos que cruzan de mes/año) — no se guarda un texto de fecha separado, se deriva de las columnas `date` reales para que nunca queden desincronizados.

## 5. Capa de datos — nota sobre operaciones no atómicas

`crearEvento`/`actualizarEvento` en `lib/db/eventos.ts` escriben en dos tablas (insertan/actualizan el evento y luego reemplazan sus fechas) usando el cliente de Supabase desde JS, que no soporta transacciones multi-tabla reales sin una función RPC de Postgres. Para `actualizarEvento`, el enfoque es: actualizar la fila de `eventos`, borrar todas las filas de `eventos_fechas` de ese evento, e insertar el nuevo set completo — más simple que diffear fecha por fecha, aceptable para un panel de admin interno de bajo tráfico. Existe una ventana teórica de inconsistencia si un paso falla después de otro (ej. el evento se actualiza pero el insert de fechas falla) — no se construye una función RPC de Postgres para atomicidad real en este alcance; si esto llega a causar un problema real en producción, es una mejora futura, no algo que bloquee este módulo.

## 6. Panel de administración

Decisión explícita del usuario: formulario con fechas repetibles inline — al crear/editar un evento, el formulario incluye una lista dinámica de filas de fecha (inicio, fin, ubicación) con botones para agregar/quitar filas, todo se envía junto en un solo submit. Esta es la pieza más compleja de este módulo (un client component con estado local de array de filas de fecha).

- `/admin/eventos` — lista de eventos agrupados por categoría (mismo patrón de lista que otros admin), con formulario de creación.
- El formulario de evento incluye: categoría (select), título, subtítulo, URL de YouTube (opcional), orden, activo, y la lista repetible de fechas (cada fila: fecha inicio, fecha fin, ubicación).

## 7. Testing

- `calcularEstadoFecha()`: cobertura completa de los 3 estados más casos límite exactos (hoy == fechaInicio, hoy == fechaFin, un día antes/después de cada límite).
- `extraerIdVideoYoutube()`: casos con URL válida, URL sin parámetro `v`, y variantes de formato de URL de YouTube.
- `lib/db/eventos.ts`: mismo patrón de mocks de Supabase que `lib/db/aliados.ts`, incluyendo los casos de escritura en dos tablas.
- Componentes de tarjeta/lista de eventos: render con datos de ejemplo, confirmando agrupación por categoría, badges de estado correctos según fecha simulada, iframe de YouTube presente solo cuando `youtube_url` no es null.
- Formulario admin: agregar/quitar filas de fecha, envío correcto del array completo.

## 8. Fuera de alcance / decisiones explícitas

- El estado de cada fecha se calcula automáticamente a partir de fechas reales, no es un campo manual (decisión explícita del usuario) — los datos semilla mostrarán estados distintos a las capturas de referencia, es el comportamiento esperado.
- Tabla hija real (`eventos_fechas`) en vez de columnas de texto paralelas, a diferencia del patrón usado en `aliados`.
- Categorías fijas hardcodeadas en código, no editables desde el admin.
- Sin transacción atómica real para las escrituras de evento+fechas (limitación conocida y aceptada del cliente de Supabase JS, no bloqueante para este alcance).
- Sin emojis literales; sí se usan íconos `lucide-react` (decisión explícita del usuario).
- Diseño compacto: fechas en lista de filas, no grid de chips grandes; video en tamaño reducido, no ancho completo (decisión explícita del usuario).
