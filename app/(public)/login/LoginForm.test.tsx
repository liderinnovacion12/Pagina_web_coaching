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

  it("envía el formulario con email y password válidos", async () => {
    vi.mocked(actions.login).mockResolvedValue({ error: null });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(actions.login).toHaveBeenCalled());
  });

  it("muestra errores de validación y no envía si el correo o la contraseña están vacíos", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(
      screen.getByText("Ingresa tu correo electrónico.")
    ).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu contraseña.")).toBeInTheDocument();
    expect(actions.login).not.toHaveBeenCalled();
  });

  it("muestra error de validación si el correo tiene formato inválido", () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "no-es-un-correo" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(
      screen.getByText("Ingresa un correo electrónico válido.")
    ).toBeInTheDocument();
    expect(actions.login).not.toHaveBeenCalled();
  });

  it("muestra el error devuelto por la acción", async () => {
    vi.mocked(actions.login).mockResolvedValue({
      error: "Correo o contraseña incorrectos.",
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(
      await screen.findByText("Correo o contraseña incorrectos.")
    ).toBeInTheDocument();
  });

  it("llama a loginConGoogle al hacer clic en el botón de Google", () => {
    render(<LoginForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /continuar con google/i })
    );

    expect(actions.loginConGoogle).toHaveBeenCalled();
  });

  it("muestra un banner de éxito cuando mostrarResetOk es true", () => {
    render(<LoginForm mostrarResetOk />);

    expect(
      screen.getByText(/contraseña actualizada/i)
    ).toBeInTheDocument();
  });
});
