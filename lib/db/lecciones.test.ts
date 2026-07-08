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

    vi.resetModules();
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

  it("lanza un error legible si falla la consulta de progreso", async () => {
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
    progresoMaybeSingleMock.mockResolvedValue({ data: null, error: { message: "timeout" } });

    const { getLeccionDetalle } = await import("./lecciones");

    await expect(getLeccionDetalle("c1", "l2", "u1")).rejects.toThrow(
      "No se pudo cargar el progreso: timeout"
    );
  });
});

describe("marcarProgreso", () => {
  const upsertMock = vi.fn();
  const fromMock = vi.fn(() => ({ upsert: upsertMock }));

  beforeEach(() => {
    upsertMock.mockClear();
    fromMock.mockClear();

    vi.resetModules();
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
