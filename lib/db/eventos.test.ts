import { describe, it, expect, vi, beforeEach } from "vitest";

const filaEventoEjemplo = {
  id: "evento-1",
  categoria: "internacional",
  titulo: "Florida como destino inmobiliario",
  subtitulo: "Cronograma de eventos 2026 · Bogotá, Distrito Capital",
  youtube_url: "https://www.youtube.com/watch?v=jV468IGkYtg",
  orden: 1,
  activo: true,
  creado_en: "2026-01-01T00:00:00.000Z",
};

const filaFechaEjemplo = {
  id: "fecha-1",
  evento_id: "evento-1",
  fecha_inicio: "2026-01-30",
  fecha_fin: "2026-01-31",
  ubicacion: "Bogotá, Colombia",
};

const eventoMapeado = {
  id: "evento-1",
  categoria: "internacional",
  titulo: "Florida como destino inmobiliario",
  subtitulo: "Cronograma de eventos 2026 · Bogotá, Distrito Capital",
  youtubeUrl: "https://www.youtube.com/watch?v=jV468IGkYtg",
  orden: 1,
  activo: true,
  creadoEn: "2026-01-01T00:00:00.000Z",
  fechas: [
    {
      id: "fecha-1",
      fechaInicio: "2026-01-30",
      fechaFin: "2026-01-31",
      ubicacion: "Bogotá, Colombia",
    },
  ],
};

const eventoInputEjemplo = {
  categoria: "internacional" as const,
  titulo: "Florida como destino inmobiliario",
  subtitulo: "Cronograma de eventos 2026 · Bogotá, Distrito Capital",
  youtubeUrl: "https://www.youtube.com/watch?v=jV468IGkYtg",
  orden: 1,
  activo: true,
  fechas: [{ fechaInicio: "2026-01-30", fechaFin: "2026-01-31", ubicacion: "Bogotá, Colombia" }],
};

type EventosResult = {
  data: (typeof filaEventoEjemplo)[] | null;
  error: { message: string } | null;
};

type FechasResult = {
  data: (typeof filaFechaEjemplo)[] | null;
  error: { message: string } | null;
};

type MutacionResult = { error: { message: string } | null };

type CrearEventoResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};

describe("getEventos", () => {
  const eqActivoMock = vi.fn(() => ({
    order: vi.fn(() => ({
      order: vi.fn(
        (): Promise<EventosResult> => Promise.resolve({ data: [filaEventoEjemplo], error: null })
      ),
    })),
  }));
  const selectEventosMock = vi.fn(() => ({ eq: eqActivoMock }));
  const inFechasMock = vi.fn(
    (): Promise<FechasResult> => Promise.resolve({ data: [filaFechaEjemplo], error: null })
  );
  const selectFechasMock = vi.fn(() => ({ in: inFechasMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "eventos") return { select: selectEventosMock };
    if (tabla === "eventos_fechas") return { select: selectFechasMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    selectEventosMock.mockClear();
    eqActivoMock.mockClear();
    selectFechasMock.mockClear();
    inFechasMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("consulta eventos activos con sus fechas, ordenados por categoría y orden", async () => {
    const { getEventos } = await import("./eventos");
    const eventos = await getEventos();

    expect(fromMock).toHaveBeenCalledWith("eventos");
    expect(eqActivoMock).toHaveBeenCalledWith("activo", true);
    expect(fromMock).toHaveBeenCalledWith("eventos_fechas");
    expect(inFechasMock).toHaveBeenCalledWith("evento_id", ["evento-1"]);
    expect(eventos).toEqual([eventoMapeado]);
  });

  it("retorna un array vacío sin consultar fechas si no hay eventos activos", async () => {
    selectEventosMock.mockReturnValueOnce({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    });

    const { getEventos } = await import("./eventos");
    const eventos = await getEventos();

    expect(eventos).toEqual([]);
    expect(fromMock).not.toHaveBeenCalledWith("eventos_fechas");
  });

  it("lanza un error legible si falla la consulta de eventos", async () => {
    selectEventosMock.mockReturnValueOnce({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: null, error: { message: "timeout" } })),
        })),
      })),
    });

    const { getEventos } = await import("./eventos");

    await expect(getEventos()).rejects.toThrow("No se pudieron cargar los eventos: timeout");
  });

  it("lanza un error legible si falla la consulta de fechas", async () => {
    inFechasMock.mockResolvedValueOnce({ data: null, error: { message: "timeout" } });

    const { getEventos } = await import("./eventos");

    await expect(getEventos()).rejects.toThrow(
      "No se pudieron cargar las fechas de los eventos: timeout"
    );
  });
});

describe("getTodosLosEventos", () => {
  const orderCategoriaMock = vi.fn(() => ({
    order: vi.fn(
      (): Promise<EventosResult> => Promise.resolve({ data: [filaEventoEjemplo], error: null })
    ),
  }));
  const selectEventosMock = vi.fn(() => ({ order: orderCategoriaMock }));
  const inFechasMock = vi.fn(
    (): Promise<FechasResult> => Promise.resolve({ data: [filaFechaEjemplo], error: null })
  );
  const selectFechasMock = vi.fn(() => ({ in: inFechasMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "eventos") return { select: selectEventosMock };
    if (tabla === "eventos_fechas") return { select: selectFechasMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    selectEventosMock.mockClear();
    orderCategoriaMock.mockClear();
    selectFechasMock.mockClear();
    inFechasMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("consulta todos los eventos sin filtrar por activo, con sus fechas", async () => {
    const { getTodosLosEventos } = await import("./eventos");
    const eventos = await getTodosLosEventos();

    expect(fromMock).toHaveBeenCalledWith("eventos");
    expect(orderCategoriaMock).toHaveBeenCalledWith("categoria");
    expect(eventos).toEqual([eventoMapeado]);
  });

  it("lanza un error legible si falla la consulta", async () => {
    orderCategoriaMock.mockReturnValueOnce({
      order: vi.fn(() => Promise.resolve({ data: null, error: { message: "timeout" } })),
    });

    const { getTodosLosEventos } = await import("./eventos");

    await expect(getTodosLosEventos()).rejects.toThrow("No se pudieron cargar los eventos: timeout");
  });
});

describe("crearEvento", () => {
  const singleMock = vi.fn(
    (): Promise<CrearEventoResult> => Promise.resolve({ data: { id: "evento-1" }, error: null })
  );
  const selectIdMock = vi.fn(() => ({ single: singleMock }));
  const insertEventoMock = vi.fn(() => ({ select: selectIdMock }));
  const insertFechasMock = vi.fn((): Promise<MutacionResult> => Promise.resolve({ error: null }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "eventos") return { insert: insertEventoMock };
    if (tabla === "eventos_fechas") return { insert: insertFechasMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    insertEventoMock.mockClear();
    selectIdMock.mockClear();
    singleMock.mockClear();
    insertFechasMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("inserta el evento y luego sus fechas", async () => {
    const { crearEvento } = await import("./eventos");
    await crearEvento(eventoInputEjemplo);

    expect(insertEventoMock).toHaveBeenCalledWith({
      categoria: "internacional",
      titulo: "Florida como destino inmobiliario",
      subtitulo: "Cronograma de eventos 2026 · Bogotá, Distrito Capital",
      youtube_url: "https://www.youtube.com/watch?v=jV468IGkYtg",
      orden: 1,
      activo: true,
    });
    expect(insertFechasMock).toHaveBeenCalledWith([
      {
        evento_id: "evento-1",
        fecha_inicio: "2026-01-30",
        fecha_fin: "2026-01-31",
        ubicacion: "Bogotá, Colombia",
      },
    ]);
  });

  it("lanza un error legible si falla la inserción del evento", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: { message: "permission denied" } });

    const { crearEvento } = await import("./eventos");

    await expect(crearEvento(eventoInputEjemplo)).rejects.toThrow(
      "No se pudo crear el evento: permission denied"
    );
    expect(insertFechasMock).not.toHaveBeenCalled();
  });

  it("lanza un error legible si falla la inserción de las fechas", async () => {
    insertFechasMock.mockResolvedValueOnce({ error: { message: "permission denied" } });

    const { crearEvento } = await import("./eventos");

    await expect(crearEvento(eventoInputEjemplo)).rejects.toThrow(
      "No se pudieron guardar las fechas del evento: permission denied"
    );
  });
});

describe("actualizarEvento", () => {
  const eqUpdateMock = vi.fn((): Promise<MutacionResult> => Promise.resolve({ error: null }));
  const updateEventoMock = vi.fn(() => ({ eq: eqUpdateMock }));
  const eqDeleteMock = vi.fn((): Promise<MutacionResult> => Promise.resolve({ error: null }));
  const deleteFechasMock = vi.fn(() => ({ eq: eqDeleteMock }));
  const insertFechasMock = vi.fn((): Promise<MutacionResult> => Promise.resolve({ error: null }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "eventos") return { update: updateEventoMock };
    if (tabla === "eventos_fechas") return { delete: deleteFechasMock, insert: insertFechasMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    updateEventoMock.mockClear();
    eqUpdateMock.mockClear();
    deleteFechasMock.mockClear();
    eqDeleteMock.mockClear();
    insertFechasMock.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("actualiza el evento, borra sus fechas anteriores e inserta las nuevas", async () => {
    const { actualizarEvento } = await import("./eventos");
    await actualizarEvento("evento-1", eventoInputEjemplo);

    expect(updateEventoMock).toHaveBeenCalledWith({
      categoria: "internacional",
      titulo: "Florida como destino inmobiliario",
      subtitulo: "Cronograma de eventos 2026 · Bogotá, Distrito Capital",
      youtube_url: "https://www.youtube.com/watch?v=jV468IGkYtg",
      orden: 1,
      activo: true,
    });
    expect(eqUpdateMock).toHaveBeenCalledWith("id", "evento-1");
    expect(eqDeleteMock).toHaveBeenCalledWith("evento_id", "evento-1");
    expect(insertFechasMock).toHaveBeenCalledWith([
      {
        evento_id: "evento-1",
        fecha_inicio: "2026-01-30",
        fecha_fin: "2026-01-31",
        ubicacion: "Bogotá, Colombia",
      },
    ]);
  });

  it("lanza un error legible si falla la actualización del evento", async () => {
    eqUpdateMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { actualizarEvento } = await import("./eventos");

    await expect(actualizarEvento("evento-1", eventoInputEjemplo)).rejects.toThrow(
      "No se pudo actualizar el evento: timeout"
    );
    expect(deleteFechasMock).not.toHaveBeenCalled();
  });

  it("lanza un error legible si falla el borrado de fechas anteriores", async () => {
    eqDeleteMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { actualizarEvento } = await import("./eventos");

    await expect(actualizarEvento("evento-1", eventoInputEjemplo)).rejects.toThrow(
      "No se pudieron actualizar las fechas del evento: timeout"
    );
  });
});

describe("eliminarEvento", () => {
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

  it("elimina el evento por id (las fechas se borran en cascada por la FK)", async () => {
    const { eliminarEvento } = await import("./eventos");
    await eliminarEvento("evento-1");

    expect(fromMock).toHaveBeenCalledWith("eventos");
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith("id", "evento-1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { eliminarEvento } = await import("./eventos");

    await expect(eliminarEvento("evento-1")).rejects.toThrow("No se pudo eliminar el evento: timeout");
  });
});
