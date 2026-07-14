# Control de acceso real a cursos comprados — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el gate actual de `cursos.publicado` por una verificación real de acceso (`precio === 0` OR `inscripciones` OR `membresia` activa) antes de mostrar el contenido de una lección, manteniendo la portada del curso visible con las lecciones bloqueadas mostradas como tales.

**Architecture:** Una única función `tieneAccesoCurso()` en `lib/db/cursos.ts` concentra la regla de negocio; se reutiliza desde `lib/db/lecciones.ts`. Ambas funciones de detalle (`getCursoDetalle`, `getLeccionDetalle`) agregan un campo `accesoCurso: boolean` a su tipo de retorno existente, sin cambiar cuándo retornan `null`. Las páginas server component leen ese campo para decidir UI (candado) o navegación (`redirect`).

**Tech Stack:** Next.js 15 (App Router), Supabase (`@supabase/ssr`), Vitest + Testing Library, lucide-react.

---

## Referencia: spec

Este plan implementa `docs/superpowers/specs/2026-07-14-acceso-cursos-design.md`. Léelo primero si algo aquí no tiene sentido — este plan no repite las decisiones de diseño ya justificadas allí, solo la ejecución.

---

### Task 1: `tieneAccesoCurso()` en `lib/db/cursos.ts` (TDD)

**Files:**
- Modify: `lib/db/cursos.ts`
- Modify: `lib/db/cursos.test.ts`

- [ ] **Step 1: Agregar el describe block de tests (falla porque la función no existe)**

Al final de `lib/db/cursos.test.ts` (después del último `});` que cierra `describe("getCursoDetalle", ...)`), agrega:

```ts
describe("tieneAccesoCurso", () => {
  const inscripcionMaybeSingleMock = vi.fn();
  const inscripcionEqCursoMock = vi.fn(() => ({ maybeSingle: inscripcionMaybeSingleMock }));
  const inscripcionEqUsuarioMock = vi.fn(() => ({ eq: inscripcionEqCursoMock }));
  const inscripcionSelectMock = vi.fn(() => ({ eq: inscripcionEqUsuarioMock }));

  const membresiaMaybeSingleMock = vi.fn();
  const membresiaEqMock = vi.fn(() => ({ maybeSingle: membresiaMaybeSingleMock }));
  const membresiaSelectMock = vi.fn(() => ({ eq: membresiaEqMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "inscripciones") return { select: inscripcionSelectMock };
    if (tabla === "membresia") return { select: membresiaSelectMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    inscripcionSelectMock.mockClear();
    inscripcionEqUsuarioMock.mockClear();
    inscripcionEqCursoMock.mockClear();
    inscripcionMaybeSingleMock.mockClear();
    membresiaSelectMock.mockClear();
    membresiaEqMock.mockClear();
    membresiaMaybeSingleMock.mockClear();

    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("da acceso a un curso gratuito sin consultar Supabase", async () => {
    const { tieneAccesoCurso } = await import("./cursos");
    const acceso = await tieneAccesoCurso("c1", "u1", 0);

    expect(acceso).toBe(true);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("da acceso si existe una inscripción individual", async () => {
    inscripcionMaybeSingleMock.mockResolvedValue({ data: { id: "i1" }, error: null });

    const { tieneAccesoCurso } = await import("./cursos");
    const acceso = await tieneAccesoCurso("c1", "u1", 49.99);

    expect(fromMock).toHaveBeenCalledWith("inscripciones");
    expect(inscripcionEqUsuarioMock).toHaveBeenCalledWith("usuario_id", "u1");
    expect(inscripcionEqCursoMock).toHaveBeenCalledWith("curso_id", "c1");
    expect(acceso).toBe(true);
  });

  it("da acceso si la membresía está activa sin fecha de corte", async () => {
    inscripcionMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    membresiaMaybeSingleMock.mockResolvedValue({
      data: { estado: "activa", periodo_fin: null },
      error: null,
    });

    const { tieneAccesoCurso } = await import("./cursos");
    const acceso = await tieneAccesoCurso("c1", "u1", 49.99);

    expect(fromMock).toHaveBeenCalledWith("membresia");
    expect(membresiaEqMock).toHaveBeenCalledWith("usuario_id", "u1");
    expect(acceso).toBe(true);
  });

  it("da acceso si la membresía está activa y el período aún no vence", async () => {
    inscripcionMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    membresiaMaybeSingleMock.mockResolvedValue({
      data: { estado: "activa", periodo_fin: "2099-01-01T00:00:00.000Z" },
      error: null,
    });

    const { tieneAccesoCurso } = await import("./cursos");
    const acceso = await tieneAccesoCurso("c1", "u1", 49.99);

    expect(acceso).toBe(true);
  });

  it("niega acceso si la membresía está activa pero el período ya venció", async () => {
    inscripcionMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    membresiaMaybeSingleMock.mockResolvedValue({
      data: { estado: "activa", periodo_fin: "2000-01-01T00:00:00.000Z" },
      error: null,
    });

    const { tieneAccesoCurso } = await import("./cursos");
    const acceso = await tieneAccesoCurso("c1", "u1", 49.99);

    expect(acceso).toBe(false);
  });

  it("niega acceso si la membresía está cancelada", async () => {
    inscripcionMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    membresiaMaybeSingleMock.mockResolvedValue({
      data: { estado: "cancelada", periodo_fin: null },
      error: null,
    });

    const { tieneAccesoCurso } = await import("./cursos");
    const acceso = await tieneAccesoCurso("c1", "u1", 49.99);

    expect(acceso).toBe(false);
  });

  it("niega acceso si no hay inscripción ni membresía", async () => {
    inscripcionMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    membresiaMaybeSingleMock.mockResolvedValue({ data: null, error: null });

    const { tieneAccesoCurso } = await import("./cursos");
    const acceso = await tieneAccesoCurso("c1", "u1", 49.99);

    expect(acceso).toBe(false);
  });

  it("lanza un error legible si falla la consulta de inscripciones", async () => {
    inscripcionMaybeSingleMock.mockResolvedValue({ data: null, error: { message: "timeout" } });

    const { tieneAccesoCurso } = await import("./cursos");

    await expect(tieneAccesoCurso("c1", "u1", 49.99)).rejects.toThrow(
      "No se pudo verificar el acceso al curso: timeout"
    );
  });

  it("lanza un error legible si falla la consulta de membresía", async () => {
    inscripcionMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    membresiaMaybeSingleMock.mockResolvedValue({ data: null, error: { message: "timeout" } });

    const { tieneAccesoCurso } = await import("./cursos");

    await expect(tieneAccesoCurso("c1", "u1", 49.99)).rejects.toThrow(
      "No se pudo verificar el acceso al curso: timeout"
    );
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run lib/db/cursos.test.ts -t tieneAccesoCurso`
Expected: FAIL — `tieneAccesoCurso is not a function` / `Cannot read properties of undefined`

- [ ] **Step 3: Implementar `tieneAccesoCurso` en `lib/db/cursos.ts`**

Al final de `lib/db/cursos.ts` (después del cierre de `getCursoDetalle`), agrega:

```ts
export async function tieneAccesoCurso(
  cursoId: string,
  usuarioId: string,
  precio: number
): Promise<boolean> {
  if (precio === 0) return true;

  const supabase = await createClient();

  const { data: inscripcion, error: inscripcionError } = await supabase
    .from("inscripciones")
    .select("id")
    .eq("usuario_id", usuarioId)
    .eq("curso_id", cursoId)
    .maybeSingle();

  if (inscripcionError) {
    throw new Error(`No se pudo verificar el acceso al curso: ${inscripcionError.message}`);
  }

  if (inscripcion) return true;

  const { data: membresia, error: membresiaError } = await supabase
    .from("membresia")
    .select("estado, periodo_fin")
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (membresiaError) {
    throw new Error(`No se pudo verificar el acceso al curso: ${membresiaError.message}`);
  }

  if (!membresia || membresia.estado !== "activa") return false;

  return membresia.periodo_fin === null || new Date(membresia.periodo_fin) > new Date();
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run lib/db/cursos.test.ts -t tieneAccesoCurso`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/db/cursos.ts lib/db/cursos.test.ts
git commit -m "feat(cursos): agrega tieneAccesoCurso (inscripciones + membresia)"
```

---

### Task 2: Wire `accesoCurso` en `getCursoDetalle` (TDD)

**Files:**
- Modify: `lib/db/cursos.ts`
- Modify: `lib/db/cursos.test.ts`

- [ ] **Step 1: Actualizar el describe block de `getCursoDetalle` (falla porque el campo no existe todavía)**

Reemplaza el describe block completo `describe("getCursoDetalle", ...)` en `lib/db/cursos.test.ts` (líneas 258–395 antes de este plan) por:

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

  const inscripcionMaybeSingleMock = vi.fn();
  const inscripcionEqCursoMock = vi.fn(() => ({ maybeSingle: inscripcionMaybeSingleMock }));
  const inscripcionEqUsuarioMock = vi.fn(() => ({ eq: inscripcionEqCursoMock }));
  const inscripcionSelectMock = vi.fn(() => ({ eq: inscripcionEqUsuarioMock }));

  const membresiaMaybeSingleMock = vi.fn();
  const membresiaEqMock = vi.fn(() => ({ maybeSingle: membresiaMaybeSingleMock }));
  const membresiaSelectMock = vi.fn(() => ({ eq: membresiaEqMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "cursos") return { select: cursoSelectMock };
    if (tabla === "lecciones") return { select: leccionesSelectMock };
    if (tabla === "progreso") return { select: progresoSelectMock };
    if (tabla === "inscripciones") return { select: inscripcionSelectMock };
    if (tabla === "membresia") return { select: membresiaSelectMock };
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
    inscripcionSelectMock.mockClear();
    inscripcionEqUsuarioMock.mockClear();
    inscripcionEqCursoMock.mockClear();
    inscripcionMaybeSingleMock.mockClear();
    membresiaSelectMock.mockClear();
    membresiaEqMock.mockClear();
    membresiaMaybeSingleMock.mockClear();

    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));

    inscripcionMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    membresiaMaybeSingleMock.mockResolvedValue({ data: null, error: null });
  });

  it("retorna el curso con sus lecciones, progreso del usuario y accesoCurso", async () => {
    cursoSingleMock.mockResolvedValue({
      data: {
        id: "c1",
        titulo: "Negociación y Cierre",
        categoria: "sistema_100",
        publicado: true,
        precio: 0,
      },
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
      accesoCurso: true,
      lecciones: [
        { id: "l1", titulo: "Psicología de la negociación", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 1, segundoActual: 120, completado: true },
        { id: "l2", titulo: "Técnicas de cierre", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 2, segundoActual: 0, completado: false },
      ],
    });
  });

  it("marca accesoCurso en false para un curso pago sin inscripción ni membresía", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Curso Pago", categoria: "clases", publicado: true, precio: 49.99 },
      error: null,
    });
    leccionesOrderMock.mockResolvedValue({ data: [], error: null });

    const { getCursoDetalle } = await import("./cursos");
    const resultado = await getCursoDetalle("c1", "u1");

    expect(resultado?.accesoCurso).toBe(false);
  });

  it("marca accesoCurso en true para un curso pago con inscripción", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Curso Pago", categoria: "clases", publicado: true, precio: 49.99 },
      error: null,
    });
    leccionesOrderMock.mockResolvedValue({ data: [], error: null });
    inscripcionMaybeSingleMock.mockResolvedValue({ data: { id: "i1" }, error: null });

    const { getCursoDetalle } = await import("./cursos");
    const resultado = await getCursoDetalle("c1", "u1");

    expect(resultado?.accesoCurso).toBe(true);
  });

  it("retorna null si el curso no existe o no está publicado", async () => {
    cursoSingleMock.mockResolvedValue({ data: null, error: { message: "no encontrado" } });

    const { getCursoDetalle } = await import("./cursos");
    const resultado = await getCursoDetalle("no-existe", "u1");

    expect(resultado).toBeNull();
  });

  it("retorna null si el curso existe pero publicado es false", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Negociación y Cierre", categoria: "sistema_100", publicado: false, precio: 0 },
      error: null,
    });

    const { getCursoDetalle } = await import("./cursos");
    const resultado = await getCursoDetalle("c1", "u1");

    expect(resultado).toBeNull();
  });

  it("retorna lecciones vacías sin consultar progreso si el curso no tiene lecciones", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Curso Vacío", categoria: "clases", publicado: true, precio: 0 },
      error: null,
    });
    leccionesOrderMock.mockResolvedValue({ data: [], error: null });

    const { getCursoDetalle } = await import("./cursos");
    const resultado = await getCursoDetalle("c1", "u1");

    expect(resultado?.lecciones).toEqual([]);
    expect(progresoSelectMock).not.toHaveBeenCalled();
  });

  it("lanza un error legible si falla la consulta de lecciones", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Curso A", categoria: "clases", publicado: true, precio: 0 },
      error: null,
    });
    leccionesOrderMock.mockResolvedValue({ data: null, error: { message: "fallo lecciones" } });

    const { getCursoDetalle } = await import("./cursos");

    await expect(getCursoDetalle("c1", "u1")).rejects.toThrow(
      "No se pudieron cargar las lecciones: fallo lecciones"
    );
  });

  it("lanza un error legible si falla la consulta de progreso", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Curso A", categoria: "clases", publicado: true, precio: 0 },
      error: null,
    });
    leccionesOrderMock.mockResolvedValue({
      data: [
        { id: "l1", titulo: "Lección 1", tipo_contenido: "video", mux_asset_id: null, storage_key: null, orden: 1 },
      ],
      error: null,
    });
    progresoInMock.mockResolvedValue({ data: null, error: { message: "timeout" } });

    const { getCursoDetalle } = await import("./cursos");

    await expect(getCursoDetalle("c1", "u1")).rejects.toThrow(
      "No se pudo cargar el progreso: timeout"
    );
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run lib/db/cursos.test.ts -t getCursoDetalle`
Expected: FAIL — `resultado.accesoCurso` es `undefined`, no coincide con `toEqual`

- [ ] **Step 3: Implementar el wiring en `getCursoDetalle`**

En `lib/db/cursos.ts`, reemplaza el tipo `export type CursoDetalle` y la función `getCursoDetalle` completa (ambos consecutivos en el archivo) por:

```ts
export type CursoDetalle = {
  id: string;
  titulo: string;
  categoria: CategoriaCurso;
  accesoCurso: boolean;
  lecciones: LeccionConProgreso[];
};

export async function getCursoDetalle(
  cursoId: string,
  usuarioId: string
): Promise<CursoDetalle | null> {
  const supabase = await createClient();

  const { data: curso, error: cursoError } = await supabase
    .from("cursos")
    .select("id, titulo, categoria, publicado, precio")
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

  const { data: progresos, error: progresoError } = leccionIds.length
    ? await supabase
        .from("progreso")
        .select("leccion_id, segundo_actual, completado")
        .eq("usuario_id", usuarioId)
        .in("leccion_id", leccionIds)
    : { data: [], error: null };

  if (progresoError) {
    throw new Error(`No se pudo cargar el progreso: ${progresoError.message}`);
  }

  const accesoCurso = await tieneAccesoCurso(curso.id, usuarioId, curso.precio);

  const progresoPorLeccion = new Map(
    (progresos ?? []).map((progreso) => [progreso.leccion_id, progreso])
  );

  return {
    id: curso.id,
    titulo: curso.titulo,
    categoria: curso.categoria as CategoriaCurso,
    accesoCurso,
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

Nota: esta función queda **antes** de `tieneAccesoCurso` en el archivo (que se agregó al final en Task 1) — TypeScript no tiene problema con el orden de declaración de funciones (`function`/`export async function` son "hoisted"), no hace falta reordenar nada.

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run lib/db/cursos.test.ts`
Expected: PASS (todos los tests del archivo, incluyendo los de `getCursosPublicados`, `getCursosPorCategoria`, `getCursoDetalle` y `tieneAccesoCurso`)

- [ ] **Step 5: Commit**

```bash
git add lib/db/cursos.ts lib/db/cursos.test.ts
git commit -m "feat(cursos): getCursoDetalle expone accesoCurso"
```

---

### Task 3: Wire `accesoCurso` en `getLeccionDetalle` (TDD)

**Files:**
- Modify: `lib/db/lecciones.ts`
- Modify: `lib/db/lecciones.test.ts`

- [ ] **Step 1: Actualizar el describe block de `getLeccionDetalle` (falla porque el campo no existe todavía)**

Reemplaza el describe block completo `describe("getLeccionDetalle", ...)` en `lib/db/lecciones.test.ts` (líneas 3–124 antes de este plan) por:

```ts
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

  const inscripcionMaybeSingleMock = vi.fn();
  const inscripcionEqCursoMock = vi.fn(() => ({ maybeSingle: inscripcionMaybeSingleMock }));
  const inscripcionEqUsuarioMock = vi.fn(() => ({ eq: inscripcionEqCursoMock }));
  const inscripcionSelectMock = vi.fn(() => ({ eq: inscripcionEqUsuarioMock }));

  const membresiaMaybeSingleMock = vi.fn();
  const membresiaEqMock = vi.fn(() => ({ maybeSingle: membresiaMaybeSingleMock }));
  const membresiaSelectMock = vi.fn(() => ({ eq: membresiaEqMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "cursos") return { select: cursoSelectMock };
    if (tabla === "lecciones") return { select: leccionesSelectMock };
    if (tabla === "progreso") return { select: progresoSelectMock };
    if (tabla === "inscripciones") return { select: inscripcionSelectMock };
    if (tabla === "membresia") return { select: membresiaSelectMock };
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
    inscripcionSelectMock.mockClear();
    inscripcionEqUsuarioMock.mockClear();
    inscripcionEqCursoMock.mockClear();
    inscripcionMaybeSingleMock.mockClear();
    membresiaSelectMock.mockClear();
    membresiaEqMock.mockClear();
    membresiaMaybeSingleMock.mockClear();

    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));

    inscripcionMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    membresiaMaybeSingleMock.mockResolvedValue({ data: null, error: null });
  });

  it("retorna la lección con navegación anterior/siguiente, progreso y accesoCurso", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Negociación y Cierre", publicado: true, precio: 0 },
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
      accesoCurso: true,
    });
  });

  it("marca accesoCurso en false para un curso pago sin inscripción ni membresía", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Curso Pago", publicado: true, precio: 49.99 },
      error: null,
    });
    leccionesOrderMock.mockResolvedValue({
      data: [{ id: "l1", titulo: "Lección 1", tipo_contenido: "video", mux_asset_id: null, storage_key: null, orden: 1 }],
      error: null,
    });
    progresoMaybeSingleMock.mockResolvedValue({ data: null });

    const { getLeccionDetalle } = await import("./lecciones");
    const resultado = await getLeccionDetalle("c1", "l1", "u1");

    expect(resultado?.accesoCurso).toBe(false);
  });

  it("retorna null si el curso no existe o no está publicado", async () => {
    cursoSingleMock.mockResolvedValue({ data: null, error: { message: "no encontrado" } });

    const { getLeccionDetalle } = await import("./lecciones");
    const resultado = await getLeccionDetalle("no-existe", "l1", "u1");

    expect(resultado).toBeNull();
  });

  it("retorna null si la lección no pertenece al curso", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Negociación y Cierre", publicado: true, precio: 0 },
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

  it("lanza un error legible si falla la consulta de progreso", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Negociación y Cierre", publicado: true, precio: 0 },
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
    progresoMaybeSingleMock.mockResolvedValue({ data: null, error: { message: "timeout" } });

    const { getLeccionDetalle } = await import("./lecciones");

    await expect(getLeccionDetalle("c1", "l2", "u1")).rejects.toThrow(
      "No se pudo cargar el progreso: timeout"
    );
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run lib/db/lecciones.test.ts -t getLeccionDetalle`
Expected: FAIL — `resultado.accesoCurso` es `undefined` en el primer test; el segundo test nuevo falla con "tabla inesperada: inscripciones" (la función real todavía no la consulta)

- [ ] **Step 3: Implementar el wiring en `getLeccionDetalle`**

Reemplaza el contenido completo de `lib/db/lecciones.ts` hasta el final de `getLeccionDetalle` (líneas 1–78 antes de este plan; la función `marcarProgreso` que sigue no cambia) por:

```ts
import { createClient } from "@/lib/supabase/server";
import { tieneAccesoCurso } from "./cursos";

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
  accesoCurso: boolean;
};

export async function getLeccionDetalle(
  cursoId: string,
  leccionId: string,
  usuarioId: string
): Promise<LeccionDetalle | null> {
  const supabase = await createClient();

  const { data: curso, error: cursoError } = await supabase
    .from("cursos")
    .select("id, titulo, publicado, precio")
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

  const { data: progreso, error: progresoError } = await supabase
    .from("progreso")
    .select("segundo_actual, completado")
    .eq("usuario_id", usuarioId)
    .eq("leccion_id", leccionId)
    .maybeSingle();

  if (progresoError) {
    throw new Error(`No se pudo cargar el progreso: ${progresoError.message}`);
  }

  const accesoCurso = await tieneAccesoCurso(curso.id, usuarioId, curso.precio);

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
    accesoCurso,
  };
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run lib/db/lecciones.test.ts`
Expected: PASS (incluye `getLeccionDetalle` y `marcarProgreso`, sin cambios en este último)

- [ ] **Step 5: Commit**

```bash
git add lib/db/lecciones.ts lib/db/lecciones.test.ts
git commit -m "feat(lecciones): getLeccionDetalle expone accesoCurso"
```

---

### Task 4: Candado + banner en `/cursos/[cursoId]/page.tsx` (TDD)

**Files:**
- Modify: `app/(estudiante)/cursos/[cursoId]/page.tsx`
- Modify: `app/(estudiante)/cursos/[cursoId]/page.test.tsx`

- [ ] **Step 1: Actualizar el test (falla porque la página no soporta `searchParams`/candado todavía)**

Reemplaza el contenido completo de `app/(estudiante)/cursos/[cursoId]/page.test.tsx` por:

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
      accesoCurso: true,
      lecciones: [
        { id: "l1", titulo: "Psicología de la negociación", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 1, segundoActual: 0, completado: true },
        { id: "l2", titulo: "Técnicas de cierre", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 2, segundoActual: 30, completado: false },
      ],
    });

    const CursoDetallePage = (await import("./page")).default;
    render(
      await CursoDetallePage({
        params: Promise.resolve({ cursoId: "c1" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(screen.getByText("Negociación y Cierre")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /técnicas de cierre/i })).toHaveAttribute(
      "href",
      "/cursos/c1/lecciones/l2"
    );
  });

  it("muestra las lecciones con candado y sin link si el curso está bloqueado", async () => {
    getCursoDetalleMock.mockResolvedValue({
      id: "c1",
      titulo: "Maestría en Rentas",
      categoria: "clases",
      accesoCurso: false,
      lecciones: [
        { id: "l1", titulo: "Introducción a rentas", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 1, segundoActual: 0, completado: false },
      ],
    });

    const CursoDetallePage = (await import("./page")).default;
    render(
      await CursoDetallePage({
        params: Promise.resolve({ cursoId: "c1" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(screen.getByText("Introducción a rentas")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /introducción a rentas/i })).not.toBeInTheDocument();
  });

  it("muestra un banner cuando la URL trae bloqueado=1", async () => {
    getCursoDetalleMock.mockResolvedValue({
      id: "c1",
      titulo: "Maestría en Rentas",
      categoria: "clases",
      accesoCurso: false,
      lecciones: [],
    });

    const CursoDetallePage = (await import("./page")).default;
    render(
      await CursoDetallePage({
        params: Promise.resolve({ cursoId: "c1" }),
        searchParams: Promise.resolve({ bloqueado: "1" }),
      })
    );

    expect(
      screen.getByText(/no tienes acceso a este curso todavía/i)
    ).toBeInTheDocument();
  });

  it("llama a notFound si el curso no existe", async () => {
    getCursoDetalleMock.mockResolvedValue(null);

    const CursoDetallePage = (await import("./page")).default;

    await expect(
      CursoDetallePage({
        params: Promise.resolve({ cursoId: "no-existe" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run "app/(estudiante)/cursos/[cursoId]/page.test.tsx"`
Expected: FAIL — la página actual no acepta `searchParams` y no renderiza candado/banner

- [ ] **Step 3: Implementar la página**

Reemplaza el contenido completo de `app/(estudiante)/cursos/[cursoId]/page.tsx` por:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Circle, Lock } from "lucide-react";
import { getSesionUsuario } from "@/lib/auth/session";
import { getCursoDetalle } from "@/lib/db/cursos";

export default async function CursoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ cursoId: string }>;
  searchParams: Promise<{ bloqueado?: string }>;
}) {
  const { cursoId } = await params;
  const { bloqueado } = await searchParams;
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

      {bloqueado === "1" && (
        <p className="rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">
          No tienes acceso a este curso todavía — habla con tu coach para inscribirte.
        </p>
      )}

      <ol className="flex flex-col gap-2">
        {curso.lecciones.map((leccion, indice) =>
          curso.accesoCurso ? (
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
          ) : (
            <li key={leccion.id}>
              <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 opacity-60">
                <Lock className="h-5 w-5 shrink-0 text-mist-500" aria-hidden="true" />
                <span className="font-mono text-xs text-mist-500">{indice + 1}</span>
                <span className="text-mist-400">{leccion.titulo}</span>
              </div>
            </li>
          )
        )}
      </ol>
    </div>
  );
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run "app/(estudiante)/cursos/[cursoId]/page.test.tsx"`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/cursos/[cursoId]/page.tsx" "app/(estudiante)/cursos/[cursoId]/page.test.tsx"
git commit -m "feat(cursos): candado en lecciones bloqueadas + banner de acceso"
```

---

### Task 5: Redirect en `/cursos/[cursoId]/lecciones/[leccionId]/page.tsx` (TDD)

**Files:**
- Modify: `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.tsx`
- Modify: `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.test.tsx`

- [ ] **Step 1: Actualizar el test (falla porque la página no redirige todavía)**

Reemplaza el contenido completo de `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.test.tsx` por:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getSesionUsuarioMock = vi.fn();
const getLeccionDetalleMock = vi.fn();
const notFoundMock = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/lecciones", () => ({
  getLeccionDetalle: getLeccionDetalleMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  redirect: redirectMock,
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
    redirectMock.mockClear();
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
      accesoCurso: true,
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
      accesoCurso: true,
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

  it("redirige a la portada del curso si no hay acceso", async () => {
    getLeccionDetalleMock.mockResolvedValue({
      id: "l2",
      titulo: "Introducción a rentas",
      cursoId: "c1",
      cursoTitulo: "Maestría en Rentas",
      tipoContenido: "video",
      muxAssetId: "mux-123",
      storageKey: null,
      segundoActual: 0,
      completado: false,
      leccionAnteriorId: null,
      leccionSiguienteId: null,
      accesoCurso: false,
    });

    const LeccionPage = (await import("./page")).default;

    await expect(
      LeccionPage({ params: Promise.resolve({ cursoId: "c1", leccionId: "l2" }) })
    ).rejects.toThrow("NEXT_REDIRECT:/cursos/c1?bloqueado=1");
    expect(redirectMock).toHaveBeenCalledWith("/cursos/c1?bloqueado=1");
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.test.tsx"`
Expected: FAIL — el nuevo test de redirect falla porque la página no llama `redirect`

- [ ] **Step 3: Implementar la página**

Reemplaza el contenido completo de `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.tsx` por:

```tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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

  if (!leccion.accesoCurso) {
    redirect(`/cursos/${cursoId}?bloqueado=1`);
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

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.test.tsx"`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.tsx" "app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.test.tsx"
git commit -m "feat(lecciones): redirige a la portada si el curso esta bloqueado"
```

---

### Task 6: Verificación completa y actualización de `docs/TAREAS.md`

**Files:**
- Modify: `docs/TAREAS.md`

- [ ] **Step 1: Correr la suite completa**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: los cuatro pasan (mismo orden que `.github/workflows/ci.yml`)

- [ ] **Step 2: Mover el ítem 1 de "Pendiente" a "Hecho" en `docs/TAREAS.md`**

Busca en la sección "Hecho" la línea de Herramientas y Comunicación (agregada en la limpieza de docs previa) y agrega inmediatamente después:

```
- **Control de acceso real a cursos** (`lib/db/cursos.ts`, `lib/db/lecciones.ts`): `tieneAccesoCurso()` verifica `inscripciones`/`membresia` antes de dar acceso al contenido de una lección — los cursos con `precio = 0` siguen siendo libres para cualquier estudiante. La portada del curso sigue siendo visible con las lecciones bloqueadas mostrando un candado; sin flujo de compra todavía (ver Épica B · Stripe en `/cronograma`).
```

Busca en la sección "Pendiente para el objetivo final" el ítem:

```
1. **Control de acceso real a cursos comprados** — hoy cualquier estudiante ve cualquier curso `publicado`. Falta que `lib/db/cursos.ts` verifique `inscripciones`/`membresia` antes de dar acceso a la lección, no solo a la portada del curso. Las tablas y RLS ya existen; falta la lógica de aplicación.
```

Elimínalo de la lista y renumera los ítems siguientes (2 pasa a ser 1, y así sucesivamente hasta el 11 que pasa a ser 10).

- [ ] **Step 3: Commit**

```bash
git add docs/TAREAS.md
git commit -m "docs: marca control de acceso a cursos como hecho"
```
