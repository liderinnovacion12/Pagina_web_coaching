import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const updateUserMock = vi.fn();
const signOutMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: getUserMock,
      updateUser: updateUserMock,
      signOut: signOutMock,
    },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

function formDataDe(password: string, confirmacion: string) {
  const fd = new FormData();
  fd.set("password", password);
  fd.set("confirmacion", confirmacion);
  return fd;
}

describe("actualizarPassword", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    updateUserMock.mockReset();
    signOutMock.mockReset();
    redirectMock.mockReset();
  });

  it("devuelve error si la contraseña tiene menos de 8 caracteres", async () => {
    const { actualizarPassword } = await import("./actions");
    const resultado = await actualizarPassword(
      { error: null },
      formDataDe("1234567", "1234567")
    );

    expect(resultado.error).toBe(
      "La contraseña debe tener al menos 8 caracteres."
    );
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("devuelve error si las contraseñas no coinciden", async () => {
    const { actualizarPassword } = await import("./actions");
    const resultado = await actualizarPassword(
      { error: null },
      formDataDe("clave1234", "clave9999")
    );

    expect(resultado.error).toBe("Las contraseñas no coinciden.");
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("redirige a /login?error=recovery si no hay sesión activa", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const { actualizarPassword } = await import("./actions");
    await actualizarPassword(
      { error: null },
      formDataDe("clave1234", "clave1234")
    );

    expect(redirectMock).toHaveBeenCalledWith("/login?error=recovery");
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("devuelve error si Supabase rechaza la actualización", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    updateUserMock.mockResolvedValue({ error: { message: "fail" } });

    const { actualizarPassword } = await import("./actions");
    const resultado = await actualizarPassword(
      { error: null },
      formDataDe("clave1234", "clave1234")
    );

    expect(resultado.error).toBe(
      "No se pudo actualizar la contraseña. Intenta de nuevo."
    );
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("cierra la sesión y redirige a /login?reset=ok cuando la actualización es exitosa", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    updateUserMock.mockResolvedValue({ error: null });

    const { actualizarPassword } = await import("./actions");
    await actualizarPassword(
      { error: null },
      formDataDe("clave1234", "clave1234")
    );

    expect(updateUserMock).toHaveBeenCalledWith({ password: "clave1234" });
    expect(signOutMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/login?reset=ok");
  });
});
