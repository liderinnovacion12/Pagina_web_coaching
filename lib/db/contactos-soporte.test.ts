import { describe, it, expect, vi, beforeEach } from "vitest";

const filaContactoEjemplo = {
  id: "1",
  nombre: "John Díaz",
  cargo: "CEO",
  descripcion_cargo: "Director ejecutivo de la empresa",
  telefono: "+1 (305) 593-6361",
  correo: "jdiaz@teammyrealty.com",
  foto_url:
    "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-john-diaz-BpGGZ1rN.jpeg",
  orden: 1,
  activo: true,
  creado_en: "2026-01-01T00:00:00.000Z",
};

const contactoMapeado = {
  id: "1",
  nombre: "John Díaz",
  cargo: "CEO",
  descripcionCargo: "Director ejecutivo de la empresa",
  telefono: "+1 (305) 593-6361",
  correo: "jdiaz@teammyrealty.com",
  fotoUrl:
    "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-john-diaz-BpGGZ1rN.jpeg",
  orden: 1,
  activo: true,
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const contactoInputEjemplo = {
  nombre: "John Díaz",
  cargo: "CEO",
  descripcionCargo: "Director ejecutivo de la empresa",
  telefono: "+1 (305) 593-6361",
  correo: "jdiaz@teammyrealty.com",
  fotoUrl:
    "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-john-diaz-BpGGZ1rN.jpeg",
  orden: 1,
  activo: true,
};

type ContactosResult = {
  data: (typeof filaContactoEjemplo)[] | null;
  error: { message: string } | null;
};

type MutacionResult = { error: { message: string } | null };

describe("getContactosSoporte", () => {
  const orderMock = vi.fn(
    (): Promise<ContactosResult> => Promise.resolve({ data: [filaContactoEjemplo], error: null })
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

  it("consulta solo contactos activos, ordenados por orden", async () => {
    const { getContactosSoporte } = await import("./contactos-soporte");
    const contactos = await getContactosSoporte();

    expect(fromMock).toHaveBeenCalledWith("contactos_soporte");
    expect(eqMock).toHaveBeenCalledWith("activo", true);
    expect(orderMock).toHaveBeenCalledWith("orden");
    expect(contactos).toEqual([contactoMapeado]);
  });

  it("lanza un error legible si Supabase falla", async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: { message: "timeout" } });

    const { getContactosSoporte } = await import("./contactos-soporte");

    await expect(getContactosSoporte()).rejects.toThrow(
      "No se pudieron cargar los contactos de soporte: timeout"
    );
  });
});

describe("getTodosLosContactosSoporte", () => {
  const orderMock = vi.fn(
    (): Promise<ContactosResult> => Promise.resolve({ data: [filaContactoEjemplo], error: null })
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

  it("consulta todos los contactos sin filtrar por activo", async () => {
    const { getTodosLosContactosSoporte } = await import("./contactos-soporte");
    const contactos = await getTodosLosContactosSoporte();

    expect(fromMock).toHaveBeenCalledWith("contactos_soporte");
    expect(orderMock).toHaveBeenCalledWith("orden");
    expect(contactos).toEqual([contactoMapeado]);
  });
});

describe("crearContactoSoporte", () => {
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

  it("inserta el contacto mapeando los campos a snake_case", async () => {
    const { crearContactoSoporte } = await import("./contactos-soporte");
    await crearContactoSoporte(contactoInputEjemplo);

    expect(fromMock).toHaveBeenCalledWith("contactos_soporte");
    expect(insertMock).toHaveBeenCalledWith({
      nombre: "John Díaz",
      cargo: "CEO",
      descripcion_cargo: "Director ejecutivo de la empresa",
      telefono: "+1 (305) 593-6361",
      correo: "jdiaz@teammyrealty.com",
      foto_url:
        "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-john-diaz-BpGGZ1rN.jpeg",
      orden: 1,
      activo: true,
    });
  });

  it("lanza un error legible si Supabase falla", async () => {
    insertMock.mockResolvedValueOnce({ error: { message: "permission denied" } });

    const { crearContactoSoporte } = await import("./contactos-soporte");

    await expect(crearContactoSoporte(contactoInputEjemplo)).rejects.toThrow(
      "No se pudo crear el contacto: permission denied"
    );
  });
});

describe("actualizarContactoSoporte", () => {
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

  it("actualiza el contacto con el payload en snake_case", async () => {
    const { actualizarContactoSoporte } = await import("./contactos-soporte");
    await actualizarContactoSoporte("1", contactoInputEjemplo);

    expect(fromMock).toHaveBeenCalledWith("contactos_soporte");
    expect(updateMock).toHaveBeenCalledWith({
      nombre: "John Díaz",
      cargo: "CEO",
      descripcion_cargo: "Director ejecutivo de la empresa",
      telefono: "+1 (305) 593-6361",
      correo: "jdiaz@teammyrealty.com",
      foto_url:
        "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-john-diaz-BpGGZ1rN.jpeg",
      orden: 1,
      activo: true,
    });
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { actualizarContactoSoporte } = await import("./contactos-soporte");

    await expect(actualizarContactoSoporte("1", contactoInputEjemplo)).rejects.toThrow(
      "No se pudo actualizar el contacto: timeout"
    );
  });
});

describe("eliminarContactoSoporte", () => {
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

  it("elimina el contacto por id", async () => {
    const { eliminarContactoSoporte } = await import("./contactos-soporte");
    await eliminarContactoSoporte("1");

    expect(fromMock).toHaveBeenCalledWith("contactos_soporte");
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith("id", "1");
  });

  it("lanza un error legible si Supabase falla", async () => {
    eqMock.mockResolvedValueOnce({ error: { message: "timeout" } });

    const { eliminarContactoSoporte } = await import("./contactos-soporte");

    await expect(eliminarContactoSoporte("1")).rejects.toThrow(
      "No se pudo eliminar el contacto: timeout"
    );
  });
});
