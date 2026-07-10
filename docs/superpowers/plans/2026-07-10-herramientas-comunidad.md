# Herramientas y Comunicación Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el stub de `/herramientas` por el directorio real de comunidades (WhatsApp/Dropbox) del equipo, con datos en Supabase (tabla `grupos_comunidad`, 51 filas semilla sin enlace) y un panel `/admin/herramientas` para cargar los enlaces reales.

**Architecture:** Mismo patrón que `clases_calendario`/`/calendario`/`/admin/calendario`: migración SQL con RLS de catálogo público (lectura para cualquier autenticado, escritura solo admin), capa `lib/db/grupos-comunidad.ts` sin ORM, página de estudiante server component que delega a un componente cliente con búsqueda/filtro/orden/paginación, y CRUD admin con server actions + `useActionState`.

**Tech Stack:** Next.js 15 (App Router), Supabase (`@supabase/ssr`), Framer Motion (`lib/motion.ts`), Tailwind (tokens `ink`/`gold`/`mist`/`whatsapp` de `docs/design-system.md`), Vitest + Testing Library.

---

## Referencia: spec

Este plan implementa `docs/superpowers/specs/2026-07-10-herramientas-comunidad-design.md`. Léelo primero si algo aquí no tiene sentido — este plan no repite las decisiones de diseño ya justificadas allí, solo la ejecución.

---

### Task 1: Migración SQL — tabla `grupos_comunidad`

**Files:**
- Create: `supabase/migrations/008_grupos_comunidad.sql`

- [ ] **Step 1: Escribir la migración completa**

```sql
-- 008_grupos_comunidad.sql
-- Directorio de comunidades (WhatsApp/Dropbox) del equipo, mostrado en
-- /herramientas. Mismo patrón que 007_calendario.sql: catálogo de lectura
-- pública (cualquier autenticado), gestionado solo por un admin.
-- Depende de 001_esquema.sql y 002_usuarios.sql (usa is_admin()).
--
-- categoria agrupa los grupos por zona/tipo real (ver
-- docs/Estructura_Herramientas.md): un único grupo_principal (canal
-- maestro del equipo) + 4 categorías de proyecto. tipo_canal distingue
-- WhatsApp (mayoría) de Dropbox (Casa Bella, que es documental).
--
-- Los 51 grupos se siembran con enlace_url = NULL: los enlaces reales de
-- invitación no estaban disponibles al escribir esta migración y se
-- cargan después desde /admin/herramientas.

create type categoria_grupo_comunidad as enum
  ('grupo_principal', 'miami', 'orlando_centro_florida', 'venta_renta', 'otros');
create type canal_grupo_comunidad as enum ('whatsapp', 'dropbox');

create table grupos_comunidad (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria categoria_grupo_comunidad not null,
  detalle text,
  tipo_canal canal_grupo_comunidad not null default 'whatsapp',
  enlace_url text,
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index grupos_comunidad_categoria_idx on grupos_comunidad(categoria);
create index grupos_comunidad_activo_idx on grupos_comunidad(activo);

alter table grupos_comunidad enable row level security;
create policy "grupos_comunidad_select_all" on grupos_comunidad for select using (true);
create policy "grupos_comunidad_admin_all" on grupos_comunidad for all using (is_admin()) with check (is_admin());

-- Datos semilla: 51 grupos parseados de docs/Estructura_Herramientas.md
-- (1 Grupo Principal + 35 Miami + 8 Orlando/Centro FL + 2 Venta y Renta +
-- 5 Otros). enlace_url queda NULL en todos — completar desde
-- /admin/herramientas.
insert into grupos_comunidad (nombre, categoria, detalle, tipo_canal, orden) values
  ('Grupo Principal del Equipo', 'grupo_principal', null, 'whatsapp', 1),

  ('Bentley Residences', 'miami', 'Miami', 'whatsapp', 1),
  ('Botanic Residences', 'miami', 'Miami', 'whatsapp', 2),
  ('Cassia Coral', 'miami', 'Miami', 'whatsapp', 3),
  ('COVE', 'miami', 'Miami', 'whatsapp', 4),
  ('DELANO Residences', 'miami', 'Miami Beach', 'whatsapp', 5),
  ('Domus', 'miami', 'Miami', 'whatsapp', 6),
  ('Doppio', 'miami', 'Miami', 'whatsapp', 7),
  ('Edge House', 'miami', 'Miami', 'whatsapp', 8),
  ('Elle Residences', 'miami', 'Miami', 'whatsapp', 9),
  ('Frida Kahlo', 'miami', 'Miami', 'whatsapp', 10),
  ('GAIA Residences', 'miami', 'Miami', 'whatsapp', 11),
  ('House of Wellness 2029', 'miami', 'Miami', 'whatsapp', 12),
  ('HQ Residences', 'miami', 'Miami', 'whatsapp', 13),
  ('ICON 192', 'miami', 'Miami', 'whatsapp', 14),
  ('Jean Georges', 'miami', 'Miami', 'whatsapp', 15),
  ('Mandarin Residences', 'miami', 'Miami', 'whatsapp', 16),
  ('Melia Brickell', 'miami', 'Brickell, Miami', 'whatsapp', 17),
  ('Mercedes-Benz Residences', 'miami', 'Miami', 'whatsapp', 18),
  ('Midtown Park', 'miami', 'Miami', 'whatsapp', 19),
  ('Mondrian Hallandale', 'miami', 'Hallandale Beach', 'whatsapp', 20),
  ('Nexo', 'miami', 'Miami', 'whatsapp', 21),
  ('NoBe Parc', 'miami', 'North Beach', 'whatsapp', 22),
  ('Okan Tower', 'miami', 'Miami', 'whatsapp', 23),
  ('One Hollywood', 'miami', 'Hollywood, FL', 'whatsapp', 24),
  ('One Twenty Signature Brickell', 'miami', 'Brickell, Miami', 'whatsapp', 25),
  ('PALMA', 'miami', 'Miami', 'whatsapp', 26),
  ('River District', 'miami', 'Miami', 'whatsapp', 27),
  ('Seven Park', 'miami', 'Miami', 'whatsapp', 28),
  ('Shoma Bay', 'miami', 'Miami', 'whatsapp', 29),
  ('Standard Residences', 'miami', 'Miami', 'whatsapp', 30),
  ('The William', 'miami', 'Miami', 'whatsapp', 31),
  ('VICEROY Brickell', 'miami', 'Brickell, Miami', 'whatsapp', 32),
  ('Vista Harbor', 'miami', 'Miami', 'whatsapp', 33),
  ('Visions', 'miami', 'Miami', 'whatsapp', 34),
  ('W Pompano Beach', 'miami', 'Pompano Beach', 'whatsapp', 35),

  ('14 ROC - Team Wilmar Sosa', 'orlando_centro_florida', 'Residencial', 'whatsapp', 1),
  ('DR Horton con Angel Acosta', 'orlando_centro_florida', 'Constructor nacional', 'whatsapp', 2),
  ('GZ Tower Orlando', 'orlando_centro_florida', 'Torre', 'whatsapp', 3),
  ('Lennar Group – Orlando Division', 'orlando_centro_florida', 'Constructor nacional', 'whatsapp', 4),
  ('Millenia Park', 'orlando_centro_florida', 'Residencial', 'whatsapp', 5),
  ('NICKELODEON Orlando', 'orlando_centro_florida', 'Proyecto temático', 'whatsapp', 6),
  ('Taylor Morrison Orlando', 'orlando_centro_florida', 'Constructor nacional', 'whatsapp', 7),
  ('Watersong Lotes', 'orlando_centro_florida', 'Lotes / tierra', 'whatsapp', 8),

  ('Listing de Venta / Team 100 Real', 'venta_renta', 'Propiedades activas en venta', 'whatsapp', 1),
  ('Community Rental – Team Wilmar Sosa', 'venta_renta', 'Segmento de rentas', 'whatsapp', 2),

  ('26th & 2nd', 'otros', null, 'whatsapp', 1),
  ('Parkside', 'otros', null, 'whatsapp', 2),
  ('SEVENTEEN GABLES', 'otros', null, 'whatsapp', 3),
  ('Casa Bella', 'otros', 'Archivos del proyecto', 'dropbox', 4),
  ('Lennar Miami', 'otros', 'División Miami del constructor Lennar', 'whatsapp', 5);
```

- [ ] **Step 2: Revisión manual del archivo**

Cuenta las filas del `insert` (deben ser 51: 1 + 35 + 8 + 2 + 5) y confirma visualmente que no hay comas colgantes ni comillas sin cerrar. No hay forma de aplicar/probar esta migración de forma automatizada en este repo (`supabase/migrations/README.md`: se aplica manualmente en el SQL Editor de Supabase) — la validación real ocurre en el Task 16 (verificación manual), donde se pega en el SQL Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/008_grupos_comunidad.sql
git commit -m "feat(db): agrega tabla grupos_comunidad con 51 grupos semilla"
```

---

### Task 2: Capa de datos `lib/db/grupos-comunidad.ts` (TDD)

**Files:**
- Create: `lib/db/grupos-comunidad.ts`
- Test: `lib/db/grupos-comunidad.test.ts`

- [ ] **Step 1: Escribir el test completo (falla porque el módulo no existe)**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const filaEjemplo = {
  id: "1",
  nombre: "Domus",
  categoria: "miami",
  detalle: "Miami",
  tipo_canal: "whatsapp",
  enlace_url: null,
  orden: 6,
  activo: true,
  creado_en: "2026-01-01T00:00:00.000Z",
};

const grupoMapeado = {
  id: "1",
  nombre: "Domus",
  categoria: "miami",
  detalle: "Miami",
  tipoCanal: "whatsapp",
  enlaceUrl: null,
  orden: 6,
  activo: true,
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const grupoInputEjemplo = {
  nombre: "Domus",
  categoria: "miami" as const,
  detalle: "Miami",
  tipoCanal: "whatsapp" as const,
  enlaceUrl: null,
  orden: 6,
  activo: true,
};

type GruposResult = {
  data: (typeof filaEjemplo)[] | null;
  error: { message: string } | null;
};

type MutacionResult = { error: { message: string } | null };

describe("getGruposComunidad", () => {
  const order2Mock = vi.fn((): Promise<GruposResult> => Promise.resolve({ data: [filaEjemplo], error: null }));
  const order1Mock = vi.fn(() => ({ order: order2Mock }));
  const eqMock = vi.fn(() => ({ order: order1Mock }));
  const selectMock = vi.fn(() => ({ eq: eqMock }));
  const fromMock = vi.fn(() => ({ select: selectMock }));

  beforeEach(() => {
    fromMock.mockClear();
    selectMock.mockClear();
    eqMock.mockClear();
    order1Mock.mockClear();
    order2Mock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("consulta solo grupos activos, ordenados por categoría y orden", async () => {
    const { getGruposComunidad } = await import("./grupos-comunidad");
    const grupos = await getGruposComunidad();

    expect(fromMock).toHaveBeenCalledWith("grupos_comunidad");
    expect(eqMock).toHaveBeenCalledWith("activo", true);
    expect(order1Mock).toHaveBeenCalledWith("categoria");
    expect(order2Mock).toHaveBeenCalledWith("orden");
    expect(grupos).toEqual([grupoMapeado]);
  });

  it("lanza un error legible si Supabase falla", async () => {
    order2Mock.mockResolvedValueOnce({ data: null, error: { message: "timeout" } });

    const { getGruposComunidad } = await import("./grupos-comunidad");

    await expect(getGruposComunidad()).rejects.toThrow("No se pudieron cargar los grupos: timeout");
  });
});

describe("getTodosLosGrupos", () => {
  const order2Mock = vi.fn((): Promise<GruposResult> => Promise.resolve({ data: [filaEjemplo], error: null }));
  const order1Mock = vi.fn(() => ({ order: order2Mock }));
  const selectMock = vi.fn(() => ({ order: order1Mock }));
  const fromMock = vi.fn(() => ({ select: selectMock }));

  beforeEach(() => {
    order2Mock.mockClear();
    order1Mock.mockClear();
    selectMock.mockClear();
    fromMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("consulta todos los grupos sin filtrar por activo", async () => {
    const { getTodosLosGrupos } = await import("./grupos-comunidad");
    const grupos = await getTodosLosGrupos();

    expect(fromMock).toHaveBeenCalledWith("grupos_comunidad");
    expect(order1Mock).toHaveBeenCalledWith("categoria");
    expect(order2Mock).toHaveBeenCalledWith("orden");
    expect(grupos).toEqual([grupoMapeado]);
  });
});

describe("crearGrupo", () => {
  const insertMock = vi.fn((): Promise<MutacionResult> => Promise.resolve({ error: null }));
  const fromMock = vi.fn(() => ({ insert: insertMock }));

  beforeEach(() => {
    insertMock.mockClear();
    fromMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("inserta el grupo mapeando los campos a snake_case", async () => {
    const { crearGrupo } = await import("./grupos-comunidad");
    await crearGrupo(grupoInputEjemplo);

    expect(fromMock).toHaveBeenCalledWith("grupos_comunidad");
    expect(insertMock).toHaveBeenCalledWith({
      nombre: "Domus",
      categoria: "miami",
      detalle: "Miami",
      tipo_canal: "whatsapp",
      enlace_url: null,
      orden: 6,
      activo: true,
    });
  });

  it("lanza un error legible si Supabase falla", async () => {
    insertMock.mockResolvedValueOnce({ error: { message: "permission denied" } });

    const { crearGrupo } = await import("./grupos-comunidad");

    await expect(crearGrupo(grupoInputEjemplo)).rejects.toThrow(
      "No se pudo crear el grupo: permission denied"
    );
  });
});

describe("actualizarGrupo", () => {
  const eqMock = vi.fn((): Promise<MutacionResult> => Promise.resolve({ error: null }));
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

  it("actualiza el grupo con el payload en snake_case", async () => {
    const { actualizarGrupo } = await import("./grupos-comunidad");
    await actualizarGrupo("1", grupoInputEjemplo);

    expect(fromMock).toHaveBeenCalledWith("grupos_comunidad");
    expect(updateMock).toHaveBeenCalledWith({
      nombre: "Domus",
      categoria: "miami",
      detalle: "Miami",
      tipo_canal: "whatsapp",
      enlace_url: null,
      orden: 6,
      activo: true,
    });
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { actualizarGrupo } = await import("./grupos-comunidad");

    await expect(actualizarGrupo("1", grupoInputEjemplo)).rejects.toThrow(
      "No se pudo actualizar el grupo: timeout"
    );
  });
});

describe("eliminarGrupo", () => {
  const eqMock = vi.fn((): Promise<MutacionResult> => Promise.resolve({ error: null }));
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

  it("elimina el grupo por id", async () => {
    const { eliminarGrupo } = await import("./grupos-comunidad");
    await eliminarGrupo("1");

    expect(fromMock).toHaveBeenCalledWith("grupos_comunidad");
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { eliminarGrupo } = await import("./grupos-comunidad");

    await expect(eliminarGrupo("1")).rejects.toThrow("No se pudo eliminar el grupo: timeout");
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run lib/db/grupos-comunidad.test.ts`
Expected: FAIL — `Cannot find module './grupos-comunidad'`

- [ ] **Step 3: Implementar `lib/db/grupos-comunidad.ts`**

```ts
import { createClient } from "@/lib/supabase/server";

export type CategoriaGrupoComunidad =
  | "grupo_principal"
  | "miami"
  | "orlando_centro_florida"
  | "venta_renta"
  | "otros";

export type CanalGrupoComunidad = "whatsapp" | "dropbox";

export const ETIQUETA_CATEGORIA: Record<CategoriaGrupoComunidad, string> = {
  grupo_principal: "Grupo Principal",
  miami: "Miami",
  orlando_centro_florida: "Orlando y Centro de Florida",
  venta_renta: "Venta y Renta",
  otros: "Otros",
};

export type GrupoComunidad = {
  id: string;
  nombre: string;
  categoria: CategoriaGrupoComunidad;
  detalle: string | null;
  tipoCanal: CanalGrupoComunidad;
  enlaceUrl: string | null;
  orden: number;
  activo: boolean;
  creadoEn?: string;
};

export type GrupoComunidadInput = {
  nombre: string;
  categoria: CategoriaGrupoComunidad;
  detalle: string | null;
  tipoCanal: CanalGrupoComunidad;
  enlaceUrl: string | null;
  orden: number;
  activo: boolean;
};

type FilaGrupoComunidad = {
  id: string;
  nombre: string;
  categoria: CategoriaGrupoComunidad;
  detalle: string | null;
  tipo_canal: CanalGrupoComunidad;
  enlace_url: string | null;
  orden: number;
  activo: boolean;
  creado_en: string;
};

const COLUMNAS = "id, nombre, categoria, detalle, tipo_canal, enlace_url, orden, activo, creado_en";

function mapearGrupo(fila: FilaGrupoComunidad): GrupoComunidad {
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    detalle: fila.detalle,
    tipoCanal: fila.tipo_canal,
    enlaceUrl: fila.enlace_url,
    orden: fila.orden,
    activo: fila.activo,
    creadoEn: fila.creado_en,
  };
}

function serializarGrupo(input: GrupoComunidadInput) {
  return {
    nombre: input.nombre.trim(),
    categoria: input.categoria,
    detalle: input.detalle?.trim() || null,
    tipo_canal: input.tipoCanal,
    enlace_url: input.enlaceUrl?.trim() || null,
    orden: input.orden,
    activo: input.activo,
  };
}

export async function getGruposComunidad(): Promise<GrupoComunidad[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grupos_comunidad")
    .select(COLUMNAS)
    .eq("activo", true)
    .order("categoria")
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los grupos: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearGrupo(fila as unknown as FilaGrupoComunidad));
}

export async function getTodosLosGrupos(): Promise<GrupoComunidad[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grupos_comunidad")
    .select(COLUMNAS)
    .order("categoria")
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los grupos: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearGrupo(fila as unknown as FilaGrupoComunidad));
}

export async function crearGrupo(input: GrupoComunidadInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("grupos_comunidad").insert(serializarGrupo(input));

  if (error) {
    throw new Error(`No se pudo crear el grupo: ${error.message}`);
  }
}

export async function actualizarGrupo(id: string, input: GrupoComunidadInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("grupos_comunidad")
    .update(serializarGrupo(input))
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo actualizar el grupo: ${error.message}`);
  }
}

export async function eliminarGrupo(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("grupos_comunidad").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el grupo: ${error.message}`);
  }
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run lib/db/grupos-comunidad.test.ts`
Expected: PASS (12 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/db/grupos-comunidad.ts lib/db/grupos-comunidad.test.ts
git commit -m "feat(db): agrega capa de datos lib/db/grupos-comunidad"
```

---

### Task 3: Documentar la tabla en `docs/BASE_DE_DATOS.md`

**Files:**
- Modify: `docs/BASE_DE_DATOS.md`

- [ ] **Step 1: Agregar `007` y `008` a la lista de aplicación del esquema**

Busca este bloque (líneas 7–15 del archivo):

```
000_drop_all.sql        -- opcional: destruye todo (tablas, funciones, triggers, tipos)
001_esquema.sql         -- tipos, tablas, índices
002_usuarios.sql        -- funciones (auto-alta, chequeo de rol, anti-escalada)
003_triggers.sql        -- conecta los triggers a las funciones de 002
004_rls.sql             -- activa RLS y define todas las políticas
005_miembros_equipo.sql -- tabla de Team Leaders
006_galeria_equipo.sql  -- tabla de fotos de galería
```

Reemplázalo por (agrega las dos líneas finales; el resto queda igual):

```
000_drop_all.sql          -- opcional: destruye todo (tablas, funciones, triggers, tipos)
001_esquema.sql           -- tipos, tablas, índices
002_usuarios.sql          -- funciones (auto-alta, chequeo de rol, anti-escalada)
003_triggers.sql          -- conecta los triggers a las funciones de 002
004_rls.sql               -- activa RLS y define todas las políticas
005_miembros_equipo.sql   -- tabla de Team Leaders
006_galeria_equipo.sql    -- tabla de fotos de galería
007_calendario.sql        -- tabla de clases del calendario semanal
008_grupos_comunidad.sql  -- tabla de grupos de WhatsApp/Dropbox del equipo
```

- [ ] **Step 2: Agregar la sección de la tabla, después de `galeria_equipo` (migración 006)**

Busca este bloque:

```
### `galeria_equipo` (migración 006)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `url` | text | |
| `orden` | int | indexado |
| `creado_en` | timestamptz | |

Mismo patrón que `miembros_equipo`. Consumida por `lib/db/galeria.ts` → dashboard del estudiante.
```

Agrega inmediatamente después:

```
### `grupos_comunidad` (migración 008)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `nombre` | text | |
| `categoria` | `categoria_grupo_comunidad` | `grupo_principal`, `miami`, `orlando_centro_florida`, `venta_renta`, `otros` |
| `detalle` | text | nullable — zona (ej. "Brickell, Miami") o tipo de proyecto (ej. "Constructor nacional") |
| `tipo_canal` | `canal_grupo_comunidad` | `whatsapp` (default) o `dropbox` |
| `enlace_url` | text | nullable — sembrado en NULL, se completa desde `/admin/herramientas` |
| `orden` | int | orden dentro de la categoría |
| `activo` | boolean | default true |
| `creado_en` | timestamptz | |

Mismo patrón que `miembros_equipo`/`clases_calendario`. Consumida por `lib/db/grupos-comunidad.ts` → `/herramientas` (estudiante) y `/admin/herramientas` (gestión).
```

- [ ] **Step 3: Agregar la tabla a la lista de catálogos públicos de solo lectura**

Busca esta línea (en "Row Level Security — patrón general"):

```
- **Catálogos públicos de solo lectura**: `insignias`, `miembros_equipo`, `galeria_equipo` (`select using (true)`), gestionables solo por admin.
```

Reemplázala por:

```
- **Catálogos públicos de solo lectura**: `insignias`, `miembros_equipo`, `galeria_equipo`, `clases_calendario`, `grupos_comunidad` (`select using (true)`), gestionables solo por admin.
```

- [ ] **Step 4: Commit**

```bash
git add docs/BASE_DE_DATOS.md
git commit -m "docs: documenta grupos_comunidad y completa referencias a 007/clases_calendario"
```

---

### Task 4: `GrupoCard` (tarjeta de grupo, grid y lista)

**Files:**
- Create: `components/estudiante/herramientas/GrupoCard.tsx`

- [ ] **Step 1: Implementar el componente**

```tsx
"use client";

import { Folder, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad";
import { ETIQUETA_CATEGORIA } from "@/lib/db/grupos-comunidad";
import { blurFadeUp } from "@/lib/motion";

const ETIQUETA_ACCION: Record<GrupoComunidad["tipoCanal"], string> = {
  whatsapp: "Unirse",
  dropbox: "Abrir carpeta",
};

export function GrupoCard({
  grupo,
  vista,
}: {
  grupo: GrupoComunidad;
  vista: "grid" | "lista";
}) {
  const Icono = grupo.tipoCanal === "dropbox" ? Folder : MessageCircle;
  const tieneEnlace = Boolean(grupo.enlaceUrl);
  const etiquetaAccion = ETIQUETA_ACCION[grupo.tipoCanal];

  const accion = tieneEnlace ? (
    <a
      href={grupo.enlaceUrl!}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition hover:text-gold-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      {etiquetaAccion} ↗
    </a>
  ) : (
    <span
      aria-disabled="true"
      title="Este grupo todavía no tiene enlace cargado"
      className="text-sm font-medium text-mist-500 opacity-50 cursor-not-allowed"
    >
      Enlace pendiente
    </span>
  );

  if (vista === "lista") {
    return (
      <motion.div
        variants={blurFadeUp}
        className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition hover:border-white/20"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-300">
            <Icono className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{grupo.nombre}</p>
            <p className="truncate text-xs text-mist-400">
              {ETIQUETA_CATEGORIA[grupo.categoria]}
              {grupo.detalle ? ` · ${grupo.detalle}` : ""}
            </p>
          </div>
        </div>
        {accion}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={blurFadeUp}
      whileHover={{ y: -6 }}
      className="flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-white/20"
    >
      <div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-300">
          <Icono className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-display font-semibold text-white">{grupo.nombre}</h3>
        {grupo.detalle && <p className="mt-1 text-sm text-mist-400">{grupo.detalle}</p>}
        <span className="mt-3 inline-block rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-mist-400">
          {ETIQUETA_CATEGORIA[grupo.categoria]}
        </span>
      </div>
      <div className="flex justify-end">{accion}</div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/estudiante/herramientas/GrupoCard.tsx
git commit -m "feat(herramientas): agrega GrupoCard (vista grid y lista)"
```

---

### Task 5: `GrupoPrincipalCard` e `IndicadoresPanel`

**Files:**
- Create: `components/estudiante/herramientas/GrupoPrincipalCard.tsx`
- Create: `components/estudiante/herramientas/IndicadoresPanel.tsx`

- [ ] **Step 1: Implementar `GrupoPrincipalCard.tsx`**

```tsx
import { MessageCircle } from "lucide-react";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad";

export function GrupoPrincipalCard({ grupo }: { grupo: GrupoComunidad | undefined }) {
  if (!grupo) {
    return null;
  }

  const tieneEnlace = Boolean(grupo.enlaceUrl);

  const contenido = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-whatsapp/20 bg-whatsapp/10 text-whatsapp">
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-white">{grupo.nombre}</h3>
      <p className="mt-1.5 text-sm text-mist-400">
        Canal maestro de comunicación general del equipo.
      </p>
      <div className="mt-5 flex justify-end">
        {tieneEnlace ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300">
            Unirse ↗
          </span>
        ) : (
          <span className="text-sm font-medium text-mist-500 opacity-50">Enlace pendiente</span>
        )}
      </div>
    </>
  );

  if (!tieneEnlace) {
    return (
      <div
        aria-disabled="true"
        title="Este grupo todavía no tiene enlace cargado"
        className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
      >
        {contenido}
      </div>
    );
  }

  return (
    <a
      href={grupo.enlaceUrl!}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:scale-[1.01] hover:border-whatsapp/40"
    >
      {contenido}
    </a>
  );
}
```

- [ ] **Step 2: Implementar `IndicadoresPanel.tsx`**

```tsx
export function IndicadoresPanel({ totalGrupos }: { totalGrupos: number }) {
  const indicadores = [
    { valor: String(totalGrupos), etiqueta: "Grupos" },
    { valor: "1", etiqueta: "Oficial" },
    { valor: "100%", etiqueta: "Privado" },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
      {indicadores.map((indicador) => (
        <div key={indicador.etiqueta} className="flex flex-col items-center gap-1 px-2 text-center">
          <span className="font-display text-2xl font-bold text-white">{indicador.valor}</span>
          <span className="text-xs text-mist-400">{indicador.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/estudiante/herramientas/GrupoPrincipalCard.tsx components/estudiante/herramientas/IndicadoresPanel.tsx
git commit -m "feat(herramientas): agrega GrupoPrincipalCard e IndicadoresPanel"
```

---

### Task 6: `HerramientasToolbar`, `CategoriaChips` y `Paginacion`

**Files:**
- Create: `components/estudiante/herramientas/HerramientasToolbar.tsx`
- Create: `components/estudiante/herramientas/CategoriaChips.tsx`
- Create: `components/estudiante/herramientas/Paginacion.tsx`

- [ ] **Step 1: Implementar `HerramientasToolbar.tsx`**

```tsx
"use client";

import { LayoutGrid, List, Search } from "lucide-react";

export type OrdenGrupos = "nombre" | "recientes";
export type VistaGrupos = "grid" | "lista";

export function HerramientasToolbar({
  busqueda,
  onBusquedaChange,
  orden,
  onOrdenChange,
  vista,
  onVistaChange,
}: {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  orden: OrdenGrupos;
  onOrdenChange: (valor: OrdenGrupos) => void;
  vista: VistaGrupos;
  onVistaChange: (valor: VistaGrupos) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative sm:w-72">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
          aria-hidden="true"
        />
        <label htmlFor="busqueda-herramientas" className="sr-only">
          Buscar grupo
        </label>
        <input
          id="busqueda-herramientas"
          type="text"
          value={busqueda}
          onChange={(evento) => onBusquedaChange(evento.target.value)}
          placeholder="Buscar grupo..."
          aria-label="Buscar grupo"
          className="h-11 w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-4 text-sm text-white placeholder:text-mist-500 outline-none focus:border-gold-500/60"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="sr-only" htmlFor="orden-herramientas">
          Ordenar
        </label>
        <select
          id="orden-herramientas"
          value={orden}
          onChange={(evento) => onOrdenChange(evento.target.value as OrdenGrupos)}
          className="h-11 rounded-xl border border-white/10 bg-ink-950 px-3 text-sm text-white outline-none focus:border-gold-500/60"
        >
          <option value="nombre">Nombre A-Z</option>
          <option value="recientes">Más recientes</option>
        </select>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
          <button
            type="button"
            aria-pressed={vista === "grid"}
            aria-label="Vista de cuadrícula"
            onClick={() => onVistaChange("grid")}
            className={`rounded-md p-2 transition ${
              vista === "grid" ? "bg-gold-500/10 text-gold-300" : "text-mist-400 hover:text-mist-200"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-pressed={vista === "lista"}
            aria-label="Vista de lista"
            onClick={() => onVistaChange("lista")}
            className={`rounded-md p-2 transition ${
              vista === "lista" ? "bg-gold-500/10 text-gold-300" : "text-mist-400 hover:text-mist-200"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implementar `CategoriaChips.tsx`**

```tsx
"use client";

import type { CategoriaGrupoComunidad } from "@/lib/db/grupos-comunidad";
import { ETIQUETA_CATEGORIA } from "@/lib/db/grupos-comunidad";

export type FiltroCategoria = CategoriaGrupoComunidad | "todos";

const OPCIONES: { valor: FiltroCategoria; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "miami", etiqueta: ETIQUETA_CATEGORIA.miami },
  { valor: "orlando_centro_florida", etiqueta: ETIQUETA_CATEGORIA.orlando_centro_florida },
  { valor: "venta_renta", etiqueta: ETIQUETA_CATEGORIA.venta_renta },
  { valor: "otros", etiqueta: ETIQUETA_CATEGORIA.otros },
];

export function CategoriaChips({
  conteos,
  filtro,
  onFiltroChange,
}: {
  conteos: Record<FiltroCategoria, number>;
  filtro: FiltroCategoria;
  onFiltroChange: (valor: FiltroCategoria) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPCIONES.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          onClick={() => onFiltroChange(opcion.valor)}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            filtro === opcion.valor
              ? "border-gold-500/60 bg-gold-500/10 text-gold-300"
              : "border-white/10 text-mist-400 hover:border-white/20"
          }`}
        >
          {opcion.etiqueta} ({conteos[opcion.valor] ?? 0})
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Implementar `Paginacion.tsx`**

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Paginacion({
  pagina,
  totalPaginas,
  totalItems,
  porPagina,
  onPaginaChange,
}: {
  pagina: number;
  totalPaginas: number;
  totalItems: number;
  porPagina: number;
  onPaginaChange: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) {
    return null;
  }

  const inicio = (pagina - 1) * porPagina + 1;
  const fin = Math.min(pagina * porPagina, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
      <p className="text-sm text-mist-400">
        Mostrando {inicio}–{fin} de {totalItems} grupos
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={pagina === 1}
          onClick={() => onPaginaChange(pagina - 1)}
          className="rounded-lg border border-white/10 p-2 text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
          <button
            key={numero}
            type="button"
            aria-current={numero === pagina ? "page" : undefined}
            onClick={() => onPaginaChange(numero)}
            className={`h-9 w-9 rounded-lg text-sm transition ${
              numero === pagina
                ? "border border-gold-500/60 bg-gold-500/10 text-gold-300"
                : "text-mist-400 hover:bg-white/[0.03]"
            }`}
          >
            {numero}
          </button>
        ))}
        <button
          type="button"
          aria-label="Página siguiente"
          disabled={pagina === totalPaginas}
          onClick={() => onPaginaChange(pagina + 1)}
          className="rounded-lg border border-white/10 p-2 text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/estudiante/herramientas/HerramientasToolbar.tsx components/estudiante/herramientas/CategoriaChips.tsx components/estudiante/herramientas/Paginacion.tsx
git commit -m "feat(herramientas): agrega toolbar, chips de categoría y paginación"
```

---

### Task 7: `HerramientasHub` — orquestador con búsqueda/filtro/orden/paginación (TDD)

**Files:**
- Create: `components/estudiante/herramientas/HerramientasHub.tsx`
- Test: `components/estudiante/herramientas/HerramientasHub.test.tsx`

- [ ] **Step 1: Escribir el test completo (falla porque el módulo no existe)**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HerramientasHub } from "./HerramientasHub";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad";

function crearGrupo(overrides: Partial<GrupoComunidad> & { id: string; nombre: string }): GrupoComunidad {
  return {
    categoria: "miami",
    detalle: null,
    tipoCanal: "whatsapp",
    enlaceUrl: null,
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const GRUPOS: GrupoComunidad[] = [
  crearGrupo({ id: "principal", nombre: "Grupo Principal del Equipo", categoria: "grupo_principal" }),
  crearGrupo({ id: "m1", nombre: "Domus", categoria: "miami", detalle: "Miami" }),
  crearGrupo({ id: "m2", nombre: "Botanic Residences", categoria: "miami", detalle: "Miami" }),
  crearGrupo({ id: "o1", nombre: "Millenia Park", categoria: "orlando_centro_florida", detalle: "Residencial" }),
];

describe("HerramientasHub", () => {
  it("no repite el grupo principal en el grid de proyectos", () => {
    render(<HerramientasHub grupos={GRUPOS} />);
    expect(screen.getAllByText("Grupo Principal del Equipo")).toHaveLength(1);
  });

  it("filtra por texto de búsqueda", () => {
    render(<HerramientasHub grupos={GRUPOS} />);

    fireEvent.change(screen.getByLabelText("Buscar grupo"), { target: { value: "domus" } });

    expect(screen.getByText("Domus")).toBeInTheDocument();
    expect(screen.queryByText("Botanic Residences")).not.toBeInTheDocument();
  });

  it("filtra por categoría con los chips", () => {
    render(<HerramientasHub grupos={GRUPOS} />);

    fireEvent.click(screen.getByRole("button", { name: /Orlando y Centro de Florida/ }));

    expect(screen.getByText("Millenia Park")).toBeInTheDocument();
    expect(screen.queryByText("Domus")).not.toBeInTheDocument();
  });

  it("muestra estado vacío si no hay resultados", () => {
    render(<HerramientasHub grupos={GRUPOS} />);

    fireEvent.change(screen.getByLabelText("Buscar grupo"), { target: { value: "no existe" } });

    expect(screen.getByText("No encontramos grupos con ese nombre.")).toBeInTheDocument();
  });

  it("pagina los resultados de a 12", () => {
    const muchosGrupos: GrupoComunidad[] = Array.from({ length: 13 }, (_, indice) =>
      crearGrupo({
        id: `p${indice}`,
        nombre: `Proyecto ${String(indice).padStart(2, "0")}`,
        categoria: "miami",
      })
    );
    render(<HerramientasHub grupos={muchosGrupos} />);

    expect(screen.queryByText("Proyecto 12")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(screen.getByText("Proyecto 12")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run components/estudiante/herramientas/HerramientasHub.test.tsx`
Expected: FAIL — `Cannot find module './HerramientasHub'`

- [ ] **Step 3: Implementar `HerramientasHub.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad";
import { staggerContainer, blurFadeUp } from "@/lib/motion";
import { GrupoPrincipalCard } from "./GrupoPrincipalCard";
import { IndicadoresPanel } from "./IndicadoresPanel";
import { HerramientasToolbar, type OrdenGrupos, type VistaGrupos } from "./HerramientasToolbar";
import { CategoriaChips, type FiltroCategoria } from "./CategoriaChips";
import { GrupoCard } from "./GrupoCard";
import { Paginacion } from "./Paginacion";

const POR_PAGINA = 12;

const BENEFICIOS = [
  "Conecta directo con otros agentes del equipo.",
  "Resuelve dudas de proyectos en tiempo real.",
  "Entérate primero de nuevas clases y anuncios.",
];

export function HerramientasHub({ grupos }: { grupos: GrupoComunidad[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<FiltroCategoria>("todos");
  const [orden, setOrden] = useState<OrdenGrupos>("nombre");
  const [vista, setVista] = useState<VistaGrupos>("grid");
  const [pagina, setPagina] = useState(1);

  const grupoPrincipal = useMemo(
    () => grupos.find((grupo) => grupo.categoria === "grupo_principal"),
    [grupos]
  );

  const gruposDeProyecto = useMemo(
    () => grupos.filter((grupo) => grupo.categoria !== "grupo_principal"),
    [grupos]
  );

  const conteos = useMemo(() => {
    const base: Record<FiltroCategoria, number> = {
      todos: gruposDeProyecto.length,
      grupo_principal: 0,
      miami: 0,
      orlando_centro_florida: 0,
      venta_renta: 0,
      otros: 0,
    };
    for (const grupo of gruposDeProyecto) {
      base[grupo.categoria] += 1;
    }
    return base;
  }, [gruposDeProyecto]);

  const gruposFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const filtrados = gruposDeProyecto.filter((grupo) => {
      const coincideTexto =
        grupo.nombre.toLowerCase().includes(texto) ||
        (grupo.detalle ?? "").toLowerCase().includes(texto);
      const coincideCategoria = filtroCategoria === "todos" || grupo.categoria === filtroCategoria;
      return coincideTexto && coincideCategoria;
    });

    return [...filtrados].sort((a, b) => {
      if (orden === "nombre") {
        return a.nombre.localeCompare(b.nombre);
      }
      return (b.creadoEn ?? "").localeCompare(a.creadoEn ?? "");
    });
  }, [gruposDeProyecto, busqueda, filtroCategoria, orden]);

  const totalPaginas = Math.max(1, Math.ceil(gruposFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const gruposPagina = gruposFiltrados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA
  );

  function conFiltroNuevo(aplicar: () => void) {
    aplicar();
    setPagina(1);
  }

  return (
    <div className="flex flex-col gap-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.1)}
        className="grid gap-8 rounded-[24px] border border-white/[0.06] bg-gradient-to-r from-whatsapp/10 via-transparent to-transparent p-8 sm:grid-cols-[1.4fr_1fr] sm:p-10"
      >
        <motion.div variants={blurFadeUp}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-whatsapp/20 bg-whatsapp/10 text-whatsapp">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-whatsapp">
            Prioridad #1 para nuevos agentes
          </p>
          <h1 className="mt-2 font-display text-[42px] font-bold leading-tight text-white">
            Herramientas y Comunicación
          </h1>
          <p className="mt-3 max-w-xl text-lg text-mist-400">
            Directorio de grupos y comunidades del equipo. Conectarte es uno de los primeros
            pasos para operar dentro de Team 100% Real Estate.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio} className="flex items-start gap-2.5 text-sm text-mist-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                {beneficio}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          variants={blurFadeUp}
          aria-hidden="true"
          className="hidden items-center justify-center sm:flex"
        >
          <div className="h-40 w-40 rounded-full bg-whatsapp/10 blur-2xl" />
        </motion.div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2">
        <GrupoPrincipalCard grupo={grupoPrincipal} />
        <IndicadoresPanel totalGrupos={gruposDeProyecto.length} />
      </div>

      <HerramientasToolbar
        busqueda={busqueda}
        onBusquedaChange={(valor) => conFiltroNuevo(() => setBusqueda(valor))}
        orden={orden}
        onOrdenChange={setOrden}
        vista={vista}
        onVistaChange={setVista}
      />

      <CategoriaChips
        conteos={conteos}
        filtro={filtroCategoria}
        onFiltroChange={(valor) => conFiltroNuevo(() => setFiltroCategoria(valor))}
      />

      {gruposFiltrados.length === 0 ? (
        <p className="text-mist-400">No encontramos grupos con ese nombre.</p>
      ) : (
        <motion.div
          key={`${vista}-${paginaSegura}`}
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.04)}
          className={vista === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}
        >
          {gruposPagina.map((grupo) => (
            <GrupoCard key={grupo.id} grupo={grupo} vista={vista} />
          ))}
        </motion.div>
      )}

      <Paginacion
        pagina={paginaSegura}
        totalPaginas={totalPaginas}
        totalItems={gruposFiltrados.length}
        porPagina={POR_PAGINA}
        onPaginaChange={setPagina}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run components/estudiante/herramientas/HerramientasHub.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add components/estudiante/herramientas/HerramientasHub.tsx components/estudiante/herramientas/HerramientasHub.test.tsx
git commit -m "feat(herramientas): agrega HerramientasHub con busqueda, filtro, orden y paginacion"
```

---

### Task 8: Reescribir `app/(estudiante)/herramientas/page.tsx`

**Files:**
- Modify: `app/(estudiante)/herramientas/page.tsx`

- [ ] **Step 1: Reemplazar el stub por el server component real**

```tsx
import { getGruposComunidad } from "@/lib/db/grupos-comunidad";
import { HerramientasHub } from "@/components/estudiante/herramientas/HerramientasHub";

export default async function HerramientasPage() {
  const grupos = await getGruposComunidad();

  return <HerramientasHub grupos={grupos} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(estudiante)/herramientas/page.tsx"
git commit -m "feat(herramientas): conecta /herramientas con datos reales de Supabase"
```

---

### Task 9: Server actions admin `app/(admin)/admin/herramientas/actions.ts`

**Files:**
- Create: `app/(admin)/admin/herramientas/actions.ts`

- [ ] **Step 1: Implementar las server actions**

```ts
"use server";

import { revalidatePath } from "next/cache";
import {
  crearGrupo,
  actualizarGrupo,
  eliminarGrupo,
  type GrupoComunidadInput,
  type CategoriaGrupoComunidad,
  type CanalGrupoComunidad,
} from "@/lib/db/grupos-comunidad";

export type GrupoFormState = { error: string | null };

function leerInput(formData: FormData): GrupoComunidadInput {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    categoria: String(formData.get("categoria") ?? "otros") as CategoriaGrupoComunidad,
    detalle: String(formData.get("detalle") ?? "") || null,
    tipoCanal: String(formData.get("tipoCanal") ?? "whatsapp") as CanalGrupoComunidad,
    enlaceUrl: String(formData.get("enlaceUrl") ?? "") || null,
    orden: Number(formData.get("orden") ?? 0),
    activo: formData.get("activo") === "on",
  };
}

export async function crearGrupoAction(
  _prevState: GrupoFormState,
  formData: FormData
): Promise<GrupoFormState> {
  const input = leerInput(formData);

  if (!input.nombre) {
    return { error: "El nombre es obligatorio." };
  }

  try {
    await crearGrupo(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear el grupo." };
  }

  revalidatePath("/admin/herramientas");
  revalidatePath("/herramientas");
  return { error: null };
}

export async function actualizarGrupoAction(
  id: string,
  _prevState: GrupoFormState,
  formData: FormData
): Promise<GrupoFormState> {
  const input = leerInput(formData);

  try {
    await actualizarGrupo(id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el grupo." };
  }

  revalidatePath("/admin/herramientas");
  revalidatePath("/herramientas");
  return { error: null };
}

export async function eliminarGrupoAction(id: string): Promise<void> {
  await eliminarGrupo(id);
  revalidatePath("/admin/herramientas");
  revalidatePath("/herramientas");
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(admin)/admin/herramientas/actions.ts"
git commit -m "feat(admin): agrega server actions CRUD para grupos_comunidad"
```

---

### Task 10: `GrupoForm` y `GrupoListItem` (admin)

**Files:**
- Create: `components/admin/herramientas/GrupoForm.tsx`
- Create: `components/admin/herramientas/GrupoListItem.tsx`

- [ ] **Step 1: Implementar `GrupoForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad";
import type { GrupoFormState } from "@/app/(admin)/admin/herramientas/actions";

const estadoInicial: GrupoFormState = { error: null };

const CAMPO_CLASES =
  "h-11 w-full rounded-lg border border-white/10 bg-ink-950 px-3 text-sm text-white placeholder:text-mist-500 outline-none transition focus:border-gold-500/60";

export function GrupoForm({
  grupo,
  action,
}: {
  grupo?: GrupoComunidad;
  action: (prevState: GrupoFormState, formData: FormData) => Promise<GrupoFormState>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Nombre
        <input name="nombre" defaultValue={grupo?.nombre} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Categoría
        <select name="categoria" defaultValue={grupo?.categoria ?? "otros"} className={CAMPO_CLASES}>
          <option value="grupo_principal">Grupo Principal</option>
          <option value="miami">Miami</option>
          <option value="orlando_centro_florida">Orlando y Centro de Florida</option>
          <option value="venta_renta">Venta y Renta</option>
          <option value="otros">Otros</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Tipo de canal
        <select name="tipoCanal" defaultValue={grupo?.tipoCanal ?? "whatsapp"} className={CAMPO_CLASES}>
          <option value="whatsapp">WhatsApp</option>
          <option value="dropbox">Dropbox</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Detalle (zona o tipo de proyecto)
        <input name="detalle" defaultValue={grupo?.detalle ?? ""} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Enlace (WhatsApp o Dropbox)
        <input name="enlaceUrl" defaultValue={grupo?.enlaceUrl ?? ""} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Orden
        <input type="number" name="orden" defaultValue={grupo?.orden ?? 0} className={CAMPO_CLASES} />
      </label>

      <label className="flex items-center gap-2 text-sm text-mist-300">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={grupo?.activo ?? true}
          className="h-4 w-4 rounded border-white/20 bg-ink-950 text-gold-500"
        />
        Activo
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
        {pendiente ? "Guardando..." : grupo ? "Guardar cambios" : "Crear grupo"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Implementar `GrupoListItem.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad";
import { ETIQUETA_CATEGORIA } from "@/lib/db/grupos-comunidad";
import { actualizarGrupoAction, eliminarGrupoAction } from "@/app/(admin)/admin/herramientas/actions";
import { GrupoForm } from "./GrupoForm";

export function GrupoListItem({ grupo }: { grupo: GrupoComunidad }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="rounded-lg border border-white/10 p-4">
        <GrupoForm grupo={grupo} action={actualizarGrupoAction.bind(null, grupo.id)} />
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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 p-4">
      <div>
        <p className="font-medium text-white">{grupo.nombre}</p>
        <p className="text-sm text-mist-400">
          {ETIQUETA_CATEGORIA[grupo.categoria]} · {grupo.tipoCanal}
          {!grupo.enlaceUrl && " · sin enlace"}
          {!grupo.activo && " · inactivo"}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditando(true)} className="text-sm underline">
          Editar
        </button>
        <form action={eliminarGrupoAction.bind(null, grupo.id)}>
          <button type="submit" className="text-sm text-rose-400 underline">
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/herramientas/GrupoForm.tsx components/admin/herramientas/GrupoListItem.tsx
git commit -m "feat(admin): agrega GrupoForm y GrupoListItem para gestionar grupos_comunidad"
```

---

### Task 11: Página admin `app/(admin)/admin/herramientas/page.tsx`

**Files:**
- Create: `app/(admin)/admin/herramientas/page.tsx`

- [ ] **Step 1: Implementar la página**

```tsx
import { getTodosLosGrupos } from "@/lib/db/grupos-comunidad";
import { GrupoForm } from "@/components/admin/herramientas/GrupoForm";
import { GrupoListItem } from "@/components/admin/herramientas/GrupoListItem";
import { crearGrupoAction } from "./actions";

export default async function AdminHerramientasPage() {
  const grupos = await getTodosLosGrupos();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-white">Grupos de comunidad</h1>

      <section className="flex flex-col gap-3">
        {grupos.map((grupo) => (
          <GrupoListItem key={grupo.id} grupo={grupo} />
        ))}
        {grupos.length === 0 && <p className="text-sm text-mist-400">Sin grupos registrados.</p>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Nuevo grupo</h2>
        <GrupoForm action={crearGrupoAction} />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(admin)/admin/herramientas/page.tsx"
git commit -m "feat(admin): agrega pagina /admin/herramientas"
```

---

### Task 12: Verificación final

**Files:** ninguno (solo comandos)

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Suite completa de tests**

Run: `npm test`
Expected: todos los tests pasan, incluyendo los 12 nuevos de `lib/db/grupos-comunidad.test.ts` y los 5 nuevos de `components/estudiante/herramientas/HerramientasHub.test.tsx`.

- [ ] **Step 4: Aplicar la migración en Supabase (manual, fuera de este repo)**

Abre el SQL Editor del proyecto de Supabase y pega el contenido completo de `supabase/migrations/008_grupos_comunidad.sql`. Confirma que la consulta `select count(*) from grupos_comunidad;` devuelve `51`.

- [ ] **Step 5: Verificación manual en el navegador**

Run: `npm run dev`

1. Inicia sesión como estudiante y visita `/herramientas`: confirma que se ve el Hero, el panel "Grupo Principal" + indicadores ("50 · Grupos", "1 · Oficial", "100% · Privado"), el toolbar (buscador, orden, toggle grid/lista), los chips de categoría con conteos correctos (Miami 35, Orlando y Centro de Florida 8, Venta y Renta 2, Otros 5), el grid de tarjetas (todas con "Enlace pendiente" porque `enlace_url` es NULL) y la paginación (5 páginas de 12/12/12/12/2).
2. Prueba el buscador (ej. "domus"), un chip de categoría, y el toggle de vista lista.
3. Inicia sesión como admin y visita `/admin/herramientas`: confirma que aparecen los 51 grupos, edita uno pegándole una URL de prueba en "Enlace" y guarda — confirma que en `/herramientas` esa tarjeta ahora muestra "Unirse ↗" en vez de "Enlace pendiente".
4. Detén el servidor (`Ctrl+C`).

- [ ] **Step 6: Commit final si hubo ajustes**

Si algún paso de verificación requirió cambios, haz commit de los ajustes con un mensaje descriptivo. Si no hubo cambios, no hay nada que commitear en este paso.

---

## Resumen de archivos

| Archivo | Tipo |
|---|---|
| `supabase/migrations/008_grupos_comunidad.sql` | Nuevo |
| `lib/db/grupos-comunidad.ts` | Nuevo |
| `lib/db/grupos-comunidad.test.ts` | Nuevo |
| `docs/BASE_DE_DATOS.md` | Modificado |
| `components/estudiante/herramientas/GrupoCard.tsx` | Nuevo |
| `components/estudiante/herramientas/GrupoPrincipalCard.tsx` | Nuevo |
| `components/estudiante/herramientas/IndicadoresPanel.tsx` | Nuevo |
| `components/estudiante/herramientas/HerramientasToolbar.tsx` | Nuevo |
| `components/estudiante/herramientas/CategoriaChips.tsx` | Nuevo |
| `components/estudiante/herramientas/Paginacion.tsx` | Nuevo |
| `components/estudiante/herramientas/HerramientasHub.tsx` | Nuevo |
| `components/estudiante/herramientas/HerramientasHub.test.tsx` | Nuevo |
| `app/(estudiante)/herramientas/page.tsx` | Reescrito |
| `app/(admin)/admin/herramientas/actions.ts` | Nuevo |
| `components/admin/herramientas/GrupoForm.tsx` | Nuevo |
| `components/admin/herramientas/GrupoListItem.tsx` | Nuevo |
| `app/(admin)/admin/herramientas/page.tsx` | Nuevo |
