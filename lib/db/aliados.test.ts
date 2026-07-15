import { describe, it, expect, vi, beforeEach } from "vitest";

const filaEjemplo = {
  id: "1",
  servicio: "Tributaria LLC",
  descripcion: "Asistencia integral en la creación y renovación de sociedades LLC.",
  contacto_nombre: "Ricardo Fernandez de Cordoba Martos",
  contacto_telefono: "+1 (305) 458-6559",
  contacto_correo: "ricardo.fernandez@firstglobalfinanceus.com",
  imagen_url:
    "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-ricardo-fernandez-c4k6Rpie.jpeg",
  orden: 1,
  activo: true,
  creado_en: "2026-01-01T00:00:00.000Z",
};

const aliadoMapeado = {
  id: "1",
  servicio: "Tributaria LLC",
  descripcion: "Asistencia integral en la creación y renovación de sociedades LLC.",
  contactoNombre: "Ricardo Fernandez de Cordoba Martos",
  contactoTelefono: "+1 (305) 458-6559",
  contactoCorreo: "ricardo.fernandez@firstglobalfinanceus.com",
  imagenUrl:
    "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-ricardo-fernandez-c4k6Rpie.jpeg",
  orden: 1,
  activo: true,
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const aliadoInputEjemplo = {
  servicio: "Tributaria LLC",
  descripcion: "Asistencia integral en la creación y renovación de sociedades LLC.",
  contactoNombre: "Ricardo Fernandez de Cordoba Martos",
  contactoTelefono: "+1 (305) 458-6559",
  contactoCorreo: "ricardo.fernandez@firstglobalfinanceus.com",
  imagenUrl:
    "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-ricardo-fernandez-c4k6Rpie.jpeg",
  orden: 1,
  activo: true,
};

type AliadosResult = {
  data: (typeof filaEjemplo)[] | null;
  error: { message: string } | null;
};

type MutacionResult = { error: { message: string } | null };

describe("getAliados", () => {
  const orderMock = vi.fn(
    (): Promise<AliadosResult> => Promise.resolve({ data: [filaEjemplo], error: null })
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

  it("consulta solo aliados activos, ordenados por orden", async () => {
    const { getAliados } = await import("./aliados");
    const aliados = await getAliados();

    expect(fromMock).toHaveBeenCalledWith("aliados");
    expect(eqMock).toHaveBeenCalledWith("activo", true);
    expect(orderMock).toHaveBeenCalledWith("orden");
    expect(aliados).toEqual([aliadoMapeado]);
  });

  it("lanza un error legible si Supabase falla", async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: { message: "timeout" } });

    const { getAliados } = await import("./aliados");

    await expect(getAliados()).rejects.toThrow("No se pudieron cargar los aliados: timeout");
  });
});

describe("getTodosLosAliados", () => {
  const orderMock = vi.fn(
    (): Promise<AliadosResult> => Promise.resolve({ data: [filaEjemplo], error: null })
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

  it("consulta todos los aliados sin filtrar por activo", async () => {
    const { getTodosLosAliados } = await import("./aliados");
    const aliados = await getTodosLosAliados();

    expect(fromMock).toHaveBeenCalledWith("aliados");
    expect(orderMock).toHaveBeenCalledWith("orden");
    expect(aliados).toEqual([aliadoMapeado]);
  });
});

describe("crearAliado", () => {
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

  it("inserta el aliado mapeando los campos a snake_case", async () => {
    const { crearAliado } = await import("./aliados");
    await crearAliado(aliadoInputEjemplo);

    expect(fromMock).toHaveBeenCalledWith("aliados");
    expect(insertMock).toHaveBeenCalledWith({
      servicio: "Tributaria LLC",
      descripcion: "Asistencia integral en la creación y renovación de sociedades LLC.",
      contacto_nombre: "Ricardo Fernandez de Cordoba Martos",
      contacto_telefono: "+1 (305) 458-6559",
      contacto_correo: "ricardo.fernandez@firstglobalfinanceus.com",
      imagen_url:
        "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-ricardo-fernandez-c4k6Rpie.jpeg",
      orden: 1,
      activo: true,
    });
  });

  it("lanza un error legible si Supabase falla", async () => {
    insertMock.mockResolvedValueOnce({ error: { message: "permission denied" } });

    const { crearAliado } = await import("./aliados");

    await expect(crearAliado(aliadoInputEjemplo)).rejects.toThrow(
      "No se pudo crear el aliado: permission denied"
    );
  });
});

describe("actualizarAliado", () => {
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

  it("actualiza el aliado con el payload en snake_case", async () => {
    const { actualizarAliado } = await import("./aliados");
    await actualizarAliado("1", aliadoInputEjemplo);

    expect(fromMock).toHaveBeenCalledWith("aliados");
    expect(updateMock).toHaveBeenCalledWith({
      servicio: "Tributaria LLC",
      descripcion: "Asistencia integral en la creación y renovación de sociedades LLC.",
      contacto_nombre: "Ricardo Fernandez de Cordoba Martos",
      contacto_telefono: "+1 (305) 458-6559",
      contacto_correo: "ricardo.fernandez@firstglobalfinanceus.com",
      imagen_url:
        "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-ricardo-fernandez-c4k6Rpie.jpeg",
      orden: 1,
      activo: true,
    });
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { actualizarAliado } = await import("./aliados");

    await expect(actualizarAliado("1", aliadoInputEjemplo)).rejects.toThrow(
      "No se pudo actualizar el aliado: timeout"
    );
  });
});

describe("eliminarAliado", () => {
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

  it("elimina el aliado por id", async () => {
    const { eliminarAliado } = await import("./aliados");
    await eliminarAliado("1");

    expect(fromMock).toHaveBeenCalledWith("aliados");
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { eliminarAliado } = await import("./aliados");

    await expect(eliminarAliado("1")).rejects.toThrow("No se pudo eliminar el aliado: timeout");
  });
});
