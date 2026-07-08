import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecuperarPasswordForm } from "./RecuperarPasswordForm";
import * as actions from "./actions";

vi.mock("./actions", () => ({
  solicitarRecuperacion: vi.fn(),
}));

describe("RecuperarPasswordForm", () => {
  beforeEach(() => {
    vi.mocked(actions.solicitarRecuperacion).mockReset();
  });

  it("muestra un error si el correo es inválido", async () => {
    vi.mocked(actions.solicitarRecuperacion).mockResolvedValue({
      enviado: false,
      error: "Ingresa un correo electrónico válido.",
    });

    render(<RecuperarPasswordForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "no-es-un-correo" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    );

    expect(
      await screen.findByText("Ingresa un correo electrónico válido.")
    ).toBeInTheDocument();
  });

  it("muestra el mensaje de confirmación tras enviar un correo válido", async () => {
    vi.mocked(actions.solicitarRecuperacion).mockResolvedValue({
      enviado: true,
      error: null,
    });

    render(<RecuperarPasswordForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    );

    expect(
      await screen.findByText(/recibirás instrucciones/i)
    ).toBeInTheDocument();
  });
});
