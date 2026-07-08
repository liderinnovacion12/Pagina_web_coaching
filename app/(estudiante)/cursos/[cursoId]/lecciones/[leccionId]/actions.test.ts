import { describe, it, expect, vi, beforeEach } from "vitest";

const getSesionUsuarioMock = vi.fn();
const marcarProgresoMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/lecciones", () => ({
  marcarProgreso: marcarProgresoMock,
}));

describe("marcarProgresoAction", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    marcarProgresoMock.mockReset();
  });

  it("guarda el progreso del usuario autenticado", async () => {
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "estudiante" });
    marcarProgresoMock.mockResolvedValue(undefined);

    const { marcarProgresoAction } = await import("./actions");
    const resultado = await marcarProgresoAction("l2", { completado: true });

    expect(marcarProgresoMock).toHaveBeenCalledWith("u1", "l2", { completado: true });
    expect(resultado).toEqual({ error: null });
  });

  it("retorna error si no hay sesión", async () => {
    getSesionUsuarioMock.mockResolvedValue(null);

    const { marcarProgresoAction } = await import("./actions");
    const resultado = await marcarProgresoAction("l2", { completado: true });

    expect(marcarProgresoMock).not.toHaveBeenCalled();
    expect(resultado).toEqual({ error: "No autenticado." });
  });

  it("retorna el mensaje de error si marcarProgreso falla", async () => {
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "estudiante" });
    marcarProgresoMock.mockRejectedValue(new Error("No se pudo guardar el progreso: timeout"));

    const { marcarProgresoAction } = await import("./actions");
    const resultado = await marcarProgresoAction("l2", { completado: true });

    expect(resultado).toEqual({ error: "No se pudo guardar el progreso: timeout" });
  });
});
