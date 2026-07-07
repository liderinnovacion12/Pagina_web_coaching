import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecuperarPasswordForm } from "./RecuperarPasswordForm";

describe("RecuperarPasswordForm", () => {
  it("muestra un error si el correo es inválido", () => {
    render(<RecuperarPasswordForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "no-es-un-correo" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    );

    expect(
      screen.getByText("Ingresa un correo electrónico válido.")
    ).toBeInTheDocument();
  });

  it("muestra el mensaje de confirmación tras enviar un correo válido", () => {
    render(<RecuperarPasswordForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    );

    expect(screen.getByText(/recibirás instrucciones/i)).toBeInTheDocument();
  });
});
