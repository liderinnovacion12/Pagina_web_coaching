import { describe, it, expect, vi, beforeEach } from "vitest";

const crearAliadoMock = vi.fn(async () => {});
const actualizarAliadoMock = vi.fn(async () => {});

vi.mock("@/lib/db/aliados", () => ({
  crearAliado: crearAliadoMock,
  actualizarAliado: actualizarAliadoMock,
  eliminarAliado: vi.fn(async () => {}),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function construirFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("servicio", "Tributaria LLC");
  formData.set("descripcion", "Asistencia integral en la creación de sociedades LLC.");
  formData.set("contactoNombre", "Ana\nBeto");
  formData.set("contactoTelefono", "111");
  formData.set("contactoCorreo", "ana@ej.com\nbeto@ej.com");
  formData.set("orden", "1");
  formData.set("activo", "on");

  for (const [clave, valor] of Object.entries(overrides)) {
    formData.set(clave, valor);
  }

  return formData;
}

const MENSAJE_DESALINEADO =
  "El número de líneas debe coincidir entre nombre, teléfono y correo de contacto.";

describe("crearAliadoAction", () => {
  beforeEach(() => {
    crearAliadoMock.mockClear();
  });

  it("rechaza contactos con conteos de línea desalineados sin llamar a crearAliado", async () => {
    const { crearAliadoAction } = await import("./actions");
    const formData = construirFormData();

    const resultado = await crearAliadoAction({ error: null }, formData);

    expect(resultado).toEqual({ error: MENSAJE_DESALINEADO });
    expect(crearAliadoMock).not.toHaveBeenCalled();
  });

  it("permite contactos con conteos de línea alineados", async () => {
    const { crearAliadoAction } = await import("./actions");
    const formData = construirFormData({ contactoTelefono: "111\n222" });

    const resultado = await crearAliadoAction({ error: null }, formData);

    expect(resultado).toEqual({ error: null });
    expect(crearAliadoMock).toHaveBeenCalledTimes(1);
  });
});

describe("actualizarAliadoAction", () => {
  beforeEach(() => {
    actualizarAliadoMock.mockClear();
  });

  it("rechaza contactos con conteos de línea desalineados sin llamar a actualizarAliado", async () => {
    const { actualizarAliadoAction } = await import("./actions");
    const formData = construirFormData();

    const resultado = await actualizarAliadoAction("1", { error: null }, formData);

    expect(resultado).toEqual({ error: MENSAJE_DESALINEADO });
    expect(actualizarAliadoMock).not.toHaveBeenCalled();
  });
});
