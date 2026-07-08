import { describe, it, expect, vi, beforeEach } from "vitest";

const exchangeCodeForSessionMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession: exchangeCodeForSessionMock },
  })),
}));

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSessionMock.mockReset();
  });

  it("redirige a /login?error=oauth si no hay code", async () => {
    const { GET } = await import("./route");
    const respuesta = await GET(new Request("http://localhost/auth/callback"));

    expect(respuesta.status).toBe(307);
    expect(respuesta.headers.get("location")).toBe(
      "http://localhost/login?error=oauth"
    );
    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled();
  });

  it("intercambia el code y redirige a /dashboard cuando no hay next", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });

    const { GET } = await import("./route");
    const respuesta = await GET(
      new Request("http://localhost/auth/callback?code=abc123")
    );

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith("abc123");
    expect(respuesta.headers.get("location")).toBe(
      "http://localhost/dashboard"
    );
  });

  it("intercambia el code y redirige al next indicado", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });

    const { GET } = await import("./route");
    const respuesta = await GET(
      new Request(
        "http://localhost/auth/callback?code=abc123&next=/actualizar-password"
      )
    );

    expect(respuesta.headers.get("location")).toBe(
      "http://localhost/actualizar-password"
    );
  });
});
