import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const requireRolMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireRol: requireRolMock,
}));

describe("AdminLayout", () => {
  beforeEach(() => {
    requireRolMock.mockReset();
  });

  it("exige el rol admin y renderiza los hijos", async () => {
    requireRolMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "admin" });

    const AdminLayout = (await import("./layout")).default;
    const jsx = await AdminLayout({ children: <p>Contenido admin</p> });
    render(jsx);

    expect(requireRolMock).toHaveBeenCalledWith("admin");
    expect(screen.getByText("Contenido admin")).toBeInTheDocument();
  });
});
