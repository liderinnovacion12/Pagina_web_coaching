# Fase 1 — Núcleo de Aprendizaje para Estudiantes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first 3 real student-facing pages (Bienvenida/dashboard, Sistema 100+, Clases) plus shared course-detail/lesson-player routes and a grouped mega-menu navigation shell, all backed by real Supabase data (cursos, lecciones, progreso, xp_eventos, insignias, membresia).

**Architecture:** Next.js App Router server components fetch data via new `lib/db/*` query functions; a single client component (`EstudianteShell`) wraps `app/(estudiante)/layout.tsx` and renders a 5-group mega-menu (desktop) / full-screen accordion overlay (mobile), with 14 of 17 reference-site modules shown disabled as "Próximamente". Lesson progress is tracked in Supabase via a server action, with a Mux player that gracefully falls back to a "video not available" state plus a manual "mark complete" button when no Mux credentials/asset exist yet.

**Tech Stack:** Next.js 15 (App Router), React 19, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Tailwind CSS, Framer Motion, lucide-react, `@mux/mux-player-react` (new dependency), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-07-07-estudiante-nucleo-aprendizaje-design.md`

---

## Task 1: Migración — `categoria` en cursos + `titulo` en lecciones

**Files:**
- Create: `supabase/migrations/006_cursos_categoria.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 006_cursos_categoria.sql
-- Fase 1 de páginas interiores de estudiante: diferencia los cursos "pilares"
-- del Sistema 100+ del resto del catálogo (Clases), y agrega el título de
-- lección que faltaba en el esquema original (001_coachpro_schema.sql) --
-- necesario para listar lecciones en la UI de curso/reproductor.

alter table cursos add column categoria text not null default 'clases'
  check (categoria in ('sistema_100', 'clases'));

alter table lecciones add column titulo text not null default 'Lección sin título';
alter table lecciones alter column titulo drop default;
```

- [ ] **Step 2: Apply it to the local/dev Supabase project**

Run: `supabase db push` (or run the SQL file directly against the project's SQL editor if not using the Supabase CLI locally).
Expected: migration applies with no errors; `cursos.categoria` and `lecciones.titulo` columns exist.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/006_cursos_categoria.sql
git commit -m "feat(db): agrega categoria a cursos y titulo a lecciones"
```

---

## Task 2: `lib/db/cursos.ts` — `getCursosPorCategoria`

**Files:**
- Modify: `lib/db/cursos.ts`
- Modify: `lib/db/cursos.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `lib/db/cursos.test.ts` (below the existing `getCursosPublicados` describe block, keep existing mocks/tests untouched):

```ts
describe("getCursosPorCategoria", () => {
  const cursosOrderMock = vi.fn();
  const cursosEqMock = vi.fn(() => ({ eq: cursosEqMock, order: cursosOrderMock }));
  const cursosSelectMock = vi.fn(() => ({ eq: cursosEqMock, order: cursosOrderMock }));

  const leccionesInMock = vi.fn();
  const leccionesSelectMock = vi.fn(() => ({ in: leccionesInMock }));

  const progresoInMock = vi.fn();
  const progresoEqMock = vi.fn(() => ({ in: progresoInMock }));
  const progresoSelectMock = vi.fn(() => ({ eq: progresoEqMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "cursos") return { select: cursosSelectMock };
    if (tabla === "lecciones") return { select: leccionesSelectMock };
    if (tabla === "progreso") return { select: progresoSelectMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    cursosSelectMock.mockClear();
    cursosEqMock.mockClear();
    cursosOrderMock.mockClear();
    leccionesSelectMock.mockClear();
    leccionesInMock.mockClear();
    progresoSelectMock.mockClear();
    progresoEqMock.mockClear();
    progresoInMock.mockClear();

    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("calcula el progreso agregado por curso filtrando por categoría", async () => {
    cursosOrderMock.mockResolvedValue({
      data: [{ id: "c1", titulo: "Mentalidad de Líder 100+", categoria: "sistema_100" }],
      error: null,
    });
    leccionesInMock.mockResolvedValue({
      data: [
        { id: "l1", curso_id: "c1" },
        { id: "l2", curso_id: "c1" },
      ],
      error: null,
    });
    progresoInMock.mockResolvedValue({
      data: [{ leccion_id: "l1", completado: true }],
      error: null,
    });

    const { getCursosPorCategoria } = await import("./cursos");
    const resultado = await getCursosPorCategoria("u1", "sistema_100");

    expect(cursosEqMock).toHaveBeenCalledWith("categoria", "sistema_100");
    expect(resultado).toEqual([
      {
        id: "c1",
        titulo: "Mentalidad de Líder 100+",
        categoria: "sistema_100",
        totalLecciones: 2,
        leccionesCompletadas: 1,
        progresoPorcentaje: 50,
      },
    ]);
  });

  it("retorna arreglo vacío sin consultar lecciones/progreso si no hay cursos", async () => {
    cursosOrderMock.mockResolvedValue({ data: [], error: null });

    const { getCursosPorCategoria } = await import("./cursos");
    const resultado = await getCursosPorCategoria("u1", "clases");

    expect(resultado).toEqual([]);
    expect(leccionesSelectMock).not.toHaveBeenCalled();
  });

  it("lanza un error legible si falla la consulta de cursos", async () => {
    cursosOrderMock.mockResolvedValue({ data: null, error: { message: "timeout" } });

    const { getCursosPorCategoria } = await import("./cursos");

    await expect(getCursosPorCategoria("u1", "clases")).rejects.toThrow(
      "No se pudo cargar el catálogo: timeout"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/db/cursos.test.ts`
Expected: FAIL with `getCursosPorCategoria is not a function` (or similar import error).

- [ ] **Step 3: Implement**

Add to `lib/db/cursos.ts` (keep the existing `CursoPublicado`/`getCursosPublicados` untouched):

```ts
export type CategoriaCurso = "sistema_100" | "clases";

export type CursoConProgreso = {
  id: string;
  titulo: string;
  categoria: CategoriaCurso;
  totalLecciones: number;
  leccionesCompletadas: number;
  progresoPorcentaje: number;
};

export async function getCursosPorCategoria(
  usuarioId: string,
  categoria?: CategoriaCurso
): Promise<CursoConProgreso[]> {
  const supabase = await createClient();

  let query = supabase
    .from("cursos")
    .select("id, titulo, categoria")
    .eq("publicado", true);

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  const { data: cursos, error: cursosError } = await query.order("titulo");

  if (cursosError) {
    throw new Error(`No se pudo cargar el catálogo: ${cursosError.message}`);
  }

  if (!cursos || cursos.length === 0) return [];

  const cursoIds = cursos.map((curso) => curso.id);

  const { data: lecciones, error: leccionesError } = await supabase
    .from("lecciones")
    .select("id, curso_id")
    .in("curso_id", cursoIds);

  if (leccionesError) {
    throw new Error(`No se pudieron cargar las lecciones: ${leccionesError.message}`);
  }

  const leccionIds = (lecciones ?? []).map((leccion) => leccion.id);

  const { data: progresos, error: progresoError } = leccionIds.length
    ? await supabase
        .from("progreso")
        .select("leccion_id, completado")
        .eq("usuario_id", usuarioId)
        .in("leccion_id", leccionIds)
    : { data: [], error: null };

  if (progresoError) {
    throw new Error(`No se pudo cargar el progreso: ${progresoError.message}`);
  }

  const completadas = new Set(
    (progresos ?? []).filter((p) => p.completado).map((p) => p.leccion_id)
  );

  return cursos.map((curso) => {
    const leccionesDelCurso = (lecciones ?? []).filter(
      (leccion) => leccion.curso_id === curso.id
    );
    const total = leccionesDelCurso.length;
    const completadasCount = leccionesDelCurso.filter((leccion) =>
      completadas.has(leccion.id)
    ).length;

    return {
      id: curso.id,
      titulo: curso.titulo,
      categoria: curso.categoria as CategoriaCurso,
      totalLecciones: total,
      leccionesCompletadas: completadasCount,
      progresoPorcentaje: total === 0 ? 0 : Math.round((completadasCount / total) * 100),
    };
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/db/cursos.test.ts`
Expected: PASS (all tests including the pre-existing `getCursosPublicados` ones).

- [ ] **Step 5: Commit**

```bash
git add lib/db/cursos.ts lib/db/cursos.test.ts
git commit -m "feat(db): agrega getCursosPorCategoria con progreso agregado"
```

---

## Task 3: `lib/db/cursos.ts` — `getCursoDetalle`

**Files:**
- Modify: `lib/db/cursos.ts`
- Modify: `lib/db/cursos.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `lib/db/cursos.test.ts`:

```ts
describe("getCursoDetalle", () => {
  const cursoSingleMock = vi.fn();
  const cursoEqMock = vi.fn(() => ({ single: cursoSingleMock }));
  const cursoSelectMock = vi.fn(() => ({ eq: cursoEqMock }));

  const leccionesOrderMock = vi.fn();
  const leccionesEqMock = vi.fn(() => ({ order: leccionesOrderMock }));
  const leccionesSelectMock = vi.fn(() => ({ eq: leccionesEqMock }));

  const progresoInMock = vi.fn();
  const progresoEqUsuarioMock = vi.fn(() => ({ in: progresoInMock }));
  const progresoSelectMock = vi.fn(() => ({ eq: progresoEqUsuarioMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "cursos") return { select: cursoSelectMock };
    if (tabla === "lecciones") return { select: leccionesSelectMock };
    if (tabla === "progreso") return { select: progresoSelectMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    cursoSelectMock.mockClear();
    cursoEqMock.mockClear();
    cursoSingleMock.mockClear();
    leccionesSelectMock.mockClear();
    leccionesEqMock.mockClear();
    leccionesOrderMock.mockClear();
    progresoSelectMock.mockClear();
    progresoEqUsuarioMock.mockClear();
    progresoInMock.mockClear();

    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("retorna el curso con sus lecciones y progreso del usuario", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Negociación y Cierre", categoria: "sistema_100", publicado: true },
      error: null,
    });
    leccionesOrderMock.mockResolvedValue({
      data: [
        { id: "l1", titulo: "Psicología de la negociación", tipo_contenido: "video", mux_asset_id: null, storage_key: null, orden: 1 },
        { id: "l2", titulo: "Técnicas de cierre", tipo_contenido: "video", mux_asset_id: null, storage_key: null, orden: 2 },
      ],
      error: null,
    });
    progresoInMock.mockResolvedValue({
      data: [{ leccion_id: "l1", segundo_actual: 120, completado: true }],
      error: null,
    });

    const { getCursoDetalle } = await import("./cursos");
    const resultado = await getCursoDetalle("c1", "u1");

    expect(resultado).toEqual({
      id: "c1",
      titulo: "Negociación y Cierre",
      categoria: "sistema_100",
      lecciones: [
        { id: "l1", titulo: "Psicología de la negociación", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 1, segundoActual: 120, completado: true },
        { id: "l2", titulo: "Técnicas de cierre", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 2, segundoActual: 0, completado: false },
      ],
    });
  });

  it("retorna null si el curso no existe o no está publicado", async () => {
    cursoSingleMock.mockResolvedValue({ data: null, error: { message: "no encontrado" } });

    const { getCursoDetalle } = await import("./cursos");
    const resultado = await getCursoDetalle("no-existe", "u1");

    expect(resultado).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/db/cursos.test.ts`
Expected: FAIL with `getCursoDetalle is not a function`.

- [ ] **Step 3: Implement**

Add to `lib/db/cursos.ts`:

```ts
export type LeccionConProgreso = {
  id: string;
  titulo: string;
  tipoContenido: string;
  muxAssetId: string | null;
  storageKey: string | null;
  orden: number;
  segundoActual: number;
  completado: boolean;
};

export type CursoDetalle = {
  id: string;
  titulo: string;
  categoria: CategoriaCurso;
  lecciones: LeccionConProgreso[];
};

export async function getCursoDetalle(
  cursoId: string,
  usuarioId: string
): Promise<CursoDetalle | null> {
  const supabase = await createClient();

  const { data: curso, error: cursoError } = await supabase
    .from("cursos")
    .select("id, titulo, categoria, publicado")
    .eq("id", cursoId)
    .single();

  if (cursoError || !curso || !curso.publicado) {
    return null;
  }

  const { data: lecciones, error: leccionesError } = await supabase
    .from("lecciones")
    .select("id, titulo, tipo_contenido, mux_asset_id, storage_key, orden")
    .eq("curso_id", cursoId)
    .order("orden");

  if (leccionesError) {
    throw new Error(`No se pudieron cargar las lecciones: ${leccionesError.message}`);
  }

  const leccionIds = (lecciones ?? []).map((leccion) => leccion.id);

  const { data: progresos } = leccionIds.length
    ? await supabase
        .from("progreso")
        .select("leccion_id, segundo_actual, completado")
        .eq("usuario_id", usuarioId)
        .in("leccion_id", leccionIds)
    : { data: [] };

  const progresoPorLeccion = new Map(
    (progresos ?? []).map((progreso) => [progreso.leccion_id, progreso])
  );

  return {
    id: curso.id,
    titulo: curso.titulo,
    categoria: curso.categoria as CategoriaCurso,
    lecciones: (lecciones ?? []).map((leccion) => {
      const progreso = progresoPorLeccion.get(leccion.id);
      return {
        id: leccion.id,
        titulo: leccion.titulo,
        tipoContenido: leccion.tipo_contenido,
        muxAssetId: leccion.mux_asset_id,
        storageKey: leccion.storage_key,
        orden: leccion.orden,
        segundoActual: progreso?.segundo_actual ?? 0,
        completado: progreso?.completado ?? false,
      };
    }),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/db/cursos.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/db/cursos.ts lib/db/cursos.test.ts
git commit -m "feat(db): agrega getCursoDetalle con lecciones y progreso"
```

---

## Task 4: `lib/db/lecciones.ts` — detalle de lección + marcar progreso

**Files:**
- Create: `lib/db/lecciones.ts`
- Create: `lib/db/lecciones.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("getLeccionDetalle", () => {
  const cursoSingleMock = vi.fn();
  const cursoEqMock = vi.fn(() => ({ single: cursoSingleMock }));
  const cursoSelectMock = vi.fn(() => ({ eq: cursoEqMock }));

  const leccionesOrderMock = vi.fn();
  const leccionesEqMock = vi.fn(() => ({ order: leccionesOrderMock }));
  const leccionesSelectMock = vi.fn(() => ({ eq: leccionesEqMock }));

  const progresoMaybeSingleMock = vi.fn();
  const progresoEqLeccionMock = vi.fn(() => ({ maybeSingle: progresoMaybeSingleMock }));
  const progresoEqUsuarioMock = vi.fn(() => ({ eq: progresoEqLeccionMock }));
  const progresoSelectMock = vi.fn(() => ({ eq: progresoEqUsuarioMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "cursos") return { select: cursoSelectMock };
    if (tabla === "lecciones") return { select: leccionesSelectMock };
    if (tabla === "progreso") return { select: progresoSelectMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    cursoSelectMock.mockClear();
    cursoEqMock.mockClear();
    cursoSingleMock.mockClear();
    leccionesSelectMock.mockClear();
    leccionesEqMock.mockClear();
    leccionesOrderMock.mockClear();
    progresoSelectMock.mockClear();
    progresoEqUsuarioMock.mockClear();
    progresoEqLeccionMock.mockClear();
    progresoMaybeSingleMock.mockClear();

    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("retorna la lección con navegación anterior/siguiente y progreso", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Negociación y Cierre", publicado: true },
      error: null,
    });
    leccionesOrderMock.mockResolvedValue({
      data: [
        { id: "l1", titulo: "Psicología de la negociación", tipo_contenido: "video", mux_asset_id: null, storage_key: null, orden: 1 },
        { id: "l2", titulo: "Técnicas de cierre", tipo_contenido: "video", mux_asset_id: "mux-123", storage_key: null, orden: 2 },
        { id: "l3", titulo: "Casos reales", tipo_contenido: "video", mux_asset_id: null, storage_key: null, orden: 3 },
      ],
      error: null,
    });
    progresoMaybeSingleMock.mockResolvedValue({
      data: { segundo_actual: 45, completado: false },
    });

    const { getLeccionDetalle } = await import("./lecciones");
    const resultado = await getLeccionDetalle("c1", "l2", "u1");

    expect(resultado).toEqual({
      id: "l2",
      titulo: "Técnicas de cierre",
      cursoId: "c1",
      cursoTitulo: "Negociación y Cierre",
      tipoContenido: "video",
      muxAssetId: "mux-123",
      storageKey: null,
      segundoActual: 45,
      completado: false,
      leccionAnteriorId: "l1",
      leccionSiguienteId: "l3",
    });
  });

  it("retorna null si el curso no existe o no está publicado", async () => {
    cursoSingleMock.mockResolvedValue({ data: null, error: { message: "no encontrado" } });

    const { getLeccionDetalle } = await import("./lecciones");
    const resultado = await getLeccionDetalle("no-existe", "l1", "u1");

    expect(resultado).toBeNull();
  });

  it("retorna null si la lección no pertenece al curso", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Negociación y Cierre", publicado: true },
      error: null,
    });
    leccionesOrderMock.mockResolvedValue({
      data: [{ id: "l1", titulo: "Psicología de la negociación", tipo_contenido: "video", mux_asset_id: null, storage_key: null, orden: 1 }],
      error: null,
    });

    const { getLeccionDetalle } = await import("./lecciones");
    const resultado = await getLeccionDetalle("c1", "l-inexistente", "u1");

    expect(resultado).toBeNull();
  });
});

describe("marcarProgreso", () => {
  const upsertMock = vi.fn();
  const fromMock = vi.fn(() => ({ upsert: upsertMock }));

  beforeEach(() => {
    upsertMock.mockClear();
    fromMock.mockClear();

    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("hace upsert del progreso con los campos provistos", async () => {
    upsertMock.mockResolvedValue({ error: null });

    const { marcarProgreso } = await import("./lecciones");
    await marcarProgreso("u1", "l2", { segundoActual: 90, completado: true });

    expect(fromMock).toHaveBeenCalledWith("progreso");
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario_id: "u1",
        leccion_id: "l2",
        segundo_actual: 90,
        completado: true,
      }),
      { onConflict: "usuario_id,leccion_id" }
    );
  });

  it("lanza un error legible si Supabase falla", async () => {
    upsertMock.mockResolvedValue({ error: { message: "timeout" } });

    const { marcarProgreso } = await import("./lecciones");

    await expect(marcarProgreso("u1", "l2", { completado: true })).rejects.toThrow(
      "No se pudo guardar el progreso: timeout"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/db/lecciones.test.ts`
Expected: FAIL — `lib/db/lecciones.ts` does not exist.

- [ ] **Step 3: Implement**

```ts
import { createClient } from "@/lib/supabase/server";

export type LeccionDetalle = {
  id: string;
  titulo: string;
  cursoId: string;
  cursoTitulo: string;
  tipoContenido: string;
  muxAssetId: string | null;
  storageKey: string | null;
  segundoActual: number;
  completado: boolean;
  leccionAnteriorId: string | null;
  leccionSiguienteId: string | null;
};

export async function getLeccionDetalle(
  cursoId: string,
  leccionId: string,
  usuarioId: string
): Promise<LeccionDetalle | null> {
  const supabase = await createClient();

  const { data: curso, error: cursoError } = await supabase
    .from("cursos")
    .select("id, titulo, publicado")
    .eq("id", cursoId)
    .single();

  if (cursoError || !curso || !curso.publicado) {
    return null;
  }

  const { data: lecciones, error: leccionesError } = await supabase
    .from("lecciones")
    .select("id, titulo, tipo_contenido, mux_asset_id, storage_key, orden")
    .eq("curso_id", cursoId)
    .order("orden");

  if (leccionesError) {
    throw new Error(`No se pudieron cargar las lecciones: ${leccionesError.message}`);
  }

  const listaLecciones = lecciones ?? [];
  const indice = listaLecciones.findIndex((leccion) => leccion.id === leccionId);

  if (indice === -1) {
    return null;
  }

  const leccion = listaLecciones[indice];

  const { data: progreso } = await supabase
    .from("progreso")
    .select("segundo_actual, completado")
    .eq("usuario_id", usuarioId)
    .eq("leccion_id", leccionId)
    .maybeSingle();

  return {
    id: leccion.id,
    titulo: leccion.titulo,
    cursoId: curso.id,
    cursoTitulo: curso.titulo,
    tipoContenido: leccion.tipo_contenido,
    muxAssetId: leccion.mux_asset_id,
    storageKey: leccion.storage_key,
    segundoActual: progreso?.segundo_actual ?? 0,
    completado: progreso?.completado ?? false,
    leccionAnteriorId: indice > 0 ? listaLecciones[indice - 1].id : null,
    leccionSiguienteId:
      indice < listaLecciones.length - 1 ? listaLecciones[indice + 1].id : null,
  };
}

export async function marcarProgreso(
  usuarioId: string,
  leccionId: string,
  cambios: { segundoActual?: number; completado?: boolean }
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("progreso").upsert(
    {
      usuario_id: usuarioId,
      leccion_id: leccionId,
      ...(cambios.segundoActual !== undefined && { segundo_actual: cambios.segundoActual }),
      ...(cambios.completado !== undefined && { completado: cambios.completado }),
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "usuario_id,leccion_id" }
  );

  if (error) {
    throw new Error(`No se pudo guardar el progreso: ${error.message}`);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/db/lecciones.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/db/lecciones.ts lib/db/lecciones.test.ts
git commit -m "feat(db): agrega getLeccionDetalle y marcarProgreso"
```

---

## Task 5: `lib/auth/actions.ts` — `cerrarSesion`

**Files:**
- Create: `lib/auth/actions.ts`
- Create: `lib/auth/actions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const signOutMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signOut: signOutMock } })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("cerrarSesion", () => {
  beforeEach(() => {
    signOutMock.mockReset();
    redirectMock.mockReset();
  });

  it("cierra la sesión en Supabase y redirige a /login", async () => {
    const { cerrarSesion } = await import("./actions");
    await cerrarSesion();

    expect(signOutMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/auth/actions.test.ts`
Expected: FAIL — `lib/auth/actions.ts` does not exist.

- [ ] **Step 3: Implement**

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function cerrarSesion(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/auth/actions.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/auth/actions.ts lib/auth/actions.test.ts
git commit -m "feat(auth): agrega server action cerrarSesion"
```

---

## Task 6: `lib/db/dashboard.ts` — `getResumenEstudiante`

**Files:**
- Create: `lib/db/dashboard.ts`
- Create: `lib/db/dashboard.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("getResumenEstudiante", () => {
  const xpEqMock = vi.fn();
  const xpSelectMock = vi.fn(() => ({ eq: xpEqMock }));

  const insigniasEqMock = vi.fn();
  const insigniasSelectMock = vi.fn(() => ({ eq: insigniasEqMock }));

  const progresoEqMock = vi.fn();
  const progresoSelectMock = vi.fn(() => ({ eq: progresoEqMock }));

  const membresiaMaybeSingleMock = vi.fn();
  const membresiaEqMock = vi.fn(() => ({ maybeSingle: membresiaMaybeSingleMock }));
  const membresiaSelectMock = vi.fn(() => ({ eq: membresiaEqMock }));

  const leccionesInMock = vi.fn();
  const leccionesSelectMock = vi.fn(() => ({ in: leccionesInMock }));

  const cursoSingleMock = vi.fn();
  const cursoEqMock = vi.fn(() => ({ single: cursoSingleMock }));
  const cursoSelectMock = vi.fn(() => ({ eq: cursoEqMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "xp_eventos") return { select: xpSelectMock };
    if (tabla === "insignias_usuario") return { select: insigniasSelectMock };
    if (tabla === "progreso") return { select: progresoSelectMock };
    if (tabla === "membresia") return { select: membresiaSelectMock };
    if (tabla === "lecciones") return { select: leccionesSelectMock };
    if (tabla === "cursos") return { select: cursoSelectMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    xpSelectMock.mockClear();
    xpEqMock.mockClear();
    insigniasSelectMock.mockClear();
    insigniasEqMock.mockClear();
    progresoSelectMock.mockClear();
    progresoEqMock.mockClear();
    membresiaSelectMock.mockClear();
    membresiaEqMock.mockClear();
    membresiaMaybeSingleMock.mockClear();
    leccionesSelectMock.mockClear();
    leccionesInMock.mockClear();
    cursoSelectMock.mockClear();
    cursoEqMock.mockClear();
    cursoSingleMock.mockClear();

    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("agrega XP, insignias, cursos en progreso, membresía y continuar viendo", async () => {
    xpEqMock.mockResolvedValue({ data: [{ puntos: 50 }, { puntos: 30 }], error: null });
    insigniasEqMock.mockResolvedValue({ data: [{ insignia_id: "i1" }], error: null });
    progresoEqMock.mockResolvedValue({
      data: [
        { leccion_id: "l1", completado: false, actualizado_en: "2026-07-06T10:00:00Z" },
        { leccion_id: "l2", completado: false, actualizado_en: "2026-07-07T10:00:00Z" },
        { leccion_id: "l3", completado: true, actualizado_en: "2026-07-05T10:00:00Z" },
      ],
      error: null,
    });
    membresiaMaybeSingleMock.mockResolvedValue({ data: { estado: "activa" } });
    leccionesInMock.mockResolvedValue({
      data: [
        { id: "l1", titulo: "Psicología de la negociación", curso_id: "c1", orden: 1 },
        { id: "l2", titulo: "Fuentes de leads en 2026", curso_id: "c2", orden: 1 },
      ],
      error: null,
    });
    cursoSingleMock.mockResolvedValue({ data: { id: "c2", titulo: "Prospección y Generación de Leads" } });

    const { getResumenEstudiante } = await import("./dashboard");
    const resumen = await getResumenEstudiante("u1");

    expect(resumen).toEqual({
      xpTotal: 80,
      insigniasCount: 1,
      cursosEnProgreso: 2,
      membresiaEstado: "activa",
      continuarViendo: {
        cursoId: "c2",
        leccionId: "l2",
        leccionTitulo: "Fuentes de leads en 2026",
        cursoTitulo: "Prospección y Generación de Leads",
      },
    });
  });

  it("retorna estado vacío para un estudiante nuevo sin actividad", async () => {
    xpEqMock.mockResolvedValue({ data: [], error: null });
    insigniasEqMock.mockResolvedValue({ data: [], error: null });
    progresoEqMock.mockResolvedValue({ data: [], error: null });
    membresiaMaybeSingleMock.mockResolvedValue({ data: null });

    const { getResumenEstudiante } = await import("./dashboard");
    const resumen = await getResumenEstudiante("u-nuevo");

    expect(resumen).toEqual({
      xpTotal: 0,
      insigniasCount: 0,
      cursosEnProgreso: 0,
      membresiaEstado: "sin_membresia",
      continuarViendo: null,
    });
    expect(leccionesSelectMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/db/dashboard.test.ts`
Expected: FAIL — `lib/db/dashboard.ts` does not exist.

- [ ] **Step 3: Implement**

```ts
import { createClient } from "@/lib/supabase/server";

export type ResumenEstudiante = {
  xpTotal: number;
  insigniasCount: number;
  cursosEnProgreso: number;
  membresiaEstado: "activa" | "cancelada" | "vencida" | "sin_membresia";
  continuarViendo: {
    cursoId: string;
    leccionId: string;
    leccionTitulo: string;
    cursoTitulo: string;
  } | null;
};

export async function getResumenEstudiante(usuarioId: string): Promise<ResumenEstudiante> {
  const supabase = await createClient();

  const [xpResult, insigniasResult, progresoResult, membresiaResult] = await Promise.all([
    supabase.from("xp_eventos").select("puntos").eq("usuario_id", usuarioId),
    supabase.from("insignias_usuario").select("insignia_id").eq("usuario_id", usuarioId),
    supabase
      .from("progreso")
      .select("leccion_id, completado, actualizado_en")
      .eq("usuario_id", usuarioId),
    supabase.from("membresia").select("estado").eq("usuario_id", usuarioId).maybeSingle(),
  ]);

  if (xpResult.error) {
    throw new Error(`No se pudo cargar el XP: ${xpResult.error.message}`);
  }
  if (insigniasResult.error) {
    throw new Error(`No se pudieron cargar las insignias: ${insigniasResult.error.message}`);
  }
  if (progresoResult.error) {
    throw new Error(`No se pudo cargar el progreso: ${progresoResult.error.message}`);
  }

  const xpTotal = (xpResult.data ?? []).reduce((suma, evento) => suma + evento.puntos, 0);
  const insigniasCount = (insigniasResult.data ?? []).length;

  const progresoIncompleto = (progresoResult.data ?? [])
    .filter((p) => !p.completado)
    .sort((a, b) => (a.actualizado_en < b.actualizado_en ? 1 : -1));

  const leccionIdsOrdenados = [...new Set(progresoIncompleto.map((p) => p.leccion_id))];

  let cursosEnProgreso = 0;
  let continuarViendo: ResumenEstudiante["continuarViendo"] = null;

  if (leccionIdsOrdenados.length > 0) {
    const { data: lecciones, error: leccionesError } = await supabase
      .from("lecciones")
      .select("id, titulo, curso_id, orden")
      .in("id", leccionIdsOrdenados);

    if (leccionesError) {
      throw new Error(`No se pudieron cargar las lecciones: ${leccionesError.message}`);
    }

    const leccionesPorId = new Map((lecciones ?? []).map((l) => [l.id, l]));
    cursosEnProgreso = new Set((lecciones ?? []).map((l) => l.curso_id)).size;

    const leccionMasReciente = leccionesPorId.get(leccionIdsOrdenados[0]);

    if (leccionMasReciente) {
      const { data: curso } = await supabase
        .from("cursos")
        .select("id, titulo")
        .eq("id", leccionMasReciente.curso_id)
        .single();

      if (curso) {
        continuarViendo = {
          cursoId: curso.id,
          leccionId: leccionMasReciente.id,
          leccionTitulo: leccionMasReciente.titulo,
          cursoTitulo: curso.titulo,
        };
      }
    }
  }

  return {
    xpTotal,
    insigniasCount,
    cursosEnProgreso,
    membresiaEstado: membresiaResult.data?.estado ?? "sin_membresia",
    continuarViendo,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/db/dashboard.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/db/dashboard.ts lib/db/dashboard.test.ts
git commit -m "feat(db): agrega getResumenEstudiante para el dashboard"
```

---

## Task 7: Ampliar `middleware-rules.ts` a las nuevas rutas de estudiante

**Files:**
- Modify: `lib/auth/middleware-rules.ts`
- Modify: `lib/auth/middleware-rules.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `lib/auth/middleware-rules.test.ts`:

```ts
it("redirige a /login si no hay rol en /sistema-100, /clases o /cursos", () => {
  expect(calcularRedireccion("/sistema-100", null)).toBe("/login");
  expect(calcularRedireccion("/clases", null)).toBe("/login");
  expect(calcularRedireccion("/cursos/c1", null)).toBe("/login");
});

it("permite a un estudiante entrar a /sistema-100, /clases y /cursos", () => {
  expect(calcularRedireccion("/sistema-100", "estudiante")).toBeNull();
  expect(calcularRedireccion("/clases", "estudiante")).toBeNull();
  expect(calcularRedireccion("/cursos/c1/lecciones/l1", "estudiante")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/auth/middleware-rules.test.ts`
Expected: FAIL — `/sistema-100`, `/clases`, `/cursos/c1` are not currently redirected to `/login` for `null` role (they fall through as unprotected).

- [ ] **Step 3: Implement**

Replace the top of `lib/auth/middleware-rules.ts`:

```ts
export type Rol = "admin" | "estudiante" | "coach";

const PREFIJOS_ESTUDIANTE = ["/dashboard", "/sistema-100", "/clases", "/cursos"];
const PREFIJO_ADMIN = "/admin";
const PREFIJO_COACH = "/coach";

function destinoPorRol(rol: Rol): string {
  if (rol === "admin") return "/admin";
  if (rol === "coach") return "/coach";
  return "/dashboard";
}

export function calcularRedireccion(
  pathname: string,
  rol: Rol | null
): string | null {
  const esRutaEstudiante = PREFIJOS_ESTUDIANTE.some((prefijo) =>
    pathname.startsWith(prefijo)
  );
  const esRutaAdmin = pathname.startsWith(PREFIJO_ADMIN);
  const esRutaCoach = pathname.startsWith(PREFIJO_COACH);

  if (!esRutaEstudiante && !esRutaAdmin && !esRutaCoach) return null;
  if (rol === null) return "/login";
  if (esRutaAdmin && rol !== "admin") return destinoPorRol(rol);
  if (esRutaCoach && rol !== "admin" && rol !== "coach") return destinoPorRol(rol);

  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/auth/middleware-rules.test.ts`
Expected: PASS (all tests, including pre-existing ones).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/middleware-rules.ts lib/auth/middleware-rules.test.ts
git commit -m "fix(auth): protege /sistema-100, /clases y /cursos en el middleware"
```

---

## Task 8: `components/estudiante/nav-config.ts`

**Files:**
- Create: `components/estudiante/nav-config.ts`
- Create: `components/estudiante/nav-config.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { NAV_GROUPS } from "./nav-config";

describe("NAV_GROUPS", () => {
  it("tiene 5 grupos", () => {
    expect(NAV_GROUPS).toHaveLength(5);
  });

  it("incluye los 17 módulos del mapa de referencia en total", () => {
    const totalItems = NAV_GROUPS.reduce((suma, grupo) => suma + grupo.items.length, 0);
    expect(totalItems).toBe(17);
  });

  it("solo Bienvenida, Sistema 100+ y Clases tienen href navegable", () => {
    const conHref = NAV_GROUPS.flatMap((grupo) => grupo.items).filter((item) => item.href !== null);
    expect(conHref.map((item) => item.href).sort()).toEqual(
      ["/clases", "/dashboard", "/sistema-100"].sort()
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/estudiante/nav-config.test.ts`
Expected: FAIL — file does not exist.

- [ ] **Step 3: Implement**

```ts
export type NavItem = {
  label: string;
  href: string | null;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Inicio",
    items: [{ label: "Bienvenida", href: "/dashboard" }],
  },
  {
    label: "Formación",
    items: [
      { label: "Sistema 100+", href: "/sistema-100" },
      { label: "Clases", href: "/clases" },
      { label: "Curso de Rentas", href: null },
      { label: "Acelerador Pro", href: null },
      { label: "Acelerador Starter", href: null },
    ],
  },
  {
    label: "Negocio",
    items: [
      { label: "Proyectos Inmobiliarios Aliados", href: null },
      { label: "Aliados Estratégicos", href: null },
      { label: "Transacciones", href: null },
      { label: "CRM", href: null },
      { label: "Marketing", href: null },
    ],
  },
  {
    label: "Comunidad",
    items: [
      { label: "Calendario", href: null },
      { label: "Eventos", href: null },
      { label: "Herramientas", href: null },
      { label: "Construcción de Equipo", href: null },
    ],
  },
  {
    label: "Soporte",
    items: [
      { label: "Soporte", href: null },
      { label: "Oficinas", href: null },
    ],
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/estudiante/nav-config.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/estudiante/nav-config.ts components/estudiante/nav-config.test.ts
git commit -m "feat(nav): agrega configuración de los 5 grupos de navegación"
```

---

## Task 9: `components/estudiante/EstudianteShell.tsx`

**Files:**
- Create: `components/estudiante/EstudianteShell.tsx`
- Create: `components/estudiante/EstudianteShell.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EstudianteShell } from "./EstudianteShell";

const cerrarSesionMock = vi.fn();

vi.mock("@/lib/auth/actions", () => ({
  cerrarSesion: (...args: unknown[]) => cerrarSesionMock(...args),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("EstudianteShell", () => {
  beforeEach(() => {
    cerrarSesionMock.mockReset();
  });

  it("renderiza el logo, el email del usuario y el contenido", () => {
    render(
      <EstudianteShell email="ana@example.com">
        <p>Contenido de la página</p>
      </EstudianteShell>
    );

    expect(screen.getByText("PRO")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("Contenido de la página")).toBeInTheDocument();
  });

  it("abre el panel de un grupo al hacer click y muestra sus ítems", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    fireEvent.click(screen.getByRole("button", { name: /formación/i }));

    expect(screen.getByRole("link", { name: "Sistema 100+" })).toHaveAttribute(
      "href",
      "/sistema-100"
    );
  });

  it("los ítems sin página construida no son navegables y están deshabilitados", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    fireEvent.click(screen.getByRole("button", { name: /formación/i }));

    const item = screen.getByText("Curso de Rentas");
    expect(item.tagName).not.toBe("A");
    expect(item).toHaveAttribute("aria-disabled", "true");
    expect(item).toHaveAttribute("title", "Próximamente");
  });

  it("cierra el panel abierto al hacer click afuera", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    fireEvent.click(screen.getByRole("button", { name: /formación/i }));
    expect(screen.getByRole("link", { name: "Clases" })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("link", { name: "Clases" })).not.toBeInTheDocument();
  });

  it("cierra el panel abierto con Escape", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    fireEvent.click(screen.getByRole("button", { name: /formación/i }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("link", { name: "Clases" })).not.toBeInTheDocument();
  });

  it("abre y cierra el overlay móvil", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(screen.getByRole("button", { name: "Cerrar menú" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar menú" }));
    expect(screen.queryByRole("button", { name: "Cerrar menú" })).not.toBeInTheDocument();
  });

  it("envía el formulario de cerrar sesión", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/estudiante/EstudianteShell.test.tsx`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement**

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { NAV_GROUPS, type NavItem } from "./nav-config";
import { cerrarSesion } from "@/lib/auth/actions";

export function EstudianteShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(null);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function alClickAfuera(evento: MouseEvent) {
      if (navRef.current && !navRef.current.contains(evento.target as Node)) {
        setGrupoAbierto(null);
      }
    }

    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setGrupoAbierto(null);
        setMenuMovilAbierto(false);
      }
    }

    document.addEventListener("mousedown", alClickAfuera);
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.removeEventListener("mousedown", alClickAfuera);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, []);

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/[0.08]">
        <div
          ref={navRef}
          className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5"
        >
          <Link
            href="/dashboard"
            className="font-display text-lg font-bold tracking-tight text-white"
          >
            COACH<span className="text-gold-400">PRO</span>
            <span className="text-gold-400"> •</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_GROUPS.map((grupo) => (
              <div key={grupo.label} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setGrupoAbierto((actual) => (actual === grupo.label ? null : grupo.label))
                  }
                  aria-expanded={grupoAbierto === grupo.label}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
                    grupo.items.some((item) => item.href === pathname)
                      ? "text-gold-300"
                      : "text-mist-400 hover:text-mist-300"
                  }`}
                >
                  {grupo.label}
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {grupoAbierto === grupo.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-white/[0.08] bg-ink-900 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                    >
                      {grupo.items.map((item) => (
                        <NavLink key={item.label} item={item} pathname={pathname} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <span className="max-w-[160px] truncate text-sm text-mist-400">{email}</span>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10"
              >
                Cerrar sesión
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={() => setMenuMovilAbierto(true)}
            aria-label="Abrir menú"
            className="text-mist-300 lg:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuMovilAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-grain fixed inset-0 z-30 overflow-y-auto bg-ink-950 lg:hidden"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-display text-lg font-bold tracking-tight text-white">
                COACH<span className="text-gold-400">PRO</span>
                <span className="text-gold-400"> •</span>
              </span>
              <button
                type="button"
                onClick={() => setMenuMovilAbierto(false)}
                aria-label="Cerrar menú"
                className="text-mist-300"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-1 px-6 pb-10">
              {NAV_GROUPS.map((grupo) => (
                <div key={grupo.label} className="border-b border-white/[0.08] py-2">
                  <button
                    type="button"
                    onClick={() =>
                      setGrupoAbierto((actual) => (actual === grupo.label ? null : grupo.label))
                    }
                    aria-expanded={grupoAbierto === grupo.label}
                    className="flex w-full items-center justify-between py-2 font-mono text-xs uppercase tracking-wider text-mist-400"
                  >
                    {grupo.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        grupoAbierto === grupo.label ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {grupoAbierto === grupo.label && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-1 overflow-hidden pb-2"
                      >
                        {grupo.items.map((item) => (
                          <NavLink key={item.label} item={item} pathname={pathname} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <form action={cerrarSesion} className="mt-6">
                <button
                  type="submit"
                  className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-mist-300"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  if (!item.href) {
    return (
      <span
        aria-disabled="true"
        title="Próximamente"
        className="block cursor-not-allowed rounded-lg px-3 py-2 text-sm text-mist-500 opacity-50"
      >
        {item.label}
      </span>
    );
  }

  const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={`block rounded-lg px-3 py-2 text-sm transition ${
        activo ? "bg-gold-500/10 text-gold-300" : "text-mist-300 hover:bg-white/[0.03]"
      }`}
    >
      {item.label}
    </Link>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/estudiante/EstudianteShell.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/estudiante/EstudianteShell.tsx components/estudiante/EstudianteShell.test.tsx
git commit -m "feat(nav): agrega EstudianteShell con mega-menú y overlay móvil"
```

---

## Task 10: `components/estudiante/CursoCard.tsx`

**Files:**
- Create: `components/estudiante/CursoCard.tsx`
- Create: `components/estudiante/CursoCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CursoCard } from "./CursoCard";

describe("CursoCard", () => {
  it("muestra el título, un link al detalle y el % de progreso", () => {
    render(
      <CursoCard
        curso={{
          id: "c1",
          titulo: "Negociación y Cierre",
          categoria: "sistema_100",
          totalLecciones: 4,
          leccionesCompletadas: 2,
          progresoPorcentaje: 50,
        }}
      />
    );

    expect(screen.getByRole("link", { name: /negociación y cierre/i })).toHaveAttribute(
      "href",
      "/cursos/c1"
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("marca 'Completado' cuando el progreso es 100%", () => {
    render(
      <CursoCard
        curso={{
          id: "c1",
          titulo: "Negociación y Cierre",
          categoria: "sistema_100",
          totalLecciones: 2,
          leccionesCompletadas: 2,
          progresoPorcentaje: 100,
        }}
      />
    );

    expect(screen.getByText("Completado")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/estudiante/CursoCard.test.tsx`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement**

```tsx
import Link from "next/link";
import type { CursoConProgreso } from "@/lib/db/cursos";

export function CursoCard({ curso }: { curso: CursoConProgreso }) {
  return (
    <Link
      href={`/cursos/${curso.id}`}
      className="block rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-gold-500/40"
    >
      <h3 className="font-display font-semibold text-white">{curso.titulo}</h3>
      <p className="mt-1 text-sm text-mist-500">
        {curso.totalLecciones} {curso.totalLecciones === 1 ? "lección" : "lecciones"}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gold-500"
            style={{ width: `${curso.progresoPorcentaje}%` }}
          />
        </div>
        <span className="font-mono text-xs text-mist-400">{curso.progresoPorcentaje}%</span>
      </div>

      {curso.progresoPorcentaje === 100 && (
        <p className="mt-2 text-xs font-medium text-emerald-400">Completado</p>
      )}
    </Link>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/estudiante/CursoCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/estudiante/CursoCard.tsx components/estudiante/CursoCard.test.tsx
git commit -m "feat(ui): agrega CursoCard reutilizable"
```

---

## Task 11: `app/(estudiante)/layout.tsx` usa `EstudianteShell`

**Files:**
- Modify: `app/(estudiante)/layout.tsx`
- Modify: `app/(estudiante)/layout.test.tsx`

- [ ] **Step 1: Write the failing test**

Replace `app/(estudiante)/layout.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const requireRolMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireRol: requireRolMock,
}));

vi.mock("@/components/estudiante/EstudianteShell", () => ({
  EstudianteShell: ({ email, children }: { email: string; children: React.ReactNode }) => (
    <div data-testid="shell" data-email={email}>
      {children}
    </div>
  ),
}));

describe("EstudianteLayout", () => {
  beforeEach(() => {
    requireRolMock.mockReset();
  });

  it("exige el rol estudiante y renderiza el shell con los hijos", async () => {
    requireRolMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "estudiante" });

    const EstudianteLayout = (await import("./layout")).default;
    const jsx = await EstudianteLayout({ children: <p>Contenido</p> });
    render(jsx);

    expect(requireRolMock).toHaveBeenCalledWith("estudiante");
    expect(screen.getByTestId("shell")).toHaveAttribute("data-email", "a@a.com");
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/(estudiante)/layout.test.tsx"`
Expected: FAIL — current layout renders a plain `<div>`, not the mocked shell (`data-testid="shell"` not found).

- [ ] **Step 3: Implement**

Replace `app/(estudiante)/layout.tsx`:

```tsx
import { requireRol } from "@/lib/auth/session";
import { EstudianteShell } from "@/components/estudiante/EstudianteShell";

export default async function EstudianteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await requireRol("estudiante");

  return <EstudianteShell email={sesion.email}>{children}</EstudianteShell>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "app/(estudiante)/layout.test.tsx"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/layout.tsx" "app/(estudiante)/layout.test.tsx"
git commit -m "feat(estudiante): usa EstudianteShell en el layout"
```

---

## Task 12: Página Bienvenida (`/dashboard`)

**Files:**
- Modify: `app/(estudiante)/dashboard/page.tsx`
- Create: `app/(estudiante)/dashboard/page.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getSesionUsuarioMock = vi.fn();
const getResumenEstudianteMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/dashboard", () => ({
  getResumenEstudiante: getResumenEstudianteMock,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    getResumenEstudianteMock.mockReset();
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "ana@example.com", rol: "estudiante" });
  });

  it("muestra las 4 estadísticas y la sección continuar viendo", async () => {
    getResumenEstudianteMock.mockResolvedValue({
      xpTotal: 80,
      insigniasCount: 1,
      cursosEnProgreso: 2,
      membresiaEstado: "activa",
      continuarViendo: {
        cursoId: "c2",
        leccionId: "l2",
        leccionTitulo: "Fuentes de leads en 2026",
        cursoTitulo: "Prospección y Generación de Leads",
      },
    });

    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();
    expect(screen.getByText("Fuentes de leads en 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /retomar/i })).toHaveAttribute(
      "href",
      "/cursos/c2/lecciones/l2"
    );
  });

  it("muestra el estado vacío para un estudiante sin actividad", async () => {
    getResumenEstudianteMock.mockResolvedValue({
      xpTotal: 0,
      insigniasCount: 0,
      cursosEnProgreso: 0,
      membresiaEstado: "sin_membresia",
      continuarViendo: null,
    });

    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(screen.queryByText(/continuar viendo/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /comenzar sistema 100\+/i })).toHaveAttribute(
      "href",
      "/sistema-100"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/(estudiante)/dashboard/page.test.tsx"`
Expected: FAIL — current page is just `<h1>Mi progreso</h1>`.

- [ ] **Step 3: Implement**

Replace `app/(estudiante)/dashboard/page.tsx`:

```tsx
import Link from "next/link";
import { getSesionUsuario } from "@/lib/auth/session";
import { getResumenEstudiante } from "@/lib/db/dashboard";

const ETIQUETAS_MEMBRESIA: Record<string, string> = {
  activa: "Activa",
  cancelada: "Cancelada",
  vencida: "Vencida",
  sin_membresia: "Sin membresía",
};

export default async function DashboardPage() {
  const sesion = await getSesionUsuario();
  const resumen = await getResumenEstudiante(sesion!.id);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Bienvenido de nuevo
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          El liderazgo se construye, no se improvisa.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard etiqueta="XP total" valor={resumen.xpTotal} />
        <StatCard etiqueta="Insignias" valor={resumen.insigniasCount} />
        <StatCard etiqueta="Cursos en progreso" valor={resumen.cursosEnProgreso} />
        <StatCard etiqueta="Membresía" valor={ETIQUETAS_MEMBRESIA[resumen.membresiaEstado]} />
      </dl>

      {resumen.continuarViendo && (
        <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-8">
          <p className="font-mono text-xs uppercase tracking-wider text-mist-500">
            Continuar viendo
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold text-white">
            {resumen.continuarViendo.leccionTitulo}
          </h2>
          <p className="mt-1 text-sm text-mist-400">{resumen.continuarViendo.cursoTitulo}</p>
          <Link
            href={`/cursos/${resumen.continuarViendo.cursoId}/lecciones/${resumen.continuarViendo.leccionId}`}
            className="mt-5 inline-flex h-[44px] items-center justify-center rounded-xl bg-gold-500 px-6 font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            Retomar
          </Link>
        </div>
      )}

      {!resumen.continuarViendo && (
        <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-8 text-center">
          <h2 className="font-display text-xl font-semibold text-white">
            Tu formación empieza hoy
          </h2>
          <p className="mt-2 text-mist-400">
            Da tu primer paso con los 5 pilares del Sistema 100+.
          </p>
          <Link
            href="/sistema-100"
            className="mt-5 inline-flex h-[44px] items-center justify-center rounded-xl bg-gold-500 px-6 font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            Comenzar Sistema 100+
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/sistema-100"
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-gold-500/40"
        >
          <h3 className="font-display font-semibold text-white">Sistema 100+</h3>
          <p className="mt-1 text-sm text-mist-400">Los 5 pilares del éxito</p>
        </Link>
        <Link
          href="/clases"
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-gold-500/40"
        >
          <h3 className="font-display font-semibold text-white">Clases</h3>
          <p className="mt-1 text-sm text-mist-400">Videoteca completa</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-5">
      <dt className="font-mono text-xs uppercase tracking-wider text-mist-500">{etiqueta}</dt>
      <dd className="mt-2 text-2xl font-semibold text-white">{valor}</dd>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "app/(estudiante)/dashboard/page.test.tsx"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/dashboard/page.tsx" "app/(estudiante)/dashboard/page.test.tsx"
git commit -m "feat(estudiante): construye la página Bienvenida con datos reales"
```

---

## Task 13: Página Sistema 100+ (`/sistema-100`)

**Files:**
- Create: `app/(estudiante)/sistema-100/page.tsx`
- Create: `app/(estudiante)/sistema-100/page.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getSesionUsuarioMock = vi.fn();
const getCursosPorCategoriaMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/cursos", () => ({
  getCursosPorCategoria: getCursosPorCategoriaMock,
}));

describe("Sistema100Page", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    getCursosPorCategoriaMock.mockReset();
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "ana@example.com", rol: "estudiante" });
  });

  it("consulta solo la categoría sistema_100 y muestra las tarjetas", async () => {
    getCursosPorCategoriaMock.mockResolvedValue([
      { id: "c1", titulo: "Mentalidad de Líder 100+", categoria: "sistema_100", totalLecciones: 3, leccionesCompletadas: 0, progresoPorcentaje: 0 },
    ]);

    const Sistema100Page = (await import("./page")).default;
    render(await Sistema100Page());

    expect(getCursosPorCategoriaMock).toHaveBeenCalledWith("u1", "sistema_100");
    expect(screen.getByText("Mentalidad de Líder 100+")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/(estudiante)/sistema-100/page.test.tsx"`
Expected: FAIL — page does not exist.

- [ ] **Step 3: Implement**

```tsx
import { getSesionUsuario } from "@/lib/auth/session";
import { getCursosPorCategoria } from "@/lib/db/cursos";
import { CursoCard } from "@/components/estudiante/CursoCard";

export default async function Sistema100Page() {
  const sesion = await getSesionUsuario();
  const cursos = await getCursosPorCategoria(sesion!.id, "sistema_100");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="font-mono text-xs uppercase tracking-wider text-mist-500">
          Los 5 pilares del Sistema 100+
        </span>
        <h1 className="mt-2 font-display text-[42px] font-bold leading-tight text-white">
          Sistema 100+
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <CursoCard key={curso.id} curso={curso} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "app/(estudiante)/sistema-100/page.test.tsx"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/sistema-100"
git commit -m "feat(estudiante): agrega página Sistema 100+"
```

---

## Task 14: Página Clases (`/clases`) con buscador y filtro

**Files:**
- Create: `app/(estudiante)/clases/page.tsx`
- Create: `app/(estudiante)/clases/ClasesCatalogo.tsx`
- Create: `app/(estudiante)/clases/page.test.tsx`
- Create: `app/(estudiante)/clases/ClasesCatalogo.test.tsx`

- [ ] **Step 1: Write the failing tests**

`app/(estudiante)/clases/ClasesCatalogo.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClasesCatalogo } from "./ClasesCatalogo";

const CURSOS = [
  { id: "c1", titulo: "Marketing Digital para Agentes", categoria: "clases" as const, totalLecciones: 2, leccionesCompletadas: 0, progresoPorcentaje: 0 },
  { id: "c2", titulo: "Mentalidad de Líder 100+", categoria: "sistema_100" as const, totalLecciones: 3, leccionesCompletadas: 3, progresoPorcentaje: 100 },
];

describe("ClasesCatalogo", () => {
  it("filtra por texto de búsqueda", () => {
    render(<ClasesCatalogo cursos={CURSOS} />);

    fireEvent.change(screen.getByLabelText("Buscar clases"), { target: { value: "marketing" } });

    expect(screen.getByText("Marketing Digital para Agentes")).toBeInTheDocument();
    expect(screen.queryByText("Mentalidad de Líder 100+")).not.toBeInTheDocument();
  });

  it("filtra por categoría con los chips", () => {
    render(<ClasesCatalogo cursos={CURSOS} />);

    fireEvent.click(screen.getByRole("button", { name: "Sistema 100+" }));

    expect(screen.getByText("Mentalidad de Líder 100+")).toBeInTheDocument();
    expect(screen.queryByText("Marketing Digital para Agentes")).not.toBeInTheDocument();
  });

  it("muestra estado vacío si no hay resultados", () => {
    render(<ClasesCatalogo cursos={CURSOS} />);

    fireEvent.change(screen.getByLabelText("Buscar clases"), { target: { value: "no existe" } });

    expect(screen.getByText("No encontramos clases con ese nombre.")).toBeInTheDocument();
  });
});
```

`app/(estudiante)/clases/page.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getSesionUsuarioMock = vi.fn();
const getCursosPorCategoriaMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/cursos", () => ({
  getCursosPorCategoria: getCursosPorCategoriaMock,
}));

describe("ClasesPage", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    getCursosPorCategoriaMock.mockReset();
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "ana@example.com", rol: "estudiante" });
  });

  it("consulta todas las categorías (sin filtro) y renderiza el catálogo", async () => {
    getCursosPorCategoriaMock.mockResolvedValue([
      { id: "c1", titulo: "Marketing Digital para Agentes", categoria: "clases", totalLecciones: 2, leccionesCompletadas: 0, progresoPorcentaje: 0 },
    ]);

    const ClasesPage = (await import("./page")).default;
    render(await ClasesPage());

    expect(getCursosPorCategoriaMock).toHaveBeenCalledWith("u1", undefined);
    expect(screen.getByText("Marketing Digital para Agentes")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/(estudiante)/clases"`
Expected: FAIL — files do not exist.

- [ ] **Step 3: Implement**

`app/(estudiante)/clases/ClasesCatalogo.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { CursoCard } from "@/components/estudiante/CursoCard";
import type { CategoriaCurso, CursoConProgreso } from "@/lib/db/cursos";

const FILTROS: { etiqueta: string; valor: CategoriaCurso | "todas" }[] = [
  { etiqueta: "Todas", valor: "todas" },
  { etiqueta: "Sistema 100+", valor: "sistema_100" },
  { etiqueta: "Clases", valor: "clases" },
];

export function ClasesCatalogo({ cursos }: { cursos: CursoConProgreso[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<CategoriaCurso | "todas">("todas");

  const cursosFiltrados = useMemo(() => {
    return cursos.filter((curso) => {
      const coincideTexto = curso.titulo.toLowerCase().includes(busqueda.trim().toLowerCase());
      const coincideCategoria = filtro === "todas" || curso.categoria === filtro;
      return coincideTexto && coincideCategoria;
    });
  }, [cursos, busqueda, filtro]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <label htmlFor="busqueda-clases" className="sr-only">
            Buscar clases
          </label>
          <input
            id="busqueda-clases"
            type="text"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar clases..."
            aria-label="Buscar clases"
            className="h-11 w-full rounded-xl border border-white/10 bg-ink-950 px-4 text-sm text-white placeholder:text-mist-500 outline-none focus:border-gold-500/60 sm:w-72"
          />
        </div>

        <div className="flex gap-2">
          {FILTROS.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => setFiltro(opcion.valor)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                filtro === opcion.valor
                  ? "border-gold-500/60 bg-gold-500/10 text-gold-300"
                  : "border-white/10 text-mist-400 hover:border-white/20"
              }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {cursosFiltrados.length === 0 ? (
        <p className="text-mist-400">No encontramos clases con ese nombre.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cursosFiltrados.map((curso) => (
            <CursoCard key={curso.id} curso={curso} />
          ))}
        </div>
      )}
    </div>
  );
}
```

`app/(estudiante)/clases/page.tsx`:

```tsx
import { getSesionUsuario } from "@/lib/auth/session";
import { getCursosPorCategoria } from "@/lib/db/cursos";
import { ClasesCatalogo } from "./ClasesCatalogo";

export default async function ClasesPage() {
  const sesion = await getSesionUsuario();
  const cursos = await getCursosPorCategoria(sesion!.id, undefined);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">Clases</h1>
        <p className="mt-2 text-lg text-mist-400">Videoteca completa de CoachPro.</p>
      </div>

      <ClasesCatalogo cursos={cursos} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "app/(estudiante)/clases"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/clases"
git commit -m "feat(estudiante): agrega página Clases con buscador y filtro"
```

---

## Task 15: Detalle de curso (`/cursos/[cursoId]`)

**Files:**
- Create: `app/(estudiante)/cursos/[cursoId]/page.tsx`
- Create: `app/(estudiante)/cursos/[cursoId]/page.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getSesionUsuarioMock = vi.fn();
const getCursoDetalleMock = vi.fn();
const notFoundMock = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/cursos", () => ({
  getCursoDetalle: getCursoDetalleMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

describe("CursoDetallePage", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    getCursoDetalleMock.mockReset();
    notFoundMock.mockClear();
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "ana@example.com", rol: "estudiante" });
  });

  it("muestra el título del curso y la lista de lecciones con su estado", async () => {
    getCursoDetalleMock.mockResolvedValue({
      id: "c1",
      titulo: "Negociación y Cierre",
      categoria: "sistema_100",
      lecciones: [
        { id: "l1", titulo: "Psicología de la negociación", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 1, segundoActual: 0, completado: true },
        { id: "l2", titulo: "Técnicas de cierre", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 2, segundoActual: 30, completado: false },
      ],
    });

    const CursoDetallePage = (await import("./page")).default;
    render(await CursoDetallePage({ params: Promise.resolve({ cursoId: "c1" }) }));

    expect(screen.getByText("Negociación y Cierre")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /técnicas de cierre/i })).toHaveAttribute(
      "href",
      "/cursos/c1/lecciones/l2"
    );
  });

  it("llama a notFound si el curso no existe", async () => {
    getCursoDetalleMock.mockResolvedValue(null);

    const CursoDetallePage = (await import("./page")).default;

    await expect(
      CursoDetallePage({ params: Promise.resolve({ cursoId: "no-existe" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/(estudiante)/cursos/[cursoId]/page.test.tsx"`
Expected: FAIL — page does not exist.

- [ ] **Step 3: Implement**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Circle } from "lucide-react";
import { getSesionUsuario } from "@/lib/auth/session";
import { getCursoDetalle } from "@/lib/db/cursos";

export default async function CursoDetallePage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const { cursoId } = await params;
  const sesion = await getSesionUsuario();
  const curso = await getCursoDetalle(cursoId, sesion!.id);

  if (!curso) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-[42px] font-bold leading-tight text-white">
        {curso.titulo}
      </h1>

      <ol className="flex flex-col gap-2">
        {curso.lecciones.map((leccion, indice) => (
          <li key={leccion.id}>
            <Link
              href={`/cursos/${curso.id}/lecciones/${leccion.id}`}
              className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-gold-500/40"
            >
              {leccion.completado ? (
                <Check className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-mist-500" aria-hidden="true" />
              )}
              <span className="font-mono text-xs text-mist-500">{indice + 1}</span>
              <span className="text-white">{leccion.titulo}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "app/(estudiante)/cursos/[cursoId]/page.test.tsx"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/cursos/[cursoId]/page.tsx" "app/(estudiante)/cursos/[cursoId]/page.test.tsx"
git commit -m "feat(estudiante): agrega página de detalle de curso"
```

---

## Task 16: Server action `marcarProgresoAction`

**Files:**
- Create: `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/actions.ts`
- Create: `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/actions.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const getSesionUsuarioMock = vi.fn();
const marcarProgresoMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/lecciones", () => ({
  marcarProgreso: marcarProgresoMock,
}));

describe("marcarProgresoAction", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    marcarProgresoMock.mockReset();
  });

  it("guarda el progreso del usuario autenticado", async () => {
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "estudiante" });
    marcarProgresoMock.mockResolvedValue(undefined);

    const { marcarProgresoAction } = await import("./actions");
    const resultado = await marcarProgresoAction("l2", { completado: true });

    expect(marcarProgresoMock).toHaveBeenCalledWith("u1", "l2", { completado: true });
    expect(resultado).toEqual({ error: null });
  });

  it("retorna error si no hay sesión", async () => {
    getSesionUsuarioMock.mockResolvedValue(null);

    const { marcarProgresoAction } = await import("./actions");
    const resultado = await marcarProgresoAction("l2", { completado: true });

    expect(marcarProgresoMock).not.toHaveBeenCalled();
    expect(resultado).toEqual({ error: "No autenticado." });
  });

  it("retorna el mensaje de error si marcarProgreso falla", async () => {
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "estudiante" });
    marcarProgresoMock.mockRejectedValue(new Error("No se pudo guardar el progreso: timeout"));

    const { marcarProgresoAction } = await import("./actions");
    const resultado = await marcarProgresoAction("l2", { completado: true });

    expect(resultado).toEqual({ error: "No se pudo guardar el progreso: timeout" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/actions.test.ts"`
Expected: FAIL — file does not exist.

- [ ] **Step 3: Implement**

```ts
"use server";

import { getSesionUsuario } from "@/lib/auth/session";
import { marcarProgreso } from "@/lib/db/lecciones";

export async function marcarProgresoAction(
  leccionId: string,
  cambios: { segundoActual?: number; completado?: boolean }
): Promise<{ error: string | null }> {
  const sesion = await getSesionUsuario();

  if (!sesion) {
    return { error: "No autenticado." };
  }

  try {
    await marcarProgreso(sesion.id, leccionId, cambios);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido." };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/actions.test.ts"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/actions.ts" "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/actions.test.ts"
git commit -m "feat(estudiante): agrega server action marcarProgresoAction"
```

---

## Task 17: Instalar `@mux/mux-player-react` y variables de entorno

**Files:**
- Modify: `package.json`
- Modify: `.env.example`

- [ ] **Step 1: Install the dependency**

Run: `npm install @mux/mux-player-react`
Expected: `package.json` and `package-lock.json` updated, no errors.

- [ ] **Step 2: Add Mux env vars to `.env.example`**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: instala @mux/mux-player-react y agrega env vars de Mux"
```

---

## Task 18: `LeccionPlayer` (client component con fallback) + página del reproductor

**Files:**
- Create: `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/LeccionPlayer.tsx`
- Create: `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/LeccionPlayer.test.tsx`
- Create: `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.tsx`
- Create: `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.test.tsx`

- [ ] **Step 1: Write the failing tests**

`LeccionPlayer.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LeccionPlayer } from "./LeccionPlayer";

const marcarProgresoActionMock = vi.fn();

vi.mock("./actions", () => ({
  marcarProgresoAction: (...args: unknown[]) => marcarProgresoActionMock(...args),
}));

vi.mock("@mux/mux-player-react", () => ({
  default: () => <div data-testid="mux-player" />,
}));

describe("LeccionPlayer", () => {
  beforeEach(() => {
    marcarProgresoActionMock.mockReset();
  });

  it("muestra el reproductor de Mux cuando hay muxAssetId", () => {
    render(
      <LeccionPlayer leccionId="l1" muxAssetId="mux-123" completado={false} />
    );

    expect(screen.getByTestId("mux-player")).toBeInTheDocument();
    expect(screen.queryByText("Video no disponible todavía")).not.toBeInTheDocument();
  });

  it("muestra el estado de fallback y permite marcar como completada sin muxAssetId", async () => {
    marcarProgresoActionMock.mockResolvedValue({ error: null });

    render(<LeccionPlayer leccionId="l1" muxAssetId={null} completado={false} />);

    expect(screen.getByText("Video no disponible todavía")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /marcar como completada/i }));

    await waitFor(() =>
      expect(marcarProgresoActionMock).toHaveBeenCalledWith("l1", { completado: true })
    );
  });

  it("muestra 'Completada' si ya estaba completada", () => {
    render(<LeccionPlayer leccionId="l1" muxAssetId={null} completado={true} />);

    expect(screen.getByText("Completada")).toBeInTheDocument();
  });
});
```

`page.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getSesionUsuarioMock = vi.fn();
const getLeccionDetalleMock = vi.fn();
const notFoundMock = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/lecciones", () => ({
  getLeccionDetalle: getLeccionDetalleMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("./LeccionPlayer", () => ({
  LeccionPlayer: ({ leccionId }: { leccionId: string }) => (
    <div data-testid="player">{leccionId}</div>
  ),
}));

describe("LeccionPage", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    getLeccionDetalleMock.mockReset();
    notFoundMock.mockClear();
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "estudiante" });
  });

  it("muestra el título y la navegación anterior/siguiente", async () => {
    getLeccionDetalleMock.mockResolvedValue({
      id: "l2",
      titulo: "Técnicas de cierre",
      cursoId: "c1",
      cursoTitulo: "Negociación y Cierre",
      tipoContenido: "video",
      muxAssetId: null,
      storageKey: null,
      segundoActual: 0,
      completado: false,
      leccionAnteriorId: "l1",
      leccionSiguienteId: "l3",
    });

    const LeccionPage = (await import("./page")).default;
    render(
      await LeccionPage({ params: Promise.resolve({ cursoId: "c1", leccionId: "l2" }) })
    );

    expect(screen.getByText("Técnicas de cierre")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /lección anterior/i })).toHaveAttribute(
      "href",
      "/cursos/c1/lecciones/l1"
    );
    expect(screen.getByRole("link", { name: /siguiente lección/i })).toHaveAttribute(
      "href",
      "/cursos/c1/lecciones/l3"
    );
  });

  it("no renderiza links de navegación en los extremos", async () => {
    getLeccionDetalleMock.mockResolvedValue({
      id: "l1",
      titulo: "Psicología de la negociación",
      cursoId: "c1",
      cursoTitulo: "Negociación y Cierre",
      tipoContenido: "video",
      muxAssetId: null,
      storageKey: null,
      segundoActual: 0,
      completado: false,
      leccionAnteriorId: null,
      leccionSiguienteId: "l2",
    });

    const LeccionPage = (await import("./page")).default;
    render(
      await LeccionPage({ params: Promise.resolve({ cursoId: "c1", leccionId: "l1" }) })
    );

    expect(screen.queryByRole("link", { name: /lección anterior/i })).not.toBeInTheDocument();
  });

  it("llama a notFound si la lección no existe", async () => {
    getLeccionDetalleMock.mockResolvedValue(null);

    const LeccionPage = (await import("./page")).default;

    await expect(
      LeccionPage({ params: Promise.resolve({ cursoId: "c1", leccionId: "no-existe" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]"`
Expected: FAIL — files do not exist.

- [ ] **Step 3: Implement**

`LeccionPlayer.tsx`:

```tsx
"use client";

import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { Loader2 } from "lucide-react";
import { marcarProgresoAction } from "./actions";

export function LeccionPlayer({
  leccionId,
  muxAssetId,
  completado,
}: {
  leccionId: string;
  muxAssetId: string | null;
  completado: boolean;
}) {
  const [completadaLocal, setCompletadaLocal] = useState(completado);
  const [guardando, setGuardando] = useState(false);

  async function marcarCompletada() {
    setGuardando(true);
    const resultado = await marcarProgresoAction(leccionId, { completado: true });
    setGuardando(false);

    if (!resultado.error) {
      setCompletadaLocal(true);
    }
  }

  if (muxAssetId) {
    return (
      <div className="overflow-hidden rounded-xl border border-white/[0.08]">
        <MuxPlayer
          playbackId={muxAssetId}
          onTimeUpdate={(evento) => {
            const segundo = Math.floor((evento.target as HTMLMediaElement).currentTime);
            void marcarProgresoAction(leccionId, { segundoActual: segundo });
          }}
          onEnded={() => {
            void marcarProgresoAction(leccionId, { completado: true });
            setCompletadaLocal(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-12 text-center">
      <p className="text-mist-400">Video no disponible todavía</p>

      {completadaLocal ? (
        <p className="text-sm font-medium text-emerald-400">Completada</p>
      ) : (
        <button
          type="button"
          onClick={marcarCompletada}
          disabled={guardando}
          className="flex h-[44px] items-center gap-2 rounded-xl bg-gold-500 px-6 font-semibold text-ink-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {guardando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Marcar como completada
        </button>
      )}
    </div>
  );
}
```

`page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSesionUsuario } from "@/lib/auth/session";
import { getLeccionDetalle } from "@/lib/db/lecciones";
import { LeccionPlayer } from "./LeccionPlayer";

export default async function LeccionPage({
  params,
}: {
  params: Promise<{ cursoId: string; leccionId: string }>;
}) {
  const { cursoId, leccionId } = await params;
  const sesion = await getSesionUsuario();
  const leccion = await getLeccionDetalle(cursoId, leccionId, sesion!.id);

  if (!leccion) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/cursos/${cursoId}`} className="text-sm text-gold-300 hover:text-gold-200">
          {leccion.cursoTitulo}
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">{leccion.titulo}</h1>
      </div>

      <LeccionPlayer
        leccionId={leccion.id}
        muxAssetId={leccion.muxAssetId}
        completado={leccion.completado}
      />

      <div className="flex items-center justify-between">
        {leccion.leccionAnteriorId ? (
          <Link
            href={`/cursos/${cursoId}/lecciones/${leccion.leccionAnteriorId}`}
            className="flex items-center gap-1 text-sm text-mist-300 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Lección anterior
          </Link>
        ) : (
          <span />
        )}

        {leccion.leccionSiguienteId && (
          <Link
            href={`/cursos/${cursoId}/lecciones/${leccion.leccionSiguienteId}`}
            className="flex items-center gap-1 text-sm text-mist-300 hover:text-white"
          >
            Siguiente lección
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]"
git commit -m "feat(estudiante): agrega reproductor de lección con fallback sin Mux"
```

---

## Task 19: Script de seed de contenido

**Files:**
- Create: `scripts/seed-contenido.mjs`
- Modify: `package.json` (agregar script `seed:contenido`)

- [ ] **Step 1: Implement**

```js
import { createClient } from "@supabase/supabase-js";

const PILARES_SISTEMA_100 = [
  {
    titulo: "Mentalidad de Líder 100+",
    lecciones: ["Bienvenida al Sistema 100+", "Los 4 hábitos del top producer", "Plan de acción semanal"],
  },
  {
    titulo: "Prospección y Generación de Leads",
    lecciones: ["Fuentes de leads en 2026", "Guion de llamada en frío", "Seguimiento efectivo", "Automatiza tu prospección"],
  },
  {
    titulo: "Negociación y Cierre",
    lecciones: ["Psicología de la negociación", "Manejo de objeciones de precio", "Técnicas de cierre"],
  },
  {
    titulo: "Marca Personal del Agente",
    lecciones: ["Construye tu marca en redes", "Contenido que atrae clientes", "Testimonios y prueba social"],
  },
  {
    titulo: "Escalar tu Equipo",
    lecciones: ["Cuándo contratar tu primer agente", "Sistemas y procesos de equipo", "Cultura y retención de talento"],
  },
];

const CLASES = [
  {
    titulo: "Fundamentos de Bienes Raíces Comerciales",
    lecciones: ["Tipos de propiedad comercial", "Cap rate y valuación", "Tu primer deal comercial"],
  },
  {
    titulo: "Marketing Digital para Agentes",
    lecciones: ["Meta Ads para agentes", "Email marketing inmobiliario"],
  },
  {
    titulo: "Manejo de Objeciones en Preconstrucción",
    lecciones: ["Objeciones frecuentes", "Cierre en preconstrucción", "Casos reales"],
  },
  {
    titulo: "Finanzas Personales para Agentes Inmobiliarios",
    lecciones: ["Presupuesto con ingreso variable", "Impuestos del agente", "Ahorro e inversión"],
  },
  {
    titulo: "Servicio al Cliente de Alto Nivel",
    lecciones: ["La experiencia del cliente premium", "Postventa que genera referidos"],
  },
  {
    titulo: "Redes Sociales para Vender Más",
    lecciones: ["Instagram para agentes", "TikTok inmobiliario", "Reels que convierten", "Calendario de contenido"],
  },
];

export async function seedContenido({ supabaseUrl, serviceRoleKey }) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await seedGrupo(supabase, PILARES_SISTEMA_100, "sistema_100");
  await seedGrupo(supabase, CLASES, "clases");
}

async function seedGrupo(supabase, grupo, categoria) {
  for (const curso of grupo) {
    const { data: existente, error: buscarError } = await supabase
      .from("cursos")
      .select("id")
      .eq("titulo", curso.titulo)
      .maybeSingle();

    if (buscarError) {
      throw new Error(`No se pudo verificar el curso "${curso.titulo}": ${buscarError.message}`);
    }

    if (existente) {
      console.log(`Ya existe: ${curso.titulo}`);
      continue;
    }

    const { data: nuevoCurso, error: cursoError } = await supabase
      .from("cursos")
      .insert({ titulo: curso.titulo, categoria, publicado: true, precio: 0 })
      .select("id")
      .single();

    if (cursoError) {
      throw new Error(`No se pudo crear el curso "${curso.titulo}": ${cursoError.message}`);
    }

    const lecciones = curso.lecciones.map((tituloLeccion, indice) => ({
      curso_id: nuevoCurso.id,
      titulo: tituloLeccion,
      tipo_contenido: "video",
      orden: indice + 1,
    }));

    const { error: leccionesError } = await supabase.from("lecciones").insert(lecciones);

    if (leccionesError) {
      throw new Error(`No se pudieron crear las lecciones de "${curso.titulo}": ${leccionesError.message}`);
    }

    console.log(`Creado: ${curso.titulo} (${lecciones.length} lecciones)`);
  }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Faltan variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  await seedContenido({ supabaseUrl, serviceRoleKey });
  console.log("Seed de contenido completo.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

Add to `package.json` `scripts`:

```json
"seed:contenido": "node scripts/seed-contenido.mjs"
```

- [ ] **Step 2: Run it against the dev Supabase project**

Run: `npm run seed:contenido`
Expected: console logs 5 `Creado: ...` lines for Sistema 100+ courses and 6 for Clases (or `Ya existe: ...` on a re-run).

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-contenido.mjs package.json
git commit -m "feat(seed): agrega script de seed de contenido para Sistema 100+ y Clases"
```

---

## Task 20: Verificación final

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all test files pass, no failures.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: no TypeScript errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, log in as a seeded student, and click through: `/dashboard` → `/sistema-100` → a course card → a lesson → "Marcar como completada" → back to `/dashboard` to confirm the stat cards updated. Also open the mega-menu and confirm disabled items show "Próximamente" and don't navigate, and resize to mobile width to confirm the hamburger overlay works.

---

## Self-Review Notes

- **Spec coverage:** every section of the spec (1–10) maps to a task above — nav shell (Task 9), DB migration (Task 1), seed (Task 19), Bienvenida (Task 12), Sistema 100+ (Task 13), Clases (Task 14), detalle de curso (Task 15), reproductor (Tasks 16–18), middleware fix (Task 7, a gap found while planning), testing (embedded per task).
- **Type consistency:** `CursoConProgreso`, `CursoDetalle`/`LeccionConProgreso`, `LeccionDetalle`, and `ResumenEstudiante` are defined once (Tasks 2, 3, 4, 6) and reused with identical field names in every consuming component/page (Tasks 9, 10, 12–16, 18) — no renamed duplicates.
- **No placeholders:** every step above contains complete, runnable code; no `TODO`/"similar to Task N" shortcuts.
