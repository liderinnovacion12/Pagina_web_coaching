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
