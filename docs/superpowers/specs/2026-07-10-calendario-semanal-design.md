# Calendario semanal — `/calendario` (estudiante) + `/admin/calendario`

> Reemplaza el stub de `app/(estudiante)/calendario/page.tsx` por un calendario semanal real de las reuniones del equipo (Team 100% Real Estate), con datos en Supabase y un panel admin mínimo para gestionarlas. Referencia arquitectónica: `docs/Estructura calendario.md`. Referencia de animaciones: `docs/animaciones.md`.

## 1. Alcance

| Archivo | Cambio |
|---|---|
| `supabase/migrations/007_calendario.sql` | Nuevo — tabla `clases_calendario`, enums, RLS, datos semilla (9 reuniones) |
| `lib/db/calendario.ts` + `.test.ts` | Nuevo — `getClasesCalendario()`, `crearClase()`, `actualizarClase()`, `eliminarClase()` |
| `lib/calendario/recurrencia.ts` + `.test.ts` | Nuevo — funciones puras: rango de semana, ocurrencias por semana, conversión de zona horaria |
| `app/(estudiante)/calendario/page.tsx` | Reescritura — server component, fetch + delega a componente cliente |
| `components/estudiante/calendario/*.tsx` | Nuevo — `CalendarioSemanal`, `MiniMonthCalendar`, `CalendarToolbar`, `WeekGrid`, `EventCard`, `EventDetailPanel` |
| `app/(admin)/admin/calendario/page.tsx` | Nuevo — lista + formulario de clases |
| `app/(admin)/admin/calendario/actions.ts` | Nuevo — server actions CRUD |
| `components/admin/calendario/ClaseForm.tsx` | Nuevo |

No se toca `EstudianteShell` (el sidebar de esta página es local, ver §3). No se crea un `AdminShell` — el layout admin actual (`max-w-5xl` sin nav) se mantiene igual.

## 2. Modelo de datos

```sql
create type modalidad_clase as enum ('online', 'presencial', 'hibrida');
create type recurrencia_clase as enum ('semanal', 'quincenal', 'unica');

create table clases_calendario (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_ancla date not null,        -- primera ocurrencia; define el día de la semana
  hora_inicio time not null,        -- hora de pared en America/New_York
  hora_fin time not null,
  dirigido_por text,
  modalidad modalidad_clase not null default 'online',
  enlace_sesion text,
  enlace_preguntas text,
  imagen_url text,
  recurrencia recurrencia_clase not null default 'semanal',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index clases_calendario_activo_idx on clases_calendario(activo);

alter table clases_calendario enable row level security;
create policy "clases_calendario_select_all" on clases_calendario for select using (true);
create policy "clases_calendario_admin_all" on clases_calendario for all using (is_admin()) with check (is_admin());
```

Datos semilla: las 9 reuniones descritas por el usuario (Lunes: Estrategia y Dirección 9:00–10:00 online semanal; Modelo de Rentas 10:00–11:00 online quincenal, dirige Wilmar Sosa; Martes: Conversaciones en Ventas 9:00–10:00 dirige Wilmar Sosa; Mercadeo y IA 10:00–11:00 dirige Samuel Oropeza; Visas para Inversionistas 18:00–19:00 dirige Katterin Rendon; Miércoles: Prácticas y Objeciones 9:00–10:00 dirige Carolina de la Cruz (con `enlace_preguntas`); Créditos Hipotecarios 10:00–11:00 dirige Claudia Aparicio; Visita Oficina Orlando 14:00–15:00 presencial dirige "Líderes del Team"; Viernes: Prácticas y Objeciones 9:00–10:00 dirige Carolina de la Cruz; Onboarding 10:00–11:00 dirige "Yusleidy Mesa y Ruby Moyeda"). `fecha_ancla` = primera fecha de 2026 en que cada una cae en su día de la semana correspondiente. Duración por defecto 60 min salvo que se indique otra.

## 3. Lógica de recurrencia y zona horaria (`lib/calendario/recurrencia.ts`)

Funciones puras, sin dependencias externas nuevas:

- `getInicioSemana(fecha: Date): Date` — lunes de la semana que contiene `fecha`.
- `getOcurrenciasEnSemana(clase: ClaseCalendario, inicioSemana: Date): Date | null` — devuelve la fecha concreta de esa semana si la clase aplica, o `null`:
  - `unica`: solo si `inicioSemana` es la semana de `fecha_ancla`.
  - `semanal`: si `diffEnDias(inicioSemana, ancladoALunes(fecha_ancla)) % 7 === 0`.
  - `quincenal`: igual pero `% 14 === 0`.
- `zonedTimeToUtc(fecha: string, hora: string, tz = "America/New_York"): Date` — implementación manual vía `Intl.DateTimeFormat` (patrón estándar: formatear en la zona destino y ajustar el offset), sin añadir `date-fns-tz`. Maneja EST/EDT automáticamente.
- Todo el layout de la grilla trabaja con instantes UTC ya calculados y los presenta con `toLocaleTimeString` en la zona horaria del navegador (implícita, sin especificar `timeZone`).

## 4. Página del estudiante — árbol de componentes

```
CalendarioPage (server)                    app/(estudiante)/calendario/page.tsx
 └─ getClasesCalendario()
 └─ <CalendarioSemanal clases>  (client)
     ├─ Sidebar (local a esta página, ancho fijo ~272px, sticky en lg+)
     │   └─ MiniMonthCalendar (mes visible, resalta semana seleccionada, click cambia semana)
     ├─ PageHeader ("Calendario semanal" + rango de fechas visible)
     ├─ CalendarToolbar
     │   ├─ NavigationGroup: ‹  Hoy  ›
     │   └─ ViewSelector: "Semana" activo; Día/Mes/Agenda deshabilitados (etiqueta "Próximamente",
     │        mismo patrón visual que los NavLink bloqueados de nav-config)
     └─ WeekGrid
         ├─ Header (Lun–Dom + fecha)
         ├─ TimeAxis (rango dinámico: min/max hora de eventos de la semana ± 1h de margen;
         │      fallback 8:00–18:00 si no hay eventos)
         └─ EventsLayer → EventCard por ocurrencia (top = inicio, height = duración)
```

Simplificaciones deliberadas frente a `docs/Estructura calendario.md` (menos superficie, mismo resultado funcional):
- Sin `RangeSelector` desplegable independiente — el `MiniMonthCalendar` ya cubre selección de semana/mes.
- Sin botón "Nueva actividad" en esta vista (solo lectura; la creación es rol admin).
- Sin resolución configurable de intervalos (15/30/60 min) — filas fijas de 60 min, suficiente para ~9 reuniones sin solapamientos.

**EventCard**: imagen (`imagen_url`) + nombre + horario local (con referencia pequeña "· EST" solo si difiere del huso local) + `dirigido_por` + badge de modalidad. Click abre `EventDetailPanel` con "Unirse por Zoom" (`enlace_sesion`) y, si existe, "Ver preguntas / precalificación" (`enlace_preguntas`).

**Responsive**: bajo `lg`, el Sidebar se apila arriba del contenido (mismo breakpoint que usa hoy `EstudianteShell` para su menú).

## 5. Panel admin — `/admin/calendario`

Página simple (consistente con el placeholder actual, sin agregar un `AdminShell`):
- Tabla de clases existentes con editar/eliminar inline.
- Formulario "Nueva clase" (`ClaseForm`) siguiendo el patrón de `RegistroForm` + `useActionState`.
- `actions.ts`: `crearClase`, `actualizarClase`, `eliminarClase` — protegidas por RLS (`is_admin()`) y por `requireRol("admin")` ya aplicado en `app/(admin)/layout.tsx`.

## 6. Animaciones (reusa `lib/motion.ts`, no se crean variants nuevas salvo las listadas)

| Elemento | Patrón (`docs/animaciones.md`) |
|---|---|
| Carga inicial (sidebar + columnas de días) | `staggerContainer` + `blurFadeUp` (patrón 1) |
| Hover de `EventCard` | `whileHover={{ y: -4 }}`, `whileTap={{ scale: 0.98 }}` (patrón 2B) |
| Cambio de semana (‹ ›) | `AnimatePresence` + slide/fade direccional, `EASE_OUT`; nueva variant local `weekSlide` |
| Resaltado de semana en mini-calendario | `layoutId` para desplazamiento suave; fade simple al cambiar de mes |
| Botones de control (Hoy, flechas) | micro-escala táctil (patrón 2C) |
| `EventDetailPanel` | fondo opaco `bg-ink-950` + `backdrop-blur-xl` + `shadow-[0_20px_50px_rgba(0,0,0,0.65)]`, entrada `{opacity:0,y:12}` (patrón 3) |

Todas las animaciones respetan `useReducedMotionSafe()` (ya existente en `lib/motion.ts`): con motion reducido, slides se sustituyen por fade simple.

## 7. Testing

- `lib/calendario/recurrencia.test.ts`: casos de `semanal`/`quincenal`/`unica` cruzando límites de semana, y conversión EST↔EDT en fechas de cambio de horario.
- `lib/db/calendario.test.ts`: sigue el patrón de `lib/db/cursos.test.ts` (mock del cliente Supabase).
- Sin tests de integración de UI nuevos más allá de lo ya existente en el repo (no hay ese patrón hoy para componentes cliente complejos).
