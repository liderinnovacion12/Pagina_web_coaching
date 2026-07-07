import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const requireRolMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireRol: requireRolMock,
}));

describe("EstudianteLayout", () => {
  beforeEach(() => {
    requireRolMock.mockReset();
  });

  it("exige el rol estudiante y renderiza los hijos", async () => {
    requireRolMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "estudiante" });

    const EstudianteLayout = (await import("./layout")).default;
    const jsx = await EstudianteLayout({ children: <p>Contenido</p> });
    render(jsx);

    expect(requireRolMock).toHaveBeenCalledWith("estudiante");
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
