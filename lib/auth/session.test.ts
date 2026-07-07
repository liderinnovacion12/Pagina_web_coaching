import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ single: singleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));
const redirectMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("getSesionUsuario", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    singleMock.mockReset();
    redirectMock.mockReset();
  });

  it("retorna null si no hay usuario autenticado", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const { getSesionUsuario } = await import("./session");
    const resultado = await getSesionUsuario();

    expect(resultado).toBeNull();
  });

  it("retorna id, email y rol cuando hay usuario y perfil", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "ana@example.com" } },
    });
    singleMock.mockResolvedValue({ data: { rol: "estudiante" } });

    const { getSesionUsuario } = await import("./session");
    const resultado = await getSesionUsuario();

    expect(resultado).toEqual({
      id: "user-1",
      email: "ana@example.com",
      rol: "estudiante",
    });
  });
});

describe("requireRol", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    singleMock.mockReset();
    redirectMock.mockReset();
  });

  it("redirige a /login si no hay sesión", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const { requireRol } = await import("./session");
    await requireRol("estudiante");

    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("redirige a /dashboard si un estudiante intenta acceder a admin", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "ana@example.com" } },
    });
    singleMock.mockResolvedValue({ data: { rol: "estudiante" } });

    const { requireRol } = await import("./session");
    await requireRol("admin");

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
