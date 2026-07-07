import { describe, it, expect, vi, beforeEach } from "vitest";

const signUpMock = vi.fn();
const redirectMock = vi.fn();
const guardarInteresesMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signUp: signUpMock } })),
}));

vi.mock("@/lib/db/intereses", () => ({
  guardarIntereses: guardarInteresesMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

function formDataDe(campos: { email?: string; password?: string; intereses?: string[] }) {
  const fd = new FormData();
  if (campos.email !== undefined) fd.set("email", campos.email);
  if (campos.password !== undefined) fd.set("password", campos.password);
  (campos.intereses ?? []).forEach((valor) => fd.append("intereses", valor));
  return fd;
}

describe("registrar", () => {
  beforeEach(() => {
    signUpMock.mockReset();
    redirectMock.mockReset();
    guardarInteresesMock.mockReset();
  });

  it("devuelve error si falta el email o el password", async () => {
    const { registrar } = await import("./actions");
    const resultado = await registrar({ error: null }, formDataDe({}));

    expect(resultado.error).toBe("Ingresa tu correo y contraseña.");
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("devuelve error si el password es muy corto", async () => {
    const { registrar } = await import("./actions");
    const resultado = await registrar(
      { error: null },
      formDataDe({ email: "ana@example.com", password: "1234567" })
    );

    expect(resultado.error).toBe("La contraseña debe tener al menos 8 caracteres.");
  });

  it("devuelve error si Supabase rechaza el signUp", async () => {
    signUpMock.mockResolvedValue({ data: { user: null }, error: { message: "duplicate" } });

    const { registrar } = await import("./actions");
    const resultado = await registrar(
      { error: null },
      formDataDe({ email: "ana@example.com", password: "clave1234" })
    );

    expect(resultado.error).toBe("No se pudo completar el registro. Intenta de nuevo.");
  });

  it("guarda intereses válidos y redirige a /dashboard", async () => {
    signUpMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

    const { registrar } = await import("./actions");
    await registrar(
      { error: null },
      formDataDe({
        email: "ana@example.com",
        password: "clave1234",
        intereses: ["liderazgo", "no-valido"],
      })
    );

    expect(guardarInteresesMock).toHaveBeenCalledWith("user-1", ["liderazgo"]);
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
