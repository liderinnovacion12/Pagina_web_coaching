# Calendario Semanal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el stub de `/calendario` por un calendario semanal real de las reuniones del equipo, respaldado por una tabla Supabase (`clases_calendario`), con un panel admin mínimo para gestionarla.

**Architecture:** Server component en `/calendario` que hace fetch y delega a un componente cliente (`CalendarioSemanal`) que compone un sidebar propio (mini-calendario), un toolbar y una grilla semanal calculada con funciones puras de recurrencia y zona horaria. El panel `/admin/calendario` reutiliza la misma capa de datos (`lib/db/calendario.ts`) vía server actions.

**Tech Stack:** Next.js 15 (App Router), React 19, Supabase (`@supabase/ssr`), Framer Motion (`lib/motion.ts`), Tailwind, Vitest.

**Nota sobre eficiencia de tokens (harness engineering):** cada tarea de este plan es autocontenida — trae el código completo y las rutas exactas de archivo — para que un subagente fresco no necesite re-explorar el repo. Las tareas de UI (Sidebar/Toolbar/EventCard/etc.) no requieren tests nuevos: el repo no tiene ese patrón hoy para componentes cliente complejos (decisión ya confirmada en el spec, sección 7); solo la lógica pura (`recurrencia.ts`) y la capa de datos (`lib/db/calendario.ts`) llevan TDD. Evita relecturas de archivos ya mostrados en este plan al ejecutar cada tarea.

**Spec de referencia:** `docs/superpowers/specs/2026-07-10-calendario-semanal-design.md`

---

## Task 0: Determinismo de zona horaria en tests

**Files:**
- Modify: `vitest.config.mjs`

- [ ] **Step 1: Fijar `TZ=UTC` para el proceso de tests**

Uno de los tests de la Task 2 (`getRangoHorasSemana`) usa `Date.prototype.getHours()`, que depende de la zona horaria del sistema. Fijamos `TZ=UTC` para que el resultado sea el mismo en cualquier máquina/CI.

```js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    env: { TZ: "UTC" },
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./"),
    },
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add vitest.config.mjs
git commit -m "test: fija TZ=UTC en vitest para pruebas de fecha deterministas"
```

---

## Task 1: Migración Supabase — tabla `clases_calendario`

**Files:**
- Create: `supabase/migrations/007_calendario.sql`

Esta migración se aplica **manualmente en el SQL Editor de Supabase** (no hay CLI en este proyecto — ver `supabase/migrations/README.md`). No hay test automatizado para este paso; el engineer debe pegarlo y ejecutarlo contra la base de datos del proyecto.

- [ ] **Step 1: Crear el archivo de migración**

```sql
-- 007_calendario.sql
-- Tabla de clases/reuniones del calendario semanal del equipo. Mismo
-- patrón que 005_miembros_equipo.sql y 006_galeria_equipo.sql: catálogo de
-- lectura pública (cualquier autenticado), gestionado solo por un admin.
-- Depende de 001_esquema.sql y 002_usuarios.sql (usa is_admin()).
--
-- hora_inicio/hora_fin se interpretan como hora de pared en
-- America/New_York (EST/EDT según la fecha); la conversión a la zona
-- horaria del navegador ocurre en el frontend (lib/calendario/recurrencia.ts).
--
-- La recurrencia no genera una fila por semana: fecha_ancla marca la
-- primera ocurrencia (y define el día de la semana) y `recurrencia`
-- indica cada cuánto se repite. El cálculo de en qué semanas aplica cada
-- clase vive en lib/calendario/recurrencia.ts (getOcurrenciaEnSemana).

create type modalidad_clase as enum ('online', 'presencial', 'hibrida');
create type recurrencia_clase as enum ('semanal', 'quincenal', 'unica');

create table clases_calendario (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_ancla date not null,
  hora_inicio time not null,
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

-- Datos semilla: reuniones semanales del equipo para 2026. fecha_ancla usa
-- la primera semana completa de enero 2026 (lunes 5 a viernes 9) como
-- referencia del día de la semana de cada clase. Los enlaces (Zoom,
-- preguntas, imagen) quedan en NULL — se completan desde /admin/calendario.
insert into clases_calendario
  (nombre, fecha_ancla, hora_inicio, hora_fin, dirigido_por, modalidad, recurrencia)
values
  ('Reunión de Equipo – Estrategia y Dirección', '2026-01-05', '09:00', '10:00', null, 'online', 'semanal'),
  ('Reunión Modelo de Rentas', '2026-01-05', '10:00', '11:00', 'Wilmar Sosa', 'online', 'quincenal'),
  ('Conversaciones en Ventas', '2026-01-06', '09:00', '10:00', 'Wilmar Sosa', 'online', 'semanal'),
  ('Mercadeo y IA', '2026-01-06', '10:00', '11:00', 'Samuel Oropeza', 'online', 'semanal'),
  ('Reunión Visas para Inversionistas', '2026-01-06', '18:00', '19:00', 'Katterin Rendon', 'online', 'semanal'),
  ('Prácticas y Objeciones en Conversaciones de Venta', '2026-01-07', '09:00', '10:00', 'Carolina de la Cruz', 'online', 'semanal'),
  ('Créditos Hipotecarios', '2026-01-07', '10:00', '11:00', 'Claudia Aparicio', 'online', 'semanal'),
  ('Visita Oficina Orlando My Realty', '2026-01-07', '14:00', '15:00', 'Líderes del Team', 'presencial', 'semanal'),
  ('Prácticas y Objeciones en Conversaciones de Venta', '2026-01-09', '09:00', '10:00', 'Carolina de la Cruz', 'online', 'semanal'),
  ('Onboarding Team 100% Real Estate', '2026-01-09', '10:00', '11:00', 'Yusleidy Mesa y Ruby Moyeda', 'online', 'semanal');
```

- [ ] **Step 2: Aplicar en Supabase**

Pega el contenido en el SQL Editor del proyecto Supabase y ejecútalo. Verifica que no haya errores y que `select count(*) from clases_calendario;` devuelva `10`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/007_calendario.sql
git commit -m "feat(db): agrega tabla clases_calendario con RLS y datos semilla"
```

---

## Task 2: Lógica pura de recurrencia y zona horaria

**Files:**
- Create: `lib/calendario/recurrencia.ts`
- Test: `lib/calendario/recurrencia.test.ts`

- [ ] **Step 1: Escribir el test completo (falla porque el módulo no existe)**

```ts
// lib/calendario/recurrencia.test.ts
import { describe, it, expect } from "vitest";
import {
  getInicioSemana,
  getOcurrenciaEnSemana,
  zonedTimeToUtc,
  getRangoHorasSemana,
  formatRangoSemana,
  formatHora,
  aFechaISO,
} from "./recurrencia";

describe("getInicioSemana", () => {
  it("retorna el mismo lunes si la fecha ya es lunes", () => {
    expect(getInicioSemana(new Date(2026, 0, 5))).toEqual(new Date(2026, 0, 5));
  });

  it("retrocede hasta el lunes cuando la fecha es miércoles", () => {
    expect(getInicioSemana(new Date(2026, 0, 7))).toEqual(new Date(2026, 0, 5));
  });

  it("retrocede hasta el lunes cuando la fecha es domingo", () => {
    expect(getInicioSemana(new Date(2026, 0, 11))).toEqual(new Date(2026, 0, 5));
  });
});

describe("getOcurrenciaEnSemana", () => {
  it("recurrencia semanal: aparece cada 7 días desde la fecha ancla", () => {
    const inicioSemana = getInicioSemana(new Date(2026, 0, 20));
    expect(getOcurrenciaEnSemana("2026-01-06", "semanal", inicioSemana)).toEqual(
      new Date(2026, 0, 20)
    );
  });

  it("recurrencia semanal: null antes de la fecha ancla", () => {
    const inicioSemana = getInicioSemana(new Date(2025, 11, 29));
    expect(getOcurrenciaEnSemana("2026-01-06", "semanal", inicioSemana)).toBeNull();
  });

  it("recurrencia quincenal: solo aparece cada 14 días", () => {
    const semanaIntermedia = getInicioSemana(new Date(2026, 0, 12));
    const semanaQueToca = getInicioSemana(new Date(2026, 0, 19));

    expect(getOcurrenciaEnSemana("2026-01-05", "quincenal", semanaIntermedia)).toBeNull();
    expect(getOcurrenciaEnSemana("2026-01-05", "quincenal", semanaQueToca)).toEqual(
      new Date(2026, 0, 19)
    );
  });

  it("recurrencia única: solo aparece en la semana de la fecha ancla", () => {
    const semanaAncla = getInicioSemana(new Date(2026, 0, 7));
    const otraSemana = getInicioSemana(new Date(2026, 0, 14));

    expect(getOcurrenciaEnSemana("2026-01-07", "unica", semanaAncla)).toEqual(
      new Date(2026, 0, 7)
    );
    expect(getOcurrenciaEnSemana("2026-01-07", "unica", otraSemana)).toBeNull();
  });
});

describe("zonedTimeToUtc", () => {
  it("convierte hora de invierno (EST, UTC-5) a UTC", () => {
    expect(zonedTimeToUtc("2026-01-05", "09:00").toISOString()).toBe(
      "2026-01-05T14:00:00.000Z"
    );
  });

  it("convierte hora de verano (EDT, UTC-4) a UTC", () => {
    expect(zonedTimeToUtc("2026-07-06", "09:00").toISOString()).toBe(
      "2026-07-06T13:00:00.000Z"
    );
  });
});

describe("getRangoHorasSemana", () => {
  it("retorna el rango por defecto si no hay ocurrencias", () => {
    expect(getRangoHorasSemana([])).toEqual({ horaInicio: 8, horaFin: 18 });
  });

  it("calcula el rango con un margen de una hora respecto a los eventos", () => {
    const ocurrencias = [
      { inicioUtc: new Date("2026-01-05T09:00:00Z"), finUtc: new Date("2026-01-05T10:00:00Z") },
      { inicioUtc: new Date("2026-01-06T18:00:00Z"), finUtc: new Date("2026-01-06T19:00:00Z") },
    ];
    expect(getRangoHorasSemana(ocurrencias)).toEqual({ horaInicio: 8, horaFin: 20 });
  });
});

describe("formatRangoSemana", () => {
  it("formatea un rango dentro del mismo mes", () => {
    expect(formatRangoSemana(new Date(2026, 0, 5))).toBe("5–11 enero 2026");
  });

  it("formatea un rango que cruza de mes", () => {
    expect(formatRangoSemana(new Date(2026, 0, 26))).toBe("26 enero – 1 febrero 2026");
  });
});

describe("formatHora", () => {
  it("formatea horas AM y PM sin ceros a la izquierda en la hora", () => {
    expect(formatHora(9, 0)).toBe("9:00 AM");
    expect(formatHora(18, 5)).toBe("6:05 PM");
    expect(formatHora(0, 0)).toBe("12:00 AM");
    expect(formatHora(12, 30)).toBe("12:30 PM");
  });
});

describe("aFechaISO", () => {
  it("formatea una fecha local como YYYY-MM-DD", () => {
    expect(aFechaISO(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npm test -- recurrencia`
Expected: FAIL — `Cannot find module './recurrencia'`

- [ ] **Step 3: Implementar `lib/calendario/recurrencia.ts`**

```ts
// lib/calendario/recurrencia.ts
export type Recurrencia = "semanal" | "quincenal" | "unica";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function diaSemanaISO(fecha: Date): number {
  const dia = fecha.getDay();
  return dia === 0 ? 6 : dia - 1; // 0 = lunes ... 6 = domingo
}

export function getInicioSemana(fecha: Date): Date {
  const dia = fecha.getDay();
  const diffALunes = dia === 0 ? -6 : 1 - dia;
  const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + diffALunes);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

export function getOcurrenciaEnSemana(
  fechaAncla: string,
  recurrencia: Recurrencia,
  inicioSemana: Date
): Date | null {
  const ancla = new Date(`${fechaAncla}T00:00:00`);
  const inicioSemanaAncla = getInicioSemana(ancla);
  const diffDias = Math.round(
    (inicioSemana.getTime() - inicioSemanaAncla.getTime()) / 86_400_000
  );

  if (diffDias < 0) return null;
  if (recurrencia === "unica" && diffDias !== 0) return null;
  if (recurrencia === "semanal" && diffDias % 7 !== 0) return null;
  if (recurrencia === "quincenal" && diffDias % 14 !== 0) return null;

  const ocurrencia = new Date(inicioSemana);
  ocurrencia.setDate(inicioSemana.getDate() + diaSemanaISO(ancla));
  return ocurrencia;
}

/**
 * Convierte una hora de pared (fecha + "HH:mm") en una zona horaria dada a
 * un instante UTC. Algoritmo estándar: se interpreta la hora de pared como
 * si ya fuera UTC, se formatea ese instante en la zona destino, y se
 * corrige por la diferencia — maneja EST/EDT automáticamente sin
 * dependencias externas.
 */
export function zonedTimeToUtc(
  fechaISO: string,
  horaHHmm: string,
  tz = "America/New_York"
): Date {
  const supuestaUtc = new Date(`${fechaISO}T${horaHHmm}:00Z`);

  const formateador = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const partes = formateador.formatToParts(supuestaUtc).reduce<Record<string, string>>(
    (acc, parte) => {
      if (parte.type !== "literal") acc[parte.type] = parte.value;
      return acc;
    },
    {}
  );

  const comoSiUtc = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    Number(partes.hour) % 24,
    Number(partes.minute),
    Number(partes.second)
  );

  const offsetMs = comoSiUtc - supuestaUtc.getTime();
  return new Date(supuestaUtc.getTime() - offsetMs);
}

export function getRangoHorasSemana(
  ocurrencias: { inicioUtc: Date; finUtc: Date }[]
): { horaInicio: number; horaFin: number } {
  if (ocurrencias.length === 0) return { horaInicio: 8, horaFin: 18 };

  const horasInicio = ocurrencias.map((o) => o.inicioUtc.getHours());
  const horasFin = ocurrencias.map(
    (o) => o.finUtc.getHours() + (o.finUtc.getMinutes() > 0 ? 1 : 0)
  );

  return {
    horaInicio: Math.max(0, Math.min(...horasInicio) - 1),
    horaFin: Math.min(24, Math.max(...horasFin) + 1),
  };
}

export function formatRangoSemana(inicioSemana: Date): string {
  const fin = new Date(
    inicioSemana.getFullYear(),
    inicioSemana.getMonth(),
    inicioSemana.getDate() + 6
  );

  if (inicioSemana.getMonth() === fin.getMonth()) {
    return `${inicioSemana.getDate()}–${fin.getDate()} ${MESES[fin.getMonth()]} ${fin.getFullYear()}`;
  }

  return `${inicioSemana.getDate()} ${MESES[inicioSemana.getMonth()]} – ${fin.getDate()} ${MESES[fin.getMonth()]} ${fin.getFullYear()}`;
}

export function formatHora(hora: number, minuto: number): string {
  const horas12 = hora % 12 === 0 ? 12 : hora % 12;
  const sufijo = hora < 12 ? "AM" : "PM";
  return `${horas12}:${String(minuto).padStart(2, "0")} ${sufijo}`;
}

export function aFechaISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npm test -- recurrencia`
Expected: PASS (14 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/calendario/recurrencia.ts lib/calendario/recurrencia.test.ts
git commit -m "feat(calendario): agrega logica pura de recurrencia y zona horaria"
```

---

## Task 3: Capa de datos — `lib/db/calendario.ts`

**Files:**
- Create: `lib/db/calendario.ts`
- Test: `lib/db/calendario.test.ts`

- [ ] **Step 1: Escribir el test completo**

```ts
// lib/db/calendario.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const filaEjemplo = {
  id: "1",
  nombre: "Conversaciones en Ventas",
  fecha_ancla: "2026-01-06",
  hora_inicio: "09:00",
  hora_fin: "10:00",
  dirigido_por: "Wilmar Sosa",
  modalidad: "online",
  enlace_sesion: null,
  enlace_preguntas: null,
  imagen_url: null,
  recurrencia: "semanal",
  activo: true,
};

const claseMapeada = {
  id: "1",
  nombre: "Conversaciones en Ventas",
  fechaAncla: "2026-01-06",
  horaInicio: "09:00",
  horaFin: "10:00",
  dirigidoPor: "Wilmar Sosa",
  modalidad: "online",
  enlaceSesion: null,
  enlacePreguntas: null,
  imagenUrl: null,
  recurrencia: "semanal",
  activo: true,
};

const claseInputEjemplo = {
  nombre: "Onboarding",
  fechaAncla: "2026-01-09",
  horaInicio: "10:00",
  horaFin: "11:00",
  dirigidoPor: "Yusleidy Mesa",
  modalidad: "online" as const,
  enlaceSesion: null,
  enlacePreguntas: null,
  imagenUrl: null,
  recurrencia: "semanal" as const,
  activo: true,
};

describe("getClasesCalendario", () => {
  const orderMock = vi.fn(async () => ({ data: [filaEjemplo], error: null }));
  const eqMock = vi.fn(() => ({ order: orderMock }));
  const selectMock = vi.fn(() => ({ eq: eqMock }));
  const fromMock = vi.fn(() => ({ select: selectMock }));

  beforeEach(() => {
    fromMock.mockClear();
    selectMock.mockClear();
    eqMock.mockClear();
    orderMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("consulta solo clases activas, ordenadas por fecha ancla", async () => {
    const { getClasesCalendario } = await import("./calendario");
    const clases = await getClasesCalendario();

    expect(fromMock).toHaveBeenCalledWith("clases_calendario");
    expect(eqMock).toHaveBeenCalledWith("activo", true);
    expect(orderMock).toHaveBeenCalledWith("fecha_ancla");
    expect(clases).toEqual([claseMapeada]);
  });

  it("lanza un error legible si Supabase falla", async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: { message: "timeout" } });

    const { getClasesCalendario } = await import("./calendario");

    await expect(getClasesCalendario()).rejects.toThrow(
      "No se pudieron cargar las clases: timeout"
    );
  });
});

describe("getTodasLasClases", () => {
  const orderMock = vi.fn(async () => ({ data: [filaEjemplo], error: null }));
  const selectMock = vi.fn(() => ({ order: orderMock }));
  const fromMock = vi.fn(() => ({ select: selectMock }));

  beforeEach(() => {
    orderMock.mockClear();
    selectMock.mockClear();
    fromMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("consulta todas las clases sin filtrar por activo", async () => {
    const { getTodasLasClases } = await import("./calendario");
    const clases = await getTodasLasClases();

    expect(orderMock).toHaveBeenCalledWith("fecha_ancla");
    expect(clases).toEqual([claseMapeada]);
  });
});

describe("crearClase", () => {
  const insertMock = vi.fn(async () => ({ error: null }));
  const fromMock = vi.fn(() => ({ insert: insertMock }));

  beforeEach(() => {
    insertMock.mockClear();
    fromMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("inserta la clase mapeando los campos a snake_case", async () => {
    const { crearClase } = await import("./calendario");
    await crearClase(claseInputEjemplo);

    expect(fromMock).toHaveBeenCalledWith("clases_calendario");
    expect(insertMock).toHaveBeenCalledWith({
      nombre: "Onboarding",
      fecha_ancla: "2026-01-09",
      hora_inicio: "10:00",
      hora_fin: "11:00",
      dirigido_por: "Yusleidy Mesa",
      modalidad: "online",
      enlace_sesion: null,
      enlace_preguntas: null,
      imagen_url: null,
      recurrencia: "semanal",
      activo: true,
    });
  });

  it("lanza un error legible si Supabase falla", async () => {
    insertMock.mockResolvedValueOnce({ error: { message: "duplicado" } });

    const { crearClase } = await import("./calendario");

    await expect(crearClase(claseInputEjemplo)).rejects.toThrow(
      "No se pudo crear la clase: duplicado"
    );
  });
});

describe("actualizarClase", () => {
  const eqMock = vi.fn(async () => ({ error: null }));
  const updateMock = vi.fn(() => ({ eq: eqMock }));
  const fromMock = vi.fn(() => ({ update: updateMock }));

  beforeEach(() => {
    eqMock.mockClear();
    updateMock.mockClear();
    fromMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("actualiza la clase por id mapeando los campos a snake_case", async () => {
    const { actualizarClase } = await import("./calendario");
    await actualizarClase("1", { ...claseInputEjemplo, activo: false });

    expect(fromMock).toHaveBeenCalledWith("clases_calendario");
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: "Onboarding", activo: false })
    );
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });
});

describe("eliminarClase", () => {
  const eqMock = vi.fn(async () => ({ error: null }));
  const deleteMock = vi.fn(() => ({ eq: eqMock }));
  const fromMock = vi.fn(() => ({ delete: deleteMock }));

  beforeEach(() => {
    eqMock.mockClear();
    deleteMock.mockClear();
    fromMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("elimina la clase por id", async () => {
    const { eliminarClase } = await import("./calendario");
    await eliminarClase("1");

    expect(fromMock).toHaveBeenCalledWith("clases_calendario");
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npm test -- lib/db/calendario`
Expected: FAIL — `Cannot find module './calendario'`

- [ ] **Step 3: Implementar `lib/db/calendario.ts`**

```ts
// lib/db/calendario.ts
import { createClient } from "@/lib/supabase/server";

export type ModalidadClase = "online" | "presencial" | "hibrida";
export type RecurrenciaClase = "semanal" | "quincenal" | "unica";

export const ETIQUETA_MODALIDAD: Record<ModalidadClase, string> = {
  online: "Virtual",
  presencial: "Presencial",
  hibrida: "Híbrida",
};

export type ClaseCalendario = {
  id: string;
  nombre: string;
  fechaAncla: string;
  horaInicio: string;
  horaFin: string;
  dirigidoPor: string | null;
  modalidad: ModalidadClase;
  enlaceSesion: string | null;
  enlacePreguntas: string | null;
  imagenUrl: string | null;
  recurrencia: RecurrenciaClase;
  activo: boolean;
};

export type ClaseCalendarioInput = Omit<ClaseCalendario, "id">;

const COLUMNAS =
  "id, nombre, fecha_ancla, hora_inicio, hora_fin, dirigido_por, modalidad, enlace_sesion, enlace_preguntas, imagen_url, recurrencia, activo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFila(fila: any): ClaseCalendario {
  return {
    id: fila.id,
    nombre: fila.nombre,
    fechaAncla: fila.fecha_ancla,
    horaInicio: fila.hora_inicio,
    horaFin: fila.hora_fin,
    dirigidoPor: fila.dirigido_por,
    modalidad: fila.modalidad,
    enlaceSesion: fila.enlace_sesion,
    enlacePreguntas: fila.enlace_preguntas,
    imagenUrl: fila.imagen_url,
    recurrencia: fila.recurrencia,
    activo: fila.activo,
  };
}

export async function getClasesCalendario(): Promise<ClaseCalendario[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clases_calendario")
    .select(COLUMNAS)
    .eq("activo", true)
    .order("fecha_ancla");

  if (error) throw new Error(`No se pudieron cargar las clases: ${error.message}`);
  return (data ?? []).map(mapFila);
}

export async function getTodasLasClases(): Promise<ClaseCalendario[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clases_calendario")
    .select(COLUMNAS)
    .order("fecha_ancla");

  if (error) throw new Error(`No se pudieron cargar las clases: ${error.message}`);
  return (data ?? []).map(mapFila);
}

function aFilaSupabase(input: ClaseCalendarioInput) {
  return {
    nombre: input.nombre,
    fecha_ancla: input.fechaAncla,
    hora_inicio: input.horaInicio,
    hora_fin: input.horaFin,
    dirigido_por: input.dirigidoPor,
    modalidad: input.modalidad,
    enlace_sesion: input.enlaceSesion,
    enlace_preguntas: input.enlacePreguntas,
    imagen_url: input.imagenUrl,
    recurrencia: input.recurrencia,
    activo: input.activo,
  };
}

export async function crearClase(input: ClaseCalendarioInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("clases_calendario").insert(aFilaSupabase(input));

  if (error) throw new Error(`No se pudo crear la clase: ${error.message}`);
}

export async function actualizarClase(id: string, input: ClaseCalendarioInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clases_calendario")
    .update(aFilaSupabase(input))
    .eq("id", id);

  if (error) throw new Error(`No se pudo actualizar la clase: ${error.message}`);
}

export async function eliminarClase(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("clases_calendario").delete().eq("id", id);

  if (error) throw new Error(`No se pudo eliminar la clase: ${error.message}`);
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npm test -- lib/db/calendario`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/db/calendario.ts lib/db/calendario.test.ts
git commit -m "feat(calendario): agrega capa de datos para clases_calendario"
```

---

## Task 4: `EventCard` — tarjeta de una clase en la grilla

**Files:**
- Create: `components/estudiante/calendario/EventCard.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// components/estudiante/calendario/EventCard.tsx
"use client";

import { motion } from "framer-motion";
import { ETIQUETA_MODALIDAD } from "@/lib/db/calendario";
import { formatHora } from "@/lib/calendario/recurrencia";
import type { OcurrenciaClase } from "./WeekGrid";

export function EventCard({
  ocurrencia,
  posicion,
  onClick,
}: {
  ocurrencia: OcurrenciaClase;
  posicion: { top: number; height: number };
  onClick: () => void;
}) {
  const { clase } = ocurrencia;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={{ top: posicion.top, height: posicion.height }}
      className="absolute inset-x-1 flex flex-col overflow-hidden rounded-lg border border-white/10 bg-ink-800 p-2 text-left shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-colors duration-150 hover:border-gold-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
    >
      <p className="truncate text-xs font-semibold text-white">{clase.nombre}</p>
      <p className="text-[11px] text-mist-400">
        {formatHora(ocurrencia.inicioUtc.getHours(), ocurrencia.inicioUtc.getMinutes())}–
        {formatHora(ocurrencia.finUtc.getHours(), ocurrencia.finUtc.getMinutes())}
      </p>
      {clase.dirigidoPor && (
        <p className="truncate text-[11px] text-mist-500">{clase.dirigidoPor}</p>
      )}
      <span className="mt-auto inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] px-1.5 py-px text-[9px] uppercase tracking-wider text-mist-400">
        {ETIQUETA_MODALIDAD[clase.modalidad]}
      </span>
    </motion.button>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: error esperado por ahora — `WeekGrid` (Task 5) aún no existe. Continúa a la siguiente tarea antes de verificar de nuevo.

- [ ] **Step 3: Commit**

```bash
git add components/estudiante/calendario/EventCard.tsx
git commit -m "feat(calendario): agrega EventCard para la grilla semanal"
```

---

## Task 5: `WeekGrid` — cuadrícula semanal (header + eje horario + eventos)

**Files:**
- Create: `components/estudiante/calendario/WeekGrid.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// components/estudiante/calendario/WeekGrid.tsx
"use client";

import type { ClaseCalendario } from "@/lib/db/calendario";
import { getRangoHorasSemana, formatHora } from "@/lib/calendario/recurrencia";
import { EventCard } from "./EventCard";

export type OcurrenciaClase = {
  clase: ClaseCalendario;
  fecha: Date;
  inicioUtc: Date;
  finUtc: Date;
};

const ALTURA_HORA = 64;
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function esMismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function WeekGrid({
  semanaActual,
  ocurrencias,
  onSeleccionarOcurrencia,
}: {
  semanaActual: Date;
  ocurrencias: OcurrenciaClase[];
  onSeleccionarOcurrencia: (ocurrencia: OcurrenciaClase) => void;
}) {
  const dias = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(semanaActual);
    fecha.setDate(semanaActual.getDate() + i);
    return fecha;
  });

  const { horaInicio, horaFin } = getRangoHorasSemana(
    ocurrencias.map((o) => ({ inicioUtc: o.inicioUtc, finUtc: o.finUtc }))
  );
  const horas = Array.from({ length: horaFin - horaInicio }, (_, i) => horaInicio + i);
  const hoy = new Date();

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-900/40">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-white/10">
          <div />
          {dias.map((fecha, i) => (
            <div
              key={fecha.toISOString()}
              className="border-l border-white/10 px-2 py-3 text-center"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-mist-500">
                {DIAS[i]}
              </p>
              <p
                className={`mt-1 text-lg font-semibold ${
                  esMismoDia(fecha, hoy) ? "text-gold-300" : "text-white"
                }`}
              >
                {fecha.getDate()}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[64px_repeat(7,1fr)]">
          <div className="relative">
            {horas.map((hora) => (
              <div
                key={hora}
                style={{ height: ALTURA_HORA }}
                className="flex items-start justify-end border-b border-white/5 pr-2 pt-1"
              >
                <span className="text-[11px] text-mist-500">{formatHora(hora, 0)}</span>
              </div>
            ))}
          </div>

          {dias.map((fecha) => (
            <div
              key={fecha.toISOString()}
              className="relative border-l border-white/10"
              style={{ height: ALTURA_HORA * horas.length }}
            >
              {horas.map((hora) => (
                <div key={hora} style={{ height: ALTURA_HORA }} className="border-b border-white/5" />
              ))}

              {ocurrencias
                .filter((o) => esMismoDia(o.fecha, fecha))
                .map((ocurrencia) => {
                  const inicioDecimal =
                    ocurrencia.inicioUtc.getHours() + ocurrencia.inicioUtc.getMinutes() / 60;
                  const finDecimal =
                    ocurrencia.finUtc.getHours() + ocurrencia.finUtc.getMinutes() / 60;
                  return (
                    <EventCard
                      key={ocurrencia.clase.id}
                      ocurrencia={ocurrencia}
                      posicion={{
                        top: (inicioDecimal - horaInicio) * ALTURA_HORA,
                        height: Math.max((finDecimal - inicioDecimal) * ALTURA_HORA, 32),
                      }}
                      onClick={() => onSeleccionarOcurrencia(ocurrencia)}
                    />
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS (WeekGrid y EventCard ya se referencian mutuamente sin error)

- [ ] **Step 3: Commit**

```bash
git add components/estudiante/calendario/WeekGrid.tsx
git commit -m "feat(calendario): agrega WeekGrid con eje horario y capa de eventos"
```

---

## Task 6: `EventDetailPanel` — panel de detalle de una clase

**Files:**
- Create: `components/estudiante/calendario/EventDetailPanel.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// components/estudiante/calendario/EventDetailPanel.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { ETIQUETA_MODALIDAD } from "@/lib/db/calendario";
import { formatHora } from "@/lib/calendario/recurrencia";
import type { OcurrenciaClase } from "./WeekGrid";

export function EventDetailPanel({
  ocurrencia,
  onClose,
}: {
  ocurrencia: OcurrenciaClase | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {ocurrencia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-950 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-xl font-bold text-white">
                {ocurrencia.clase.nombre}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="shrink-0 text-mist-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {ocurrencia.clase.imagenUrl && (
              <div className="relative mt-4 h-32 w-full overflow-hidden rounded-xl">
                <Image src={ocurrencia.clase.imagenUrl} alt="" fill sizes="400px" className="object-cover" />
              </div>
            )}

            <dl className="mt-4 space-y-2 text-sm text-mist-300">
              <div className="flex justify-between">
                <dt>Horario</dt>
                <dd>
                  {formatHora(ocurrencia.inicioUtc.getHours(), ocurrencia.inicioUtc.getMinutes())}–
                  {formatHora(ocurrencia.finUtc.getHours(), ocurrencia.finUtc.getMinutes())}
                </dd>
              </div>
              {ocurrencia.clase.dirigidoPor && (
                <div className="flex justify-between">
                  <dt>Dirige</dt>
                  <dd>{ocurrencia.clase.dirigidoPor}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Modalidad</dt>
                <dd>{ETIQUETA_MODALIDAD[ocurrencia.clase.modalidad]}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col gap-2">
              {ocurrencia.clase.enlaceSesion && (
                <a
                  href={ocurrencia.clase.enlaceSesion}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 items-center justify-center rounded-xl bg-gold-500 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                  Unirse por Zoom
                </a>
              )}
              {ocurrencia.clase.enlacePreguntas && (
                <a
                  href={ocurrencia.clase.enlacePreguntas}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 items-center justify-center rounded-xl border border-white/10 text-sm text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10"
                >
                  Ver preguntas / precalificación
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/estudiante/calendario/EventDetailPanel.tsx
git commit -m "feat(calendario): agrega panel de detalle de clase"
```

---

## Task 7: `MiniMonthCalendar` — mini calendario mensual del sidebar

**Files:**
- Create: `components/estudiante/calendario/MiniMonthCalendar.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// components/estudiante/calendario/MiniMonthCalendar.tsx
"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatRangoSemana, getInicioSemana } from "@/lib/calendario/recurrencia";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

function esMismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function estaEnSemana(fecha: Date, inicioSemana: Date): boolean {
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  return fecha >= inicioSemana && fecha <= finSemana;
}

export function MiniMonthCalendar({
  semanaActual,
  onSeleccionarFecha,
}: {
  semanaActual: Date;
  onSeleccionarFecha: (fecha: Date) => void;
}) {
  const [mesVisible, setMesVisible] = useState(
    () => new Date(semanaActual.getFullYear(), semanaActual.getMonth(), 1)
  );

  useEffect(() => {
    setMesVisible(new Date(semanaActual.getFullYear(), semanaActual.getMonth(), 1));
  }, [semanaActual]);

  const primerDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
  const inicioGrid = getInicioSemana(primerDiaMes);
  const dias = Array.from({ length: 42 }, (_, i) => {
    const fecha = new Date(inicioGrid);
    fecha.setDate(inicioGrid.getDate() + i);
    return fecha;
  });
  const hoy = new Date();

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))}
          className="rounded-lg p-1 text-mist-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-mono text-xs uppercase tracking-wider text-mist-300">
          {MESES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
        </p>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1))}
          className="rounded-lg p-1 text-mist-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
        {DIAS.map((letra, i) => (
          <span key={i} className="text-[10px] text-mist-500">
            {letra}
          </span>
        ))}

        {dias.map((fecha) => {
          const fueraDeMes = fecha.getMonth() !== mesVisible.getMonth();
          const enSemana = estaEnSemana(fecha, semanaActual);
          const esHoy = esMismoDia(fecha, hoy);

          return (
            <button
              key={fecha.toISOString()}
              type="button"
              onClick={() => onSeleccionarFecha(fecha)}
              className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
                fueraDeMes ? "text-mist-500/40" : "text-mist-200"
              } ${enSemana ? "bg-gold-500/20 text-gold-200" : "hover:bg-white/5"} ${
                esHoy ? "ring-1 ring-gold-400" : ""
              }`}
            >
              {fecha.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-3 border-t border-white/10 pt-3 text-center text-xs text-mist-400">
        Semana del {formatRangoSemana(semanaActual)}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/estudiante/calendario/MiniMonthCalendar.tsx
git commit -m "feat(calendario): agrega mini calendario mensual"
```

---

## Task 8: `CalendarToolbar` — navegación de semana y selector de vista

**Files:**
- Create: `components/estudiante/calendario/CalendarToolbar.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// components/estudiante/calendario/CalendarToolbar.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const VISTAS = [
  { label: "Día", disponible: false },
  { label: "Semana", disponible: true },
  { label: "Mes", disponible: false },
  { label: "Agenda", disponible: false },
];

export function CalendarToolbar({
  onHoy,
  onAnterior,
  onSiguiente,
}: {
  onHoy: () => void;
  onAnterior: () => void;
  onSiguiente: () => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Semana anterior"
          onClick={onAnterior}
          className="rounded-lg border border-white/10 p-2 text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onHoy}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
        >
          Hoy
        </button>
        <button
          type="button"
          aria-label="Semana siguiente"
          onClick={onSiguiente}
          className="rounded-lg border border-white/10 p-2 text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
        {VISTAS.map((vista) => (
          <span
            key={vista.label}
            title={vista.disponible ? undefined : "Próximamente"}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              vista.disponible
                ? "bg-gold-500/10 text-gold-300"
                : "cursor-not-allowed text-mist-500 opacity-50"
            }`}
          >
            {vista.label}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/estudiante/calendario/CalendarToolbar.tsx
git commit -m "feat(calendario): agrega toolbar de navegacion semanal"
```

---

## Task 9: `CalendarioSemanal` — orquestador cliente

**Files:**
- Create: `components/estudiante/calendario/CalendarioSemanal.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// components/estudiante/calendario/CalendarioSemanal.tsx
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { ClaseCalendario } from "@/lib/db/calendario";
import {
  getInicioSemana,
  getOcurrenciaEnSemana,
  zonedTimeToUtc,
  aFechaISO,
  formatRangoSemana,
} from "@/lib/calendario/recurrencia";
import { staggerContainer, blurFadeUp, EASE_OUT, useReducedMotionSafe } from "@/lib/motion";
import { MiniMonthCalendar } from "./MiniMonthCalendar";
import { CalendarToolbar } from "./CalendarToolbar";
import { WeekGrid, type OcurrenciaClase } from "./WeekGrid";
import { EventDetailPanel } from "./EventDetailPanel";

function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

// direction: 1 = hacia una semana futura, -1 = hacia una semana pasada, 0 = salto directo (Hoy / mini-calendario)
const weekVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
};

export function CalendarioSemanal({ clases }: { clases: ClaseCalendario[] }) {
  const [semanaActual, setSemanaActual] = useState(() => getInicioSemana(new Date()));
  const [direccion, setDireccion] = useState(0);
  const [ocurrenciaSeleccionada, setOcurrenciaSeleccionada] = useState<OcurrenciaClase | null>(
    null
  );
  const motionReducido = useReducedMotionSafe();

  function irASemana(nuevaSemana: Date, direccionNav: number) {
    setDireccion(direccionNav);
    setSemanaActual(nuevaSemana);
  }

  const ocurrencias = useMemo<OcurrenciaClase[]>(() => {
    return clases.flatMap((clase) => {
      const fecha = getOcurrenciaEnSemana(clase.fechaAncla, clase.recurrencia, semanaActual);
      if (!fecha) return [];

      const fechaISO = aFechaISO(fecha);
      return [
        {
          clase,
          fecha,
          inicioUtc: zonedTimeToUtc(fechaISO, clase.horaInicio),
          finUtc: zonedTimeToUtc(fechaISO, clase.horaFin),
        },
      ];
    });
  }, [clases, semanaActual]);

  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 lg:flex-row lg:items-start"
    >
      <motion.aside variants={blurFadeUp} className="w-full shrink-0 lg:w-[272px]">
        <MiniMonthCalendar
          semanaActual={semanaActual}
          onSeleccionarFecha={(fecha) => irASemana(getInicioSemana(fecha), 0)}
        />
      </motion.aside>

      <motion.div variants={blurFadeUp} className="min-w-0 flex-1">
        <h1 className="font-display text-[32px] font-bold leading-tight text-white">
          Calendario semanal
        </h1>
        <p className="mt-1 text-mist-400">{formatRangoSemana(semanaActual)}</p>

        <CalendarToolbar
          onHoy={() => irASemana(getInicioSemana(new Date()), 0)}
          onAnterior={() => irASemana(sumarDias(semanaActual, -7), -1)}
          onSiguiente={() => irASemana(sumarDias(semanaActual, 7), 1)}
        />

        <div className="mt-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direccion} initial={false}>
            <motion.div
              key={semanaActual.toISOString()}
              custom={direccion}
              variants={motionReducido ? undefined : weekVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <WeekGrid
                semanaActual={semanaActual}
                ocurrencias={ocurrencias}
                onSeleccionarOcurrencia={setOcurrenciaSeleccionada}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <EventDetailPanel
        ocurrencia={ocurrenciaSeleccionada}
        onClose={() => setOcurrenciaSeleccionada(null)}
      />
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/estudiante/calendario/CalendarioSemanal.tsx
git commit -m "feat(calendario): agrega orquestador CalendarioSemanal"
```

---

## Task 10: Página `/calendario` — reemplazar el stub

**Files:**
- Modify: `app/(estudiante)/calendario/page.tsx`

- [ ] **Step 1: Reescribir la página como server component**

```tsx
// app/(estudiante)/calendario/page.tsx
import { getClasesCalendario } from "@/lib/db/calendario";
import { CalendarioSemanal } from "@/components/estudiante/calendario/CalendarioSemanal";

export default async function CalendarioPage() {
  const clases = await getClasesCalendario();

  return <CalendarioSemanal clases={clases} />;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add "app/(estudiante)/calendario/page.tsx"
git commit -m "feat(calendario): reemplaza el stub de /calendario por el calendario real"
```

---

## Task 11: Server actions del panel admin

**Files:**
- Create: `app/(admin)/admin/calendario/actions.ts`

- [ ] **Step 1: Crear las server actions**

```ts
// app/(admin)/admin/calendario/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  crearClase,
  actualizarClase,
  eliminarClase,
  type ClaseCalendarioInput,
  type ModalidadClase,
  type RecurrenciaClase,
} from "@/lib/db/calendario";

export type ClaseFormState = { error: string | null };

function leerInput(formData: FormData): ClaseCalendarioInput {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    fechaAncla: String(formData.get("fechaAncla") ?? ""),
    horaInicio: String(formData.get("horaInicio") ?? ""),
    horaFin: String(formData.get("horaFin") ?? ""),
    dirigidoPor: String(formData.get("dirigidoPor") ?? "") || null,
    modalidad: String(formData.get("modalidad") ?? "online") as ModalidadClase,
    enlaceSesion: String(formData.get("enlaceSesion") ?? "") || null,
    enlacePreguntas: String(formData.get("enlacePreguntas") ?? "") || null,
    imagenUrl: String(formData.get("imagenUrl") ?? "") || null,
    recurrencia: String(formData.get("recurrencia") ?? "semanal") as RecurrenciaClase,
    activo: formData.get("activo") === "on",
  };
}

export async function crearClaseAction(
  _prevState: ClaseFormState,
  formData: FormData
): Promise<ClaseFormState> {
  const input = leerInput(formData);

  if (!input.nombre || !input.fechaAncla || !input.horaInicio || !input.horaFin) {
    return { error: "Completa nombre, fecha ancla, hora de inicio y hora de fin." };
  }

  try {
    await crearClase(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear la clase." };
  }

  revalidatePath("/admin/calendario");
  return { error: null };
}

export async function actualizarClaseAction(
  id: string,
  _prevState: ClaseFormState,
  formData: FormData
): Promise<ClaseFormState> {
  const input = leerInput(formData);

  try {
    await actualizarClase(id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar la clase." };
  }

  revalidatePath("/admin/calendario");
  return { error: null };
}

export async function eliminarClaseAction(id: string): Promise<void> {
  await eliminarClase(id);
  revalidatePath("/admin/calendario");
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(admin)/admin/calendario/actions.ts"
git commit -m "feat(admin): agrega server actions CRUD para clases_calendario"
```

---

## Task 12: `ClaseForm` — formulario admin reutilizable (crear/editar)

**Files:**
- Create: `components/admin/calendario/ClaseForm.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// components/admin/calendario/ClaseForm.tsx
"use client";

import { useActionState } from "react";
import type { ClaseCalendario } from "@/lib/db/calendario";
import type { ClaseFormState } from "@/app/(admin)/admin/calendario/actions";

const estadoInicial: ClaseFormState = { error: null };

const CAMPO_CLASES =
  "h-11 w-full rounded-lg border border-white/10 bg-ink-950 px-3 text-sm text-white placeholder:text-mist-500 outline-none transition focus:border-gold-500/60";

export function ClaseForm({
  clase,
  action,
}: {
  clase?: ClaseCalendario;
  action: (prevState: ClaseFormState, formData: FormData) => Promise<ClaseFormState>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Nombre
        <input name="nombre" defaultValue={clase?.nombre} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Fecha ancla
        <input
          type="date"
          name="fechaAncla"
          defaultValue={clase?.fechaAncla}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Recurrencia
        <select name="recurrencia" defaultValue={clase?.recurrencia ?? "semanal"} className={CAMPO_CLASES}>
          <option value="semanal">Semanal</option>
          <option value="quincenal">Quincenal</option>
          <option value="unica">Única</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Hora de inicio (EST)
        <input
          type="time"
          name="horaInicio"
          defaultValue={clase?.horaInicio}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Hora de fin (EST)
        <input
          type="time"
          name="horaFin"
          defaultValue={clase?.horaFin}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Dirige
        <input name="dirigidoPor" defaultValue={clase?.dirigidoPor ?? ""} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Modalidad
        <select name="modalidad" defaultValue={clase?.modalidad ?? "online"} className={CAMPO_CLASES}>
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
          <option value="hibrida">Híbrida</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Enlace de sesión (Zoom)
        <input name="enlaceSesion" defaultValue={clase?.enlaceSesion ?? ""} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Enlace de preguntas / precalificación
        <input
          name="enlacePreguntas"
          defaultValue={clase?.enlacePreguntas ?? ""}
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        URL de la imagen
        <input name="imagenUrl" defaultValue={clase?.imagenUrl ?? ""} className={CAMPO_CLASES} />
      </label>

      <label className="flex items-center gap-2 text-sm text-mist-300">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={clase?.activo ?? true}
          className="h-4 w-4 rounded border-white/20 bg-ink-950 text-gold-500"
        />
        Activa
      </label>

      {estado.error && (
        <p role="alert" className="text-sm text-rose-400 sm:col-span-2">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="h-11 rounded-lg bg-gold-500 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60 sm:col-span-2"
      >
        {pendiente ? "Guardando..." : clase ? "Guardar cambios" : "Crear clase"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/calendario/ClaseForm.tsx
git commit -m "feat(admin): agrega formulario reutilizable de clase"
```

---

## Task 13: `ClaseListItem` — fila de la lista admin con editar/eliminar

**Files:**
- Create: `components/admin/calendario/ClaseListItem.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// components/admin/calendario/ClaseListItem.tsx
"use client";

import { useState } from "react";
import type { ClaseCalendario } from "@/lib/db/calendario";
import { actualizarClaseAction, eliminarClaseAction } from "@/app/(admin)/admin/calendario/actions";
import { ClaseForm } from "./ClaseForm";

export function ClaseListItem({ clase }: { clase: ClaseCalendario }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="rounded-lg border border-white/10 p-4">
        <ClaseForm clase={clase} action={actualizarClaseAction.bind(null, clase.id)} />
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="mt-3 text-sm text-mist-400 underline"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 p-4">
      <div>
        <p className="font-medium">{clase.nombre}</p>
        <p className="text-sm text-mist-400">
          {clase.fechaAncla} · {clase.horaInicio}–{clase.horaFin} · {clase.recurrencia}
          {!clase.activo && " · inactiva"}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditando(true)} className="text-sm underline">
          Editar
        </button>
        <form action={eliminarClaseAction.bind(null, clase.id)}>
          <button type="submit" className="text-sm text-rose-400 underline">
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/calendario/ClaseListItem.tsx
git commit -m "feat(admin): agrega fila de clase con edicion y eliminacion inline"
```

---

## Task 14: Página `/admin/calendario`

**Files:**
- Create: `app/(admin)/admin/calendario/page.tsx`

- [ ] **Step 1: Crear la página**

```tsx
// app/(admin)/admin/calendario/page.tsx
import { getTodasLasClases } from "@/lib/db/calendario";
import { ClaseForm } from "@/components/admin/calendario/ClaseForm";
import { ClaseListItem } from "@/components/admin/calendario/ClaseListItem";
import { crearClaseAction } from "./actions";

export default async function AdminCalendarioPage() {
  const clases = await getTodasLasClases();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Clases del calendario</h1>

      <section className="flex flex-col gap-3">
        {clases.map((clase) => (
          <ClaseListItem key={clase.id} clase={clase} />
        ))}
        {clases.length === 0 && <p className="text-sm text-mist-400">Sin clases registradas.</p>}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Nueva clase</h2>
        <ClaseForm action={crearClaseAction} />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/calendario/page.tsx"
git commit -m "feat(admin): agrega pagina de gestion de clases_calendario"
```

---

## Task 15: Verificación final

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Suite completa de tests**

Run: `npm test`
Expected: PASS — todos los tests existentes siguen pasando, más los 14 de `recurrencia.test.ts` y los 7 de `calendario.test.ts`.

- [ ] **Step 2: Typecheck y lint**

Run: `npm run typecheck && npm run lint`
Expected: sin errores.

- [ ] **Step 3: Smoke test manual**

Run: `npm run dev`

- Visita `/calendario` autenticado como estudiante: debe verse la semana actual con las clases correspondientes según su día (recuerda que "Reunión Modelo de Rentas" solo aparece cada dos semanas desde el 2026-01-05).
- Usa `‹ Hoy ›` y confirma que el mini-calendario resalta la semana correcta.
- Haz clic en una fecha del mini-calendario y confirma que la grilla salta a esa semana.
- Haz clic en una clase y confirma que el panel de detalle abre con sus datos.
- Visita `/admin/calendario` autenticado como admin: crea una clase de prueba, edítala y elimínala; confirma que los cambios se reflejan tras cada acción (la página se revalida automáticamente).

- [ ] **Step 4: Commit final si hubo ajustes de la verificación**

Si el smoke test no requirió cambios, no hay nada que commitear en este paso.
