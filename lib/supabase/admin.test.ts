import { describe, it, expect, vi, beforeEach } from "vitest";

const createClientMock = vi.fn(() => ({ mocked: "admin-client" }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("createAdminClient", () => {
  beforeEach(() => {
    createClientMock.mockClear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  it("crea el cliente con la service role key y sin persistencia de sesión", async () => {
    const { createAdminClient } = await import("./admin");
    createAdminClient();

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role-key",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  });
});
