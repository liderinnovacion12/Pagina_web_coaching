import { describe, it, expect, vi, beforeEach } from "vitest";

const createUserMock = vi.fn(async () => ({
  data: { user: { id: "user-123" } },
  error: null,
}));
const eqMock = vi.fn(() => ({ error: null }));
const updateMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ update: updateMock }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { admin: { createUser: createUserMock } },
    from: fromMock,
  })),
}));

describe("seedAdmin", () => {
  beforeEach(() => {
    createUserMock.mockClear();
    updateMock.mockClear();
    eqMock.mockClear();
    fromMock.mockClear();
  });

  it("crea el usuario admin y promueve su rol", async () => {
    const { seedAdmin } = await import("./seed-admin.mjs");

    await seedAdmin({
      email: "admin@coachpro.demo",
      password: "clave-segura-123",
      supabaseUrl: "https://example.supabase.co",
      serviceRoleKey: "service-role-key",
    });

    expect(createUserMock).toHaveBeenCalledWith({
      email: "admin@coachpro.demo",
      password: "clave-segura-123",
      email_confirm: true,
    });
    expect(fromMock).toHaveBeenCalledWith("usuarios");
    expect(updateMock).toHaveBeenCalledWith({ rol: "admin" });
    expect(eqMock).toHaveBeenCalledWith("id", "user-123");
  });
});
