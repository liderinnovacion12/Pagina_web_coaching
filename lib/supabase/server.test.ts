import { describe, it, expect, vi, beforeEach } from "vitest";

const createServerClientMock = vi.fn(() => ({ mocked: "server-client" }));
const getAllMock = vi.fn(() => [{ name: "sb-token", value: "abc" }]);
const setMock = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ getAll: getAllMock, set: setMock })),
}));

describe("createClient (server)", () => {
  beforeEach(() => {
    createServerClientMock.mockClear();
    getAllMock.mockClear();
    setMock.mockClear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("crea el cliente pasando getAll/setAll respaldados por las cookies de Next", async () => {
    const { createClient } = await import("./server");
    await createClient();

    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({ cookies: expect.any(Object) })
    );

    const { cookies: cookieOptions } = createServerClientMock.mock.calls[0][2];
    expect(cookieOptions.getAll()).toEqual([{ name: "sb-token", value: "abc" }]);

    cookieOptions.setAll([{ name: "sb-token", value: "xyz", options: {} }]);
    expect(setMock).toHaveBeenCalledWith("sb-token", "xyz", {});
  });
});
