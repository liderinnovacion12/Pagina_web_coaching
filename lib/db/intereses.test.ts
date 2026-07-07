import { describe, it, expect, vi, beforeEach } from "vitest";

const insertMock = vi.fn(() => ({ error: null }));
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

describe("guardarIntereses", () => {
  beforeEach(() => {
    insertMock.mockClear();
    fromMock.mockClear();
  });

  it("no llama a Supabase si no hay sectores", async () => {
    const { guardarIntereses } = await import("./intereses");
    await guardarIntereses("user-1", []);

    expect(fromMock).not.toHaveBeenCalled();
  });

  it("inserta una fila por sector", async () => {
    const { guardarIntereses } = await import("./intereses");
    await guardarIntereses("user-1", ["liderazgo", "ventas"]);

    expect(fromMock).toHaveBeenCalledWith("usuario_intereses");
    expect(insertMock).toHaveBeenCalledWith([
      { usuario_id: "user-1", sector: "liderazgo" },
      { usuario_id: "user-1", sector: "ventas" },
    ]);
  });
});
