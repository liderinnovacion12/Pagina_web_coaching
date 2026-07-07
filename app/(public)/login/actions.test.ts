import { describe, it, expect, vi, beforeEach } from "vitest";

const signInWithPasswordMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signInWithPassword: signInWithPasswordMock },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

function formDataDe(valores: Record<string, string>) {
  const fd = new FormData();
  Object.entries(valores).forEach(([clave, valor]) => fd.set(clave, valor));
  return fd;
}

describe("login", () => {
  beforeEach(() => {
    signInWithPasswordMock.mockReset();
    redirectMock.mockReset();
  });

  it("devuelve error si falta el email o el password", async () => {
    const { login } = await import("./actions");
    const resultado = await login(
      { error: null },
      formDataDe({ email: "", password: "" })
    );

    expect(resultado.error).toBe("Ingresa tu correo y contraseña.");
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it("devuelve error si Supabase rechaza las credenciales", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: { message: "bad creds" } });

    const { login } = await import("./actions");
    const resultado = await login(
      { error: null },
      formDataDe({ email: "ana@example.com", password: "clave1234" })
    );

    expect(resultado.error).toBe("Correo o contraseña incorrectos.");
  });

  it("redirige a /dashboard cuando el login es correcto", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });

    const { login } = await import("./actions");
    await login(
      { error: null },
      formDataDe({ email: "ana@example.com", password: "clave1234" })
    );

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
