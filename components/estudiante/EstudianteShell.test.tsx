import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EstudianteShell } from "./EstudianteShell";

const cerrarSesionMock = vi.fn();

vi.mock("@/lib/auth/actions", () => ({
  cerrarSesion: (...args: unknown[]) => cerrarSesionMock(...args),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("EstudianteShell", () => {
  beforeEach(() => {
    cerrarSesionMock.mockReset();
  });

  it("renderiza el logo, el email del usuario y el contenido", () => {
    render(
      <EstudianteShell email="ana@example.com">
        <p>Contenido de la página</p>
      </EstudianteShell>
    );

    expect(screen.getByText("PRO")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("Contenido de la página")).toBeInTheDocument();
  });

  it("abre el panel de un grupo al hacer click y muestra sus ítems", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    fireEvent.click(screen.getByRole("button", { name: /formación/i }));

    expect(screen.getByRole("link", { name: "Sistema 100+" })).toHaveAttribute(
      "href",
      "/sistema-100"
    );
  });

  it("los ítems sin página construida no son navegables y están deshabilitados", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    fireEvent.click(screen.getByRole("button", { name: /formación/i }));

    const item = screen.getByText("Curso de Rentas");
    expect(item.tagName).not.toBe("A");
    expect(item).toHaveAttribute("aria-disabled", "true");
    expect(item).toHaveAttribute("title", "Próximamente");
  });

  it("cierra el panel abierto al hacer click afuera", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    fireEvent.click(screen.getByRole("button", { name: /formación/i }));
    expect(screen.getByRole("link", { name: "Clases" })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("link", { name: "Clases" })).not.toBeInTheDocument();
  });

  it("cierra el panel abierto con Escape", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    fireEvent.click(screen.getByRole("button", { name: /formación/i }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("link", { name: "Clases" })).not.toBeInTheDocument();
  });

  it("abre y cierra el overlay móvil", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(screen.getByRole("button", { name: "Cerrar menú" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar menú" }));
    expect(screen.queryByRole("button", { name: "Cerrar menú" })).not.toBeInTheDocument();
  });

  it("envía el formulario de cerrar sesión", () => {
    render(<EstudianteShell email="ana@example.com"><p>Contenido</p></EstudianteShell>);

    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
  });
});
