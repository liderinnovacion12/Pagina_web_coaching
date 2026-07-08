import { describe, it, expect, vi, beforeEach } from "vitest";

const resetPasswordForEmailMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { resetPasswordForEmail: resetPasswordForEmailMock },
  })),
}));

function formDataDe(email: string) {
  const fd = new FormData();
  fd.set("email", email);
  return fd;
}

describe("solicitarRecuperacion", () => {
  beforeEach(() => {
    resetPasswordForEmailMock.mockReset();
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  });

  it("devuelve error si el correo tiene formato inválido", async () => {
    const { solicitarRecuperacion } = await import("./actions");
    const resultado = await solicitarRecuperacion(
      { enviado: false, error: null },
      formDataDe("no-es-un-correo")
    );

    expect(resultado).toEqual({
      enviado: false,
      error: "Ingresa un correo electrónico válido.",
    });
    expect(resetPasswordForEmailMock).not.toHaveBeenCalled();
  });

  it("llama a resetPasswordForEmail con el redirectTo correcto y responde con éxito", async () => {
    resetPasswordForEmailMock.mockResolvedValue({ data: {}, error: null });

    const { solicitarRecuperacion } = await import("./actions");
    const resultado = await solicitarRecuperacion(
      { enviado: false, error: null },
      formDataDe("ana@example.com")
    );

    expect(resetPasswordForEmailMock).toHaveBeenCalledWith("ana@example.com", {
      redirectTo: "http://localhost:3000/auth/callback?next=/actualizar-password",
    });
    expect(resultado).toEqual({ enviado: true, error: null });
  });

  it("responde con éxito aunque Supabase devuelva un error (no revela si el correo existe)", async () => {
    resetPasswordForEmailMock.mockResolvedValue({
      data: {},
      error: { message: "user not found" },
    });

    const { solicitarRecuperacion } = await import("./actions");
    const resultado = await solicitarRecuperacion(
      { enviado: false, error: null },
      formDataDe("nadie@example.com")
    );

    expect(resultado).toEqual({ enviado: true, error: null });
  });
});
