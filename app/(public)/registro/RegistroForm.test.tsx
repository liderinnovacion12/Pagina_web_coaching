import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegistroForm } from "./RegistroForm";
import * as actions from "./actions";

vi.mock("./actions", () => ({
  registrar: vi.fn(),
}));

describe("RegistroForm", () => {
  beforeEach(() => {
    vi.mocked(actions.registrar).mockReset();
  });

  it("envía email, password e intereses seleccionados", async () => {
    vi.mocked(actions.registrar).mockResolvedValue({ error: null });

    render(<RegistroForm />);

    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(screen.getByLabelText("Liderazgo"));
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => expect(actions.registrar).toHaveBeenCalled());
  });

  it("muestra el error devuelto por la acción", async () => {
    vi.mocked(actions.registrar).mockResolvedValue({
      error: "La contraseña debe tener al menos 8 caracteres.",
    });

    render(<RegistroForm />);
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(
      await screen.findByText("La contraseña debe tener al menos 8 caracteres.")
    ).toBeInTheDocument();
  });
});
