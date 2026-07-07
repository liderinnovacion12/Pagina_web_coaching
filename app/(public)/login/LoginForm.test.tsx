import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import * as actions from "./actions";

vi.mock("./actions", () => ({
  login: vi.fn(),
  loginConGoogle: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.mocked(actions.login).mockReset();
    vi.mocked(actions.loginConGoogle).mockReset();
  });

  it("envía el formulario con email y password", async () => {
    vi.mocked(actions.login).mockResolvedValue({ error: null });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => expect(actions.login).toHaveBeenCalled());
  });

  it("muestra el error devuelto por la acción", async () => {
    vi.mocked(actions.login).mockResolvedValue({
      error: "Correo o contraseña incorrectos.",
    });

    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(
      await screen.findByText("Correo o contraseña incorrectos.")
    ).toBeInTheDocument();
  });

  it("llama a loginConGoogle al hacer clic en el botón de Google", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /continuar con google/i }));

    expect(actions.loginConGoogle).toHaveBeenCalled();
  });
});
