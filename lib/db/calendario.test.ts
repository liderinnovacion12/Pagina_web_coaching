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
  creado_en: "2026-01-06T00:00:00.000Z",
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
  creadoEn: "2026-01-06T00:00:00.000Z",
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

type ClasesResult = {
  data: (typeof filaEjemplo)[] | null;
  error: { message: string } | null;
};

type MutacionResult = { error: { message: string } | null };

describe("getClasesCalendario", () => {
  const orderMock = vi.fn((): Promise<ClasesResult> => Promise.resolve({ data: [filaEjemplo], error: null }));
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
    orderMock.mockResolvedValueOnce({
      data: null,
      error: { message: "timeout" },
    });

    const { getClasesCalendario } = await import("./calendario");

    await expect(getClasesCalendario()).rejects.toThrow(
      "No se pudieron cargar las clases: timeout"
    );
  });
});

describe("getTodasLasClases", () => {
  const orderMock = vi.fn((): Promise<ClasesResult> => Promise.resolve({ data: [filaEjemplo], error: null }));
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

    expect(fromMock).toHaveBeenCalledWith("clases_calendario");
    expect(orderMock).toHaveBeenCalledWith("fecha_ancla");
    expect(clases).toEqual([claseMapeada]);
  });
});

describe("crearClase", () => {
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
    insertMock.mockResolvedValueOnce({ error: { message: "permission denied" } });

    const { crearClase } = await import("./calendario");

    await expect(crearClase(claseInputEjemplo)).rejects.toThrow(
      "No se pudo crear la clase: permission denied"
    );
  });
});

describe("actualizarClase", () => {
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

  it("actualiza la clase con el payload en snake_case", async () => {
    const { actualizarClase } = await import("./calendario");
    await actualizarClase("1", claseInputEjemplo);

    expect(fromMock).toHaveBeenCalledWith("clases_calendario");
    expect(updateMock).toHaveBeenCalledWith({
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
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { actualizarClase } = await import("./calendario");

    await expect(actualizarClase("1", claseInputEjemplo)).rejects.toThrow(
      "No se pudo actualizar la clase: timeout"
    );
  });
});

describe("eliminarClase", () => {
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

  it("elimina la clase por id", async () => {
    const { eliminarClase } = await import("./calendario");
    await eliminarClase("1");

    expect(fromMock).toHaveBeenCalledWith("clases_calendario");
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { eliminarClase } = await import("./calendario");

    await expect(eliminarClase("1")).rejects.toThrow("No se pudo eliminar la clase: timeout");
  });
});
