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
