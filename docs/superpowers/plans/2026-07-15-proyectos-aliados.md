# Proyectos Inmobiliarios Aliados Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el `href: null` de "Proyectos Inmobiliarios Aliados" por una página real: catálogo de 10 preconstrucciones aliadas (contenido real ya capturado) con tarjetas grandes de imagen, contacto "In House" y enlace de WhatsApp, más su panel de administración.

**Architecture:** Mismo patrón que `grupos_comunidad`/`/herramientas`/`/admin/herramientas`: migración SQL con RLS de catálogo público (lectura para cualquier autenticado, escritura solo admin), tipos en un archivo `.types.ts` separado del cliente Supabase (para que los componentes cliente puedan importarlos sin arrastrar código server-only — patrón vigente desde el commit `5835334`), capa `lib/db/*.ts` sin ORM, página de estudiante server component que delega a un componente cliente, y CRUD admin con server actions + `useActionState`. El tratamiento visual de la tarjeta reutiliza el patrón de imagen grande de `DashboardContent.tsx` (Team Leaders) en vez del patrón de ícono pequeño de `GrupoCard` — decisión de diseño explícita, ver spec §4.

**Tech Stack:** Next.js 15 (App Router), Supabase (`@supabase/ssr`), Framer Motion (`lib/motion.ts`), Tailwind (tokens `ink`/`gold`/`mist` de `docs/design-system.md`), Vitest + Testing Library.

---

## Referencia: spec

Este plan implementa `docs/superpowers/specs/2026-07-15-proyectos-aliados-design.md`. Léelo primero si algo aquí no tiene sentido, en particular la sección 2 (contenido real completo de los 10 proyectos) y la sección 6 (por qué `imagen_url` se siembra en `NULL`).

---

### Task 1: Migración SQL — tabla `proyectos_aliados`

**Files:**
- Create: `supabase/migrations/009_proyectos_aliados.sql`

- [ ] **Step 1: Escribir la migración completa**

```sql
-- 009_proyectos_aliados.sql
-- Catálogo de proyectos inmobiliarios aliados (preconstrucciones con
-- comisión para el equipo), mostrado en /proyectos-inmobiliarios-aliados.
-- Mismo patrón que 008_grupos_comunidad.sql: catálogo de lectura pública
-- (cualquier autenticado), gestionado solo por un admin.
-- Depende de 001_esquema.sql y 002_usuarios.sql (usa is_admin()).
--
-- precio_desde es texto libre (no numérico): el formato varía por
-- proyecto y no hay necesidad de ordenar/filtrar por precio (10 ítems).
-- Es nullable porque 2 de los 10 proyectos no traen precio en el
-- contenido fuente (Elle Residences, GZ Tower).
--
-- whatsapp_url viene completo desde el seed (a diferencia de
-- grupos_comunidad.enlace_url): los 10 enlaces reales ya estaban
-- disponibles al escribir esta migración.
--
-- imagen_url se siembra en NULL: las 10 fotos existen localmente pero se
-- suben manualmente a Supabase Storage después (ver
-- public/images/proyectos-aliados/README.md) y se completan desde
-- /admin/proyectos-inmobiliarios-aliados.

create table proyectos_aliados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null,
  precio_desde text,
  contacto_nombre text not null,
  contacto_telefono text not null,
  whatsapp_url text not null,
  imagen_url text,
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index proyectos_aliados_orden_idx on proyectos_aliados(orden);
create index proyectos_aliados_activo_idx on proyectos_aliados(activo);

alter table proyectos_aliados enable row level security;
create policy "proyectos_aliados_select_all" on proyectos_aliados for select using (true);
create policy "proyectos_aliados_admin_all" on proyectos_aliados for all using (is_admin()) with check (is_admin());

-- Datos semilla: 10 proyectos aliados, contenido real capturado del sitio
-- de referencia (ver docs/superpowers/specs/2026-07-15-proyectos-aliados-design.md,
-- sección 2).
insert into proyectos_aliados (nombre, descripcion, precio_desde, contacto_nombre, contacto_telefono, whatsapp_url, orden) values
  ('Domus', 'Una nueva revolución en el lujo urbano, ubicado en el distrito financiero de Miami, Brickell. Estudios y apartamentos de 1 y 2 habitaciones completamente amoblados.', 'Desde $480K', 'Diana Garcia', '+1 (305) 606-4208', 'https://chat.whatsapp.com/GHHgOqknNKgEh2hiEkqo7M?mode=wwc', 1),
  ('Delano', 'Descubre Delano Residences & Hotel Miami, una torre icónica en Downtown que combina lujo, residencias exclusivas y renta corta, con amenidades de primer nivel como rooftop pool, spa, restaurante y acceso a servicios de playa.', 'Desde $725K', 'Christian Tupper', '+1 (786) 351-3342', 'https://chat.whatsapp.com/CsU3wnH91AX0WoPD3PFGOY', 2),
  ('Palma', 'Descubre Palma Miami Beach, residencias de lujo completamente amobladas, con acceso a beach club, amenidades tipo resort y sin restricciones de renta. Vive o invierte en el destino soñado frente al mar.', 'Desde $650K', 'Danny Neumann', '+1 (786) 521-5992', 'https://chat.whatsapp.com/HbFwLGQhZuyBDiTV1zE5wq', 3),
  ('The House of Wellness', 'House of Wellness en Brickell redefine el estilo de vida con un enfoque en bienestar integral, combinando fitness, spa, recuperación y comunidad en un solo lugar. Diseñado para equilibrar la energía de la ciudad con la tranquilidad diaria.', 'Desde $400K', 'Natalia Rojas', '+1 (305) 767-5840', 'https://chat.whatsapp.com/Hf2vxF4QSBBG7xrszLLMia?mode=gi_t', 4),
  ('Meliá', 'Meliá Residences Miami, un proyecto hotelero en Brickell diseñado para generar ingresos pasivos. Unidades amobladas, operación por Meliá y alta demanda turística. Entrega 2027.', 'Desde $539K', 'Luisiana Gamboa', '+1 (786) 707-9944', 'https://chat.whatsapp.com/Bm1SLnpvRmJ76KJDBCvf7u?mode=gi_t', 5),
  ('Edge House', 'Oportunidad de inversión en Miami. Proyecto de 57 pisos con 600 unidades, renta corta permitida desde 1 noche y unidades amobladas por Adriana Hoyos. Estructura flexible desde 5% inicial, con leaseback del 10% anual. Entrega 2028.', 'Desde $495K', 'Jessica Rivera', '+1 (786) 499-9237', 'https://chat.whatsapp.com/JqdXGJDf6OXAplxC8iGtmA?mode=wwc', 6),
  ('Elle Residences', 'Ofrece residencias de lujo completamente amobladas, con renta flexible y amenidades tipo resort. Ubicación estratégica y respaldo de una marca global de lifestyle. Ideal para inversionistas que buscan exclusividad y rentabilidad en Miami.', null, 'Alex Cardona', '+1 (786) 366-2666', 'https://chat.whatsapp.com/FPcCprZSLCaIgOfvoYMOPR?mode=wwc', 7),
  ('GZ Tower', 'Proyecto de renta corta a 5 minutos de Universal Studios con 357 unidades turnkey (studios, 1BR y lockouts). Edificio de 17 pisos con amenidades tipo resort y alta demanda turística.', null, 'Katherine Vargas', '+1 (689) 233-6683', 'https://chat.whatsapp.com/BcYhZZ2gToI8LLs3qoDQr2?mode=gi_t', 8),
  ('Millenia Park', 'Enfocado en renta anual (no short term), en un mercado con +95% de ocupación. Entregas por fases hasta 2028. Estructura flexible según fase (desde 20%–30% inicial + pagos durante construcción). Ideal para inversionistas que buscan estabilidad y flujo constante a largo plazo.', 'Desde $289K', 'Marisol Prada', '+1 (786) 948-4060', 'https://chat.whatsapp.com/IO6ARY3HkljACCTiQwSsvR?mode=wwc', 9),
  ('The Standard', 'The Standard Residences Brickell Miami: torre de 46 pisos con 422 unidades y política de renta flexible (30 días, hasta 12 veces al año). Ubicación estratégica en Brickell con alto potencial de inversión.', 'Desde $621K', 'Nathalie Fernandez', '+1 (305) 331-3151', 'https://chat.whatsapp.com/EmUIqBubafQCaO47DOB8WM?mode=wwc', 10);
```

- [ ] **Step 2: Revisión manual del archivo**

Cuenta las filas del `insert` (deben ser 10) y confirma visualmente que no hay comas colgantes ni comillas sin cerrar. Como en migraciones anteriores, no hay forma de aplicar/probar esto de forma automatizada en este repo (`supabase/migrations/README.md`) — se aplica manualmente en el SQL Editor de Supabase.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/009_proyectos_aliados.sql
git commit -m "feat(db): agrega tabla proyectos_aliados con 10 proyectos semilla"
```

---

### Task 2: Capa de datos `lib/db/proyectos-aliados.ts` (TDD)

**Files:**
- Create: `lib/db/proyectos-aliados.types.ts`
- Create: `lib/db/proyectos-aliados.ts`
- Test: `lib/db/proyectos-aliados.test.ts`

- [ ] **Step 1: Implementar los tipos**

```ts
export type ProyectoAliado = {
  id: string;
  nombre: string;
  descripcion: string;
  precioDesde: string | null;
  contactoNombre: string;
  contactoTelefono: string;
  whatsappUrl: string;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
  creadoEn?: string;
};

export type ProyectoAliadoInput = {
  nombre: string;
  descripcion: string;
  precioDesde: string | null;
  contactoNombre: string;
  contactoTelefono: string;
  whatsappUrl: string;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
};
```

Los tipos viven en un archivo separado (`.types.ts`), sin importar `@/lib/supabase/server` — así los componentes cliente (Task 4/5) pueden importar el tipo `ProyectoAliado` sin arrastrar código server-only. Mismo patrón que `lib/db/grupos-comunidad.types.ts`.

- [ ] **Step 2: Escribir el test completo (falla porque el módulo no existe)**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const filaEjemplo = {
  id: "1",
  nombre: "Domus",
  descripcion: "Una nueva revolución en el lujo urbano.",
  precio_desde: "Desde $480K",
  contacto_nombre: "Diana Garcia",
  contacto_telefono: "+1 (305) 606-4208",
  whatsapp_url: "https://chat.whatsapp.com/GHHgOqknNKgEh2hiEkqo7M?mode=wwc",
  imagen_url: null,
  orden: 1,
  activo: true,
  creado_en: "2026-01-01T00:00:00.000Z",
};

const proyectoMapeado = {
  id: "1",
  nombre: "Domus",
  descripcion: "Una nueva revolución en el lujo urbano.",
  precioDesde: "Desde $480K",
  contactoNombre: "Diana Garcia",
  contactoTelefono: "+1 (305) 606-4208",
  whatsappUrl: "https://chat.whatsapp.com/GHHgOqknNKgEh2hiEkqo7M?mode=wwc",
  imagenUrl: null,
  orden: 1,
  activo: true,
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const proyectoInputEjemplo = {
  nombre: "Domus",
  descripcion: "Una nueva revolución en el lujo urbano.",
  precioDesde: "Desde $480K",
  contactoNombre: "Diana Garcia",
  contactoTelefono: "+1 (305) 606-4208",
  whatsappUrl: "https://chat.whatsapp.com/GHHgOqknNKgEh2hiEkqo7M?mode=wwc",
  imagenUrl: null,
  orden: 1,
  activo: true,
};

type ProyectosResult = {
  data: (typeof filaEjemplo)[] | null;
  error: { message: string } | null;
};

type MutacionResult = { error: { message: string } | null };

describe("getProyectosAliados", () => {
  const orderMock = vi.fn(
    (): Promise<ProyectosResult> => Promise.resolve({ data: [filaEjemplo], error: null })
  );
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

  it("consulta solo proyectos activos, ordenados por orden", async () => {
    const { getProyectosAliados } = await import("./proyectos-aliados");
    const proyectos = await getProyectosAliados();

    expect(fromMock).toHaveBeenCalledWith("proyectos_aliados");
    expect(eqMock).toHaveBeenCalledWith("activo", true);
    expect(orderMock).toHaveBeenCalledWith("orden");
    expect(proyectos).toEqual([proyectoMapeado]);
  });

  it("lanza un error legible si Supabase falla", async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: { message: "timeout" } });

    const { getProyectosAliados } = await import("./proyectos-aliados");

    await expect(getProyectosAliados()).rejects.toThrow(
      "No se pudieron cargar los proyectos: timeout"
    );
  });
});

describe("getTodosLosProyectos", () => {
  const orderMock = vi.fn(
    (): Promise<ProyectosResult> => Promise.resolve({ data: [filaEjemplo], error: null })
  );
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

  it("consulta todos los proyectos sin filtrar por activo", async () => {
    const { getTodosLosProyectos } = await import("./proyectos-aliados");
    const proyectos = await getTodosLosProyectos();

    expect(fromMock).toHaveBeenCalledWith("proyectos_aliados");
    expect(orderMock).toHaveBeenCalledWith("orden");
    expect(proyectos).toEqual([proyectoMapeado]);
  });
});

describe("crearProyecto", () => {
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

  it("inserta el proyecto mapeando los campos a snake_case", async () => {
    const { crearProyecto } = await import("./proyectos-aliados");
    await crearProyecto(proyectoInputEjemplo);

    expect(fromMock).toHaveBeenCalledWith("proyectos_aliados");
    expect(insertMock).toHaveBeenCalledWith({
      nombre: "Domus",
      descripcion: "Una nueva revolución en el lujo urbano.",
      precio_desde: "Desde $480K",
      contacto_nombre: "Diana Garcia",
      contacto_telefono: "+1 (305) 606-4208",
      whatsapp_url: "https://chat.whatsapp.com/GHHgOqknNKgEh2hiEkqo7M?mode=wwc",
      imagen_url: null,
      orden: 1,
      activo: true,
    });
  });

  it("lanza un error legible si Supabase falla", async () => {
    insertMock.mockResolvedValueOnce({ error: { message: "permission denied" } });

    const { crearProyecto } = await import("./proyectos-aliados");

    await expect(crearProyecto(proyectoInputEjemplo)).rejects.toThrow(
      "No se pudo crear el proyecto: permission denied"
    );
  });
});

describe("actualizarProyecto", () => {
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

  it("actualiza el proyecto con el payload en snake_case", async () => {
    const { actualizarProyecto } = await import("./proyectos-aliados");
    await actualizarProyecto("1", proyectoInputEjemplo);

    expect(fromMock).toHaveBeenCalledWith("proyectos_aliados");
    expect(updateMock).toHaveBeenCalledWith({
      nombre: "Domus",
      descripcion: "Una nueva revolución en el lujo urbano.",
      precio_desde: "Desde $480K",
      contacto_nombre: "Diana Garcia",
      contacto_telefono: "+1 (305) 606-4208",
      whatsapp_url: "https://chat.whatsapp.com/GHHgOqknNKgEh2hiEkqo7M?mode=wwc",
      imagen_url: null,
      orden: 1,
      activo: true,
    });
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { actualizarProyecto } = await import("./proyectos-aliados");

    await expect(actualizarProyecto("1", proyectoInputEjemplo)).rejects.toThrow(
      "No se pudo actualizar el proyecto: timeout"
    );
  });
});

describe("eliminarProyecto", () => {
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

  it("elimina el proyecto por id", async () => {
    const { eliminarProyecto } = await import("./proyectos-aliados");
    await eliminarProyecto("1");

    expect(fromMock).toHaveBeenCalledWith("proyectos_aliados");
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { eliminarProyecto } = await import("./proyectos-aliados");

    await expect(eliminarProyecto("1")).rejects.toThrow("No se pudo eliminar el proyecto: timeout");
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `npx vitest run lib/db/proyectos-aliados.test.ts`
Expected: FAIL — `Cannot find module './proyectos-aliados'`

- [ ] **Step 4: Implementar `lib/db/proyectos-aliados.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import type { ProyectoAliado, ProyectoAliadoInput } from "@/lib/db/proyectos-aliados.types";

type FilaProyectoAliado = {
  id: string;
  nombre: string;
  descripcion: string;
  precio_desde: string | null;
  contacto_nombre: string;
  contacto_telefono: string;
  whatsapp_url: string;
  imagen_url: string | null;
  orden: number;
  activo: boolean;
  creado_en: string;
};

const COLUMNAS =
  "id, nombre, descripcion, precio_desde, contacto_nombre, contacto_telefono, whatsapp_url, imagen_url, orden, activo, creado_en";

function mapearProyecto(fila: FilaProyectoAliado): ProyectoAliado {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    precioDesde: fila.precio_desde,
    contactoNombre: fila.contacto_nombre,
    contactoTelefono: fila.contacto_telefono,
    whatsappUrl: fila.whatsapp_url,
    imagenUrl: fila.imagen_url,
    orden: fila.orden,
    activo: fila.activo,
    creadoEn: fila.creado_en,
  };
}

function serializarProyecto(input: ProyectoAliadoInput) {
  return {
    nombre: input.nombre.trim(),
    descripcion: input.descripcion.trim(),
    precio_desde: input.precioDesde?.trim() || null,
    contacto_nombre: input.contactoNombre.trim(),
    contacto_telefono: input.contactoTelefono.trim(),
    whatsapp_url: input.whatsappUrl.trim(),
    imagen_url: input.imagenUrl?.trim() || null,
    orden: input.orden,
    activo: input.activo,
  };
}

export async function getProyectosAliados(): Promise<ProyectoAliado[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proyectos_aliados")
    .select(COLUMNAS)
    .eq("activo", true)
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los proyectos: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearProyecto(fila as unknown as FilaProyectoAliado));
}

export async function getTodosLosProyectos(): Promise<ProyectoAliado[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proyectos_aliados")
    .select(COLUMNAS)
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los proyectos: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearProyecto(fila as unknown as FilaProyectoAliado));
}

export async function crearProyecto(input: ProyectoAliadoInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("proyectos_aliados").insert(serializarProyecto(input));

  if (error) {
    throw new Error(`No se pudo crear el proyecto: ${error.message}`);
  }
}

export async function actualizarProyecto(id: string, input: ProyectoAliadoInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("proyectos_aliados")
    .update(serializarProyecto(input))
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo actualizar el proyecto: ${error.message}`);
  }
}

export async function eliminarProyecto(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("proyectos_aliados").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el proyecto: ${error.message}`);
  }
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `npx vitest run lib/db/proyectos-aliados.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 6: Commit**

```bash
git add lib/db/proyectos-aliados.types.ts lib/db/proyectos-aliados.ts lib/db/proyectos-aliados.test.ts
git commit -m "feat(db): agrega capa de datos lib/db/proyectos-aliados"
```

---

### Task 3: Documentar la tabla en `docs/BASE_DE_DATOS.md`

**Files:**
- Modify: `docs/BASE_DE_DATOS.md`

- [ ] **Step 1: Agregar `009` a la lista de aplicación del esquema**

Busca este bloque:

```
007_calendario.sql        -- tabla de clases del calendario semanal
008_grupos_comunidad.sql  -- tabla de grupos de WhatsApp/Dropbox del equipo
```

Reemplázalo por:

```
007_calendario.sql        -- tabla de clases del calendario semanal
008_grupos_comunidad.sql  -- tabla de grupos de WhatsApp/Dropbox del equipo
009_proyectos_aliados.sql -- tabla de proyectos inmobiliarios aliados
```

- [ ] **Step 2: Agregar la sección de la tabla, después de `grupos_comunidad` (migración 008)**

Busca el final de la sección `### \`grupos_comunidad\` (migración 008)` (termina con la línea "Mismo patrón que `miembros_equipo`/`clases_calendario`. Consumida por..."). Justo después, antes del encabezado `## Funciones y triggers`, agrega:

```
### `proyectos_aliados` (migración 009)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `nombre` | text | |
| `descripcion` | text | |
| `precio_desde` | text | nullable — texto libre ("Desde $480K"); 2 de 10 proyectos no tienen precio en el contenido fuente |
| `contacto_nombre` | text | contacto "In House" del proyecto |
| `contacto_telefono` | text | |
| `whatsapp_url` | text | enlace de invitación al grupo del proyecto — sembrado completo, a diferencia de `grupos_comunidad.enlace_url` |
| `imagen_url` | text | nullable — sembrado en NULL, se completa desde `/admin/proyectos-inmobiliarios-aliados` tras subir la foto a Supabase Storage |
| `orden` | int | orden de aparición en el catálogo |
| `activo` | boolean | default true |
| `creado_en` | timestamptz | |

Mismo patrón que `grupos_comunidad`/`clases_calendario`. Consumida por `lib/db/proyectos-aliados.ts` → `/proyectos-inmobiliarios-aliados` (estudiante) y `/admin/proyectos-inmobiliarios-aliados` (gestión).
```

- [ ] **Step 3: Agregar la tabla a la lista de catálogos públicos de solo lectura**

Busca esta línea (en "Row Level Security — patrón general"):

```
- **Catálogos públicos de solo lectura**: `insignias`, `miembros_equipo`, `galeria_equipo`, `clases_calendario`, `grupos_comunidad` (`select using (true)`), gestionables solo por admin.
```

Reemplázala por:

```
- **Catálogos públicos de solo lectura**: `insignias`, `miembros_equipo`, `galeria_equipo`, `clases_calendario`, `grupos_comunidad`, `proyectos_aliados` (`select using (true)`), gestionables solo por admin.
```

- [ ] **Step 4: Commit**

```bash
git add docs/BASE_DE_DATOS.md
git commit -m "docs: documenta proyectos_aliados y migracion 009"
```

---

### Task 4: `ProyectoCard` (tarjeta grande con imagen)

**Files:**
- Create: `components/estudiante/proyectos-aliados/ProyectoCard.tsx`

- [ ] **Step 1: Implementar el componente**

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { blurFadeUp } from "@/lib/motion";

export function ProyectoCard({ proyecto }: { proyecto: ProyectoAliado }) {
  return (
    <motion.div
      variants={blurFadeUp}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative h-[440px] overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950"
    >
      {proyecto.imagenUrl ? (
        <Image
          src={proyecto.imagenUrl}
          alt={proyecto.nombre}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90"
        />
      ) : (
        <div className="absolute inset-0 bg-ink-900" aria-hidden="true" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent transition-opacity duration-300 group-hover:via-ink-950/60" />

      {proyecto.precioDesde && (
        <span className="absolute right-6 top-6 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-300">
          {proyecto.precioDesde}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-8">
        <h3 className="font-display text-xl font-bold text-white">{proyecto.nombre}</h3>
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-mist-300">
          {proyecto.descripcion}
        </p>
        <p className="mt-3 text-xs text-mist-400">
          {proyecto.contactoNombre} · {proyecto.contactoTelefono}
        </p>
        <a
          href={proyecto.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition hover:text-gold-200"
        >
          Unirse al grupo de WhatsApp ↗
        </a>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/estudiante/proyectos-aliados/ProyectoCard.tsx
git commit -m "feat(proyectos-aliados): agrega ProyectoCard con imagen grande"
```

---

### Task 5: `ProyectosAliadosGrid` — orquestador con animación de entrada (TDD)

**Files:**
- Create: `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx`
- Test: `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`

- [ ] **Step 1: Escribir el test completo (falla porque el módulo no existe)**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProyectosAliadosGrid } from "./ProyectosAliadosGrid";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";

function crearProyecto(
  overrides: Partial<ProyectoAliado> & { id: string; nombre: string }
): ProyectoAliado {
  return {
    descripcion: "Descripción de prueba.",
    precioDesde: "Desde $500K",
    contactoNombre: "Contacto Prueba",
    contactoTelefono: "+1 (000) 000-0000",
    whatsappUrl: "https://chat.whatsapp.com/prueba",
    imagenUrl: null,
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const PROYECTOS: ProyectoAliado[] = [
  crearProyecto({ id: "p1", nombre: "Domus" }),
  crearProyecto({ id: "p2", nombre: "Elle Residences", precioDesde: null }),
];

describe("ProyectosAliadosGrid", () => {
  it("renderiza una tarjeta por cada proyecto", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getByText("Domus")).toBeInTheDocument();
    expect(screen.getByText("Elle Residences")).toBeInTheDocument();
  });

  it("muestra el badge de precio solo si precioDesde no es null", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getAllByText(/^Desde \$/)).toHaveLength(1);
  });

  it("el link de WhatsApp usa la URL correcta y abre en una pestaña nueva", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    const links = screen.getAllByRole("link", { name: /unirse al grupo de whatsapp/i });
    expect(links[0]).toHaveAttribute("href", "https://chat.whatsapp.com/prueba");
    expect(links[0]).toHaveAttribute("target", "_blank");
  });

  it("muestra la comisión regular y la del equipo", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getByText(/comisión regular/i)).toBeInTheDocument();
    expect(screen.getByText(/comisión para el equipo/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`
Expected: FAIL — `Cannot find module './ProyectosAliadosGrid'`

- [ ] **Step 3: Implementar `ProyectosAliadosGrid.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { staggerContainer, blurFadeUp } from "@/lib/motion";
import { ProyectoCard } from "./ProyectoCard";

export function ProyectosAliadosGrid({ proyectos }: { proyectos: ProyectoAliado[] }) {
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
          Desarrollos y proyectos con los que trabajamos junto al equipo.
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

      <div className="grid gap-6 sm:grid-cols-2">
        {proyectos.map((proyecto) => (
          <ProyectoCard key={proyecto.id} proyecto={proyecto} />
        ))}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx
git commit -m "feat(proyectos-aliados): agrega ProyectosAliadosGrid con animacion de entrada"
```

---

### Task 6: `app/(estudiante)/proyectos-inmobiliarios-aliados/page.tsx`

**Files:**
- Create: `app/(estudiante)/proyectos-inmobiliarios-aliados/page.tsx`

- [ ] **Step 1: Implementar el server component**

```tsx
import { getProyectosAliados } from "@/lib/db/proyectos-aliados";
import { ProyectosAliadosGrid } from "@/components/estudiante/proyectos-aliados/ProyectosAliadosGrid";

export default async function ProyectosAliadosPage() {
  const proyectos = await getProyectosAliados();

  return <ProyectosAliadosGrid proyectos={proyectos} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(estudiante)/proyectos-inmobiliarios-aliados/page.tsx"
git commit -m "feat(proyectos-aliados): conecta /proyectos-inmobiliarios-aliados con datos reales"
```

---

### Task 7: Admin — server actions, formulario y lista

**Files:**
- Create: `app/(admin)/admin/proyectos-inmobiliarios-aliados/actions.ts`
- Create: `app/(admin)/admin/proyectos-inmobiliarios-aliados/page.tsx`
- Create: `components/admin/proyectos-aliados/ProyectoForm.tsx`
- Create: `components/admin/proyectos-aliados/ProyectoListItem.tsx`

- [ ] **Step 1: Implementar `actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { crearProyecto, actualizarProyecto, eliminarProyecto } from "@/lib/db/proyectos-aliados";
import type { ProyectoAliadoInput } from "@/lib/db/proyectos-aliados.types";

export type ProyectoFormState = { error: string | null };

function leerInput(formData: FormData): ProyectoAliadoInput {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    descripcion: String(formData.get("descripcion") ?? ""),
    precioDesde: String(formData.get("precioDesde") ?? "") || null,
    contactoNombre: String(formData.get("contactoNombre") ?? ""),
    contactoTelefono: String(formData.get("contactoTelefono") ?? ""),
    whatsappUrl: String(formData.get("whatsappUrl") ?? ""),
    imagenUrl: String(formData.get("imagenUrl") ?? "") || null,
    orden: Number(formData.get("orden") ?? 0),
    activo: formData.get("activo") === "on",
  };
}

export async function crearProyectoAction(
  _prevState: ProyectoFormState,
  formData: FormData
): Promise<ProyectoFormState> {
  const input = leerInput(formData);

  if (!input.nombre) {
    return { error: "El nombre es obligatorio." };
  }

  try {
    await crearProyecto(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear el proyecto." };
  }

  revalidatePath("/admin/proyectos-inmobiliarios-aliados");
  revalidatePath("/proyectos-inmobiliarios-aliados");
  return { error: null };
}

export async function actualizarProyectoAction(
  id: string,
  _prevState: ProyectoFormState,
  formData: FormData
): Promise<ProyectoFormState> {
  const input = leerInput(formData);

  try {
    await actualizarProyecto(id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el proyecto." };
  }

  revalidatePath("/admin/proyectos-inmobiliarios-aliados");
  revalidatePath("/proyectos-inmobiliarios-aliados");
  return { error: null };
}

export async function eliminarProyectoAction(id: string): Promise<void> {
  await eliminarProyecto(id);
  revalidatePath("/admin/proyectos-inmobiliarios-aliados");
  revalidatePath("/proyectos-inmobiliarios-aliados");
}
```

- [ ] **Step 2: Implementar `ProyectoForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import type { ProyectoFormState } from "@/app/(admin)/admin/proyectos-inmobiliarios-aliados/actions";

const estadoInicial: ProyectoFormState = { error: null };

const CAMPO_CLASES =
  "h-11 w-full rounded-lg border border-white/10 bg-ink-950 px-3 text-sm text-white placeholder:text-mist-500 outline-none transition focus:border-gold-500/60";

export function ProyectoForm({
  proyecto,
  action,
}: {
  proyecto?: ProyectoAliado;
  action: (prevState: ProyectoFormState, formData: FormData) => Promise<ProyectoFormState>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Nombre
        <input name="nombre" defaultValue={proyecto?.nombre} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Descripción
        <textarea
          name="descripcion"
          defaultValue={proyecto?.descripcion}
          required
          rows={3}
          className={`${CAMPO_CLASES} h-auto py-2`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Precio (opcional)
        <input
          name="precioDesde"
          defaultValue={proyecto?.precioDesde ?? ""}
          placeholder="Desde $480K"
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Orden
        <input type="number" name="orden" defaultValue={proyecto?.orden ?? 0} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Contacto In House
        <input
          name="contactoNombre"
          defaultValue={proyecto?.contactoNombre}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Teléfono de contacto
        <input
          name="contactoTelefono"
          defaultValue={proyecto?.contactoTelefono}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Enlace de WhatsApp
        <input
          name="whatsappUrl"
          defaultValue={proyecto?.whatsappUrl}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        URL de imagen (Supabase Storage)
        <input
          name="imagenUrl"
          defaultValue={proyecto?.imagenUrl ?? ""}
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-mist-300">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={proyecto?.activo ?? true}
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
        {pendiente ? "Guardando..." : proyecto ? "Guardar cambios" : "Crear proyecto"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Implementar `ProyectoListItem.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import {
  actualizarProyectoAction,
  eliminarProyectoAction,
} from "@/app/(admin)/admin/proyectos-inmobiliarios-aliados/actions";
import { ProyectoForm } from "./ProyectoForm";

export function ProyectoListItem({ proyecto }: { proyecto: ProyectoAliado }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="rounded-lg border border-white/10 p-4">
        <ProyectoForm proyecto={proyecto} action={actualizarProyectoAction.bind(null, proyecto.id)} />
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
        <p className="font-medium text-white">{proyecto.nombre}</p>
        <p className="text-sm text-mist-400">
          {proyecto.precioDesde ?? "Sin precio"}
          {!proyecto.imagenUrl && " · sin imagen"}
          {!proyecto.activo && " · inactivo"}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditando(true)} className="text-sm underline">
          Editar
        </button>
        <form action={eliminarProyectoAction.bind(null, proyecto.id)}>
          <button type="submit" className="text-sm text-rose-400 underline">
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implementar `page.tsx`**

```tsx
import { getTodosLosProyectos } from "@/lib/db/proyectos-aliados";
import { ProyectoForm } from "@/components/admin/proyectos-aliados/ProyectoForm";
import { ProyectoListItem } from "@/components/admin/proyectos-aliados/ProyectoListItem";
import { crearProyectoAction } from "./actions";

export default async function AdminProyectosAliadosPage() {
  const proyectos = await getTodosLosProyectos();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-white">Proyectos inmobiliarios aliados</h1>

      <section className="flex flex-col gap-3">
        {proyectos.map((proyecto) => (
          <ProyectoListItem key={proyecto.id} proyecto={proyecto} />
        ))}
        {proyectos.length === 0 && <p className="text-sm text-mist-400">Sin proyectos registrados.</p>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Nuevo proyecto</h2>
        <ProyectoForm action={crearProyectoAction} />
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add "app/(admin)/admin/proyectos-inmobiliarios-aliados" components/admin/proyectos-aliados
git commit -m "feat(admin): agrega CRUD de proyectos_aliados"
```

---

### Task 8: Activar el ítem de navegación

**Files:**
- Modify: `components/estudiante/nav-config.ts`

- [ ] **Step 1: Cambiar el `href`**

Busca (dentro del grupo `"Negocio"`):

```ts
      { label: "Proyectos Inmobiliarios Aliados", href: null },
```

Reemplázala por:

```ts
      { label: "Proyectos Inmobiliarios Aliados", href: "/proyectos-inmobiliarios-aliados" },
```

- [ ] **Step 2: Commit**

```bash
git add components/estudiante/nav-config.ts
git commit -m "feat(nav): activa el link de Proyectos Inmobiliarios Aliados"
```

---

### Task 9: README de fotos (`public/images/proyectos-aliados/`)

**Files:**
- Create: `public/images/proyectos-aliados/README.md`

- [ ] **Step 1: Escribir el README**

```md
# Fotos de "Proyectos Inmobiliarios Aliados" — vía Supabase Storage

Mismo patrón que `public/images/cultura/README.md`: las fotos no se suben a este repositorio, se alojan en un bucket público de Supabase Storage y el código solo guarda la URL pública de cada una en la columna `imagen_url` de `proyectos_aliados`.

## Cómo subir una foto y obtener su URL pública

1. En el Dashboard de Supabase del proyecto → **Storage** → crea un bucket (una sola vez) llamado, por ejemplo, `proyectos`, marcado como **público** (Public bucket). Puede ser el mismo bucket `equipo` si ya existe — no hace falta uno por tabla.
2. Sube cada foto dentro de ese bucket.
3. Click en el archivo subido → **Copy URL** (o "Obtener URL pública"). Te da un link con esta forma:
   `https://<tu-proyecto>.supabase.co/storage/v1/object/public/proyectos/domus-brickell.png`
4. Esa URL completa es la que se guarda en la base de datos — no hace falta ninguna conversión.

## Dónde va cada link

Se guarda en la columna `imagen_url` de la tabla `proyectos_aliados`, por `nombre`:

```sql
update proyectos_aliados set imagen_url = 'https://<tu-proyecto>.supabase.co/storage/v1/object/public/proyectos/domus-brickell.png' where nombre = 'Domus';
```

También puede completarse desde `/admin/proyectos-inmobiliarios-aliados` (campo "URL de imagen"), sin tocar SQL.

## Los 10 proyectos y su foto de referencia

Las 10 fotos ya existen (capturadas del sitio de referencia, con la foto del contacto "In House" superpuesta) — quedan pendientes de subir a Storage:

| Proyecto | Archivo de referencia |
|---|---|
| Domus | `domus-brickell.png` |
| Delano | `delano-miami.png` |
| Palma | `palma-miami.png` |
| The House of Wellness | `house-of-wellness.png` |
| Meliá | `melia-miami.png` |
| Edge House | `edge-house.png` |
| Elle Residences | `elle-residences.png` |
| GZ Tower | `gz-tower.png` |
| Millenia Park | `millenia-park.png` |
| The Standard | `the-standard.png` |

Hasta que se complete `imagen_url`, la tarjeta del proyecto muestra un fondo sólido (`bg-ink-900`) en vez de la foto — no rompe la página.
```

- [ ] **Step 2: Commit**

```bash
git add public/images/proyectos-aliados/README.md
git commit -m "docs: agrega README de fotos para proyectos_aliados"
```

---

### Task 10: Verificación completa

**Files:** ninguno (solo comandos)

- [ ] **Step 1: Correr la suite completa**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: los cuatro pasan (mismo orden que `.github/workflows/ci.yml`)

- [ ] **Step 2: Verificación manual en dev**

Run: `npm run dev`, iniciar sesión como estudiante, navegar a `/proyectos-inmobiliarios-aliados` desde el nav ("Negocio" → "Proyectos Inmobiliarios Aliados") y confirmar: 10 tarjetas visibles, 8 con badge de precio (Elle Residences y GZ Tower sin badge), cada botón de WhatsApp abre el enlace correcto en pestaña nueva, fondo sólido en vez de foto rota (aún no se subieron las imágenes). Luego, como admin, navegar a `/admin/proyectos-inmobiliarios-aliados` y confirmar que la lista y el formulario de creación funcionan.
