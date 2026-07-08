import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ActualizarPasswordForm } from "./ActualizarPasswordForm";
import * as actions from "./actions";

vi.mock("./actions", () => ({
  actualizarPassword: vi.fn(),
}));

describe("ActualizarPasswordForm", () => {
  beforeEach(() => {
    vi.mocked(actions.actualizarPassword).mockReset();
  });

  it("envía la nueva contraseña y su confirmación", async () => {
    vi.mocked(actions.actualizarPassword).mockResolvedValue({ error: null });

    render(<ActualizarPasswordForm />);

    fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /guardar contraseña/i })
    );

    await waitFor(() => expect(actions.actualizarPassword).toHaveBeenCalled());
  });

  it("muestra el error devuelto por la acción", async () => {
    vi.mocked(actions.actualizarPassword).mockResolvedValue({
      error: "Las contraseñas no coinciden.",
    });

    render(<ActualizarPasswordForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /guardar contraseña/i })
    );

    expect(
      await screen.findByText("Las contraseñas no coinciden.")
    ).toBeInTheDocument();
  });
});
