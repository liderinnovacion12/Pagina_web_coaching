import { describe, it, expect, vi, beforeEach } from "vitest";

const signOutMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signOut: signOutMock } })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("cerrarSesion", () => {
  beforeEach(() => {
    signOutMock.mockReset();
    redirectMock.mockReset();
  });

  it("cierra la sesión en Supabase y redirige a /login", async () => {
    const { cerrarSesion } = await import("./actions");
    await cerrarSesion();

    expect(signOutMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
