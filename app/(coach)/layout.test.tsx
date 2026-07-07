import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const requireRolMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireRol: requireRolMock,
}));

describe("CoachLayout", () => {
  beforeEach(() => {
    requireRolMock.mockReset();
  });

  it("exige el rol coach o admin y renderiza los hijos", async () => {
    requireRolMock.mockResolvedValue({ id: "u1", email: "c@c.com", rol: "coach" });

    const CoachLayout = (await import("./layout")).default;
    const jsx = await CoachLayout({ children: <p>Contenido coach</p> });
    render(jsx);

    expect(requireRolMock).toHaveBeenCalledWith(["coach", "admin"]);
    expect(screen.getByText("Contenido coach")).toBeInTheDocument();
  });
});
