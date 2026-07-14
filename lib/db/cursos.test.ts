import { describe, it, expect, vi, beforeEach } from "vitest";

type CursosResult = {
  data: { id: string; titulo: string; precio: number }[] | null;
  error: { message: string } | null;
};

const orderMock = vi.fn(
  (): CursosResult => ({
    data: [{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }],
    error: null,
  })
);
const eqMock = vi.fn(() => ({ order: orderMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

describe("getCursosPublicados", () => {
  beforeEach(() => {
    fromMock.mockClear();
    selectMock.mockClear();
    eqMock.mockClear();
    orderMock.mockClear();
  });

  it("consulta solo cursos publicados, ordenados por título", async () => {
    const { getCursosPublicados } = await import("./cursos");
    const cursos = await getCursosPublicados();

    expect(fromMock).toHaveBeenCalledWith("cursos");
    expect(selectMock).toHaveBeenCalledWith("id, titulo, precio");
    expect(eqMock).toHaveBeenCalledWith("publicado", true);
    expect(orderMock).toHaveBeenCalledWith("titulo");
    expect(cursos).toEqual([{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }]);
  });

  it("lanza un error legible si Supabase falla", async () => {
    orderMock.mockReturnValueOnce({ data: null, error: { message: "timeout" } });

    const { getCursosPublicados } = await import("./cursos");

    await expect(getCursosPublicados()).rejects.toThrow(
      "No se pudo cargar el catálogo: timeout"
    );
  });
});

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

    vi.resetModules();
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

  it("sin categoría, no filtra por categoria (solo filtra por publicado)", async () => {
    cursosOrderMock.mockResolvedValue({ data: [], error: null });

    const { getCursosPorCategoria } = await import("./cursos");
    await getCursosPorCategoria("u1");

    expect(cursosEqMock).toHaveBeenCalledWith("publicado", true);
    expect(cursosEqMock).not.toHaveBeenCalledWith("categoria", expect.anything());
    expect(cursosEqMock).toHaveBeenCalledTimes(1);
  });

  it("particiona el progreso por curso cuando hay varios cursos con lecciones propias", async () => {
    cursosOrderMock.mockResolvedValue({
      data: [
        { id: "c1", titulo: "Curso A", categoria: "sistema_100" },
        { id: "c2", titulo: "Curso B", categoria: "clases" },
      ],
      error: null,
    });
    leccionesInMock.mockResolvedValue({
      data: [
        { id: "l1", curso_id: "c1" },
        { id: "l2", curso_id: "c1" },
        { id: "l3", curso_id: "c2" },
        { id: "l4", curso_id: "c2" },
        { id: "l5", curso_id: "c2" },
      ],
      error: null,
    });
    progresoInMock.mockResolvedValue({
      data: [
        { leccion_id: "l1", completado: true },
        { leccion_id: "l2", completado: false },
        { leccion_id: "l3", completado: true },
        { leccion_id: "l4", completado: true },
      ],
      error: null,
    });

    const { getCursosPorCategoria } = await import("./cursos");
    const resultado = await getCursosPorCategoria("u1");

    expect(resultado).toEqual([
      {
        id: "c1",
        titulo: "Curso A",
        categoria: "sistema_100",
        totalLecciones: 2,
        leccionesCompletadas: 1,
        progresoPorcentaje: 50,
      },
      {
        id: "c2",
        titulo: "Curso B",
        categoria: "clases",
        totalLecciones: 3,
        leccionesCompletadas: 2,
        progresoPorcentaje: 67,
      },
    ]);
  });

  it("retorna progreso 0 sin NaN cuando el curso no tiene lecciones", async () => {
    cursosOrderMock.mockResolvedValue({
      data: [{ id: "c1", titulo: "Curso Vacío", categoria: "clases" }],
      error: null,
    });
    leccionesInMock.mockResolvedValue({ data: [], error: null });

    const { getCursosPorCategoria } = await import("./cursos");
    const resultado = await getCursosPorCategoria("u1", "clases");

    expect(resultado).toEqual([
      {
        id: "c1",
        titulo: "Curso Vacío",
        categoria: "clases",
        totalLecciones: 0,
        leccionesCompletadas: 0,
        progresoPorcentaje: 0,
      },
    ]);
  });

  it("lanza un error legible si falla la consulta de lecciones", async () => {
    cursosOrderMock.mockResolvedValue({
      data: [{ id: "c1", titulo: "Curso A", categoria: "clases" }],
      error: null,
    });
    leccionesInMock.mockResolvedValue({ data: null, error: { message: "fallo lecciones" } });

    const { getCursosPorCategoria } = await import("./cursos");

    await expect(getCursosPorCategoria("u1", "clases")).rejects.toThrow(
      "No se pudieron cargar las lecciones: fallo lecciones"
    );
  });

  it("lanza un error legible si falla la consulta de progreso", async () => {
    cursosOrderMock.mockResolvedValue({
      data: [{ id: "c1", titulo: "Curso A", categoria: "clases" }],
      error: null,
    });
    leccionesInMock.mockResolvedValue({
      data: [{ id: "l1", curso_id: "c1" }],
      error: null,
    });
    progresoInMock.mockResolvedValue({ data: null, error: { message: "fallo progreso" } });

    const { getCursosPorCategoria } = await import("./cursos");

    await expect(getCursosPorCategoria("u1", "clases")).rejects.toThrow(
      "No se pudo cargar el progreso: fallo progreso"
    );
  });
});

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

    vi.resetModules();
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

  it("retorna null si el curso existe pero publicado es false", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Negociación y Cierre", categoria: "sistema_100", publicado: false },
      error: null,
    });

    const { getCursoDetalle } = await import("./cursos");
    const resultado = await getCursoDetalle("c1", "u1");

    expect(resultado).toBeNull();
  });

  it("retorna lecciones vacías sin consultar progreso si el curso no tiene lecciones", async () => {
    cursoSingleMock.mockResolvedValue({
      data: { id: "c1", titulo: "Curso Vacío", categoria: "clases", publicado: true },
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
      data: { id: "c1", titulo: "Curso A", categoria: "clases", publicado: true },
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
      data: { id: "c1", titulo: "Curso A", categoria: "clases", publicado: true },
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
