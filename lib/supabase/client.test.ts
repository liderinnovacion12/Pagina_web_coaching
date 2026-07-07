import { describe, it, expect, vi, beforeEach } from "vitest";

const createBrowserClientMock = vi.fn(() => ({ mocked: "browser-client" }));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: createBrowserClientMock,
}));

describe("createClient (browser)", () => {
  beforeEach(() => {
    createBrowserClientMock.mockClear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("crea el cliente con la URL y la anon key del entorno", async () => {
    const { createClient } = await import("./client");
    const result = createClient();

    expect(createBrowserClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key"
    );
    expect(result).toEqual({ mocked: "browser-client" });
  });
});
