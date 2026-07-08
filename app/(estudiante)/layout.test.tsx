import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const requireRolMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireRol: requireRolMock,
}));

vi.mock("@/components/estudiante/EstudianteShell", () => ({
  EstudianteShell: ({ email, children }: { email: string; children: React.ReactNode }) => (
    <div data-testid="shell" data-email={email}>
      {children}
    </div>
  ),
}));

describe("EstudianteLayout", () => {
  beforeEach(() => {
    requireRolMock.mockReset();
  });

  it("exige el rol estudiante y renderiza el shell con los hijos", async () => {
    requireRolMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "estudiante" });

    const EstudianteLayout = (await import("./layout")).default;
    const jsx = await EstudianteLayout({ children: <p>Contenido</p> });
    render(jsx);

    expect(requireRolMock).toHaveBeenCalledWith("estudiante");
    expect(screen.getByTestId("shell")).toHaveAttribute("data-email", "a@a.com");
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
