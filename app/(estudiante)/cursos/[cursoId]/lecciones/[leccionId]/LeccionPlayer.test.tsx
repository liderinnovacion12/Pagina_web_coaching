import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LeccionPlayer } from "./LeccionPlayer";

const marcarProgresoActionMock = vi.fn();

vi.mock("./actions", () => ({
  marcarProgresoAction: (...args: unknown[]) => marcarProgresoActionMock(...args),
}));

vi.mock("@mux/mux-player-react", () => ({
  default: () => <div data-testid="mux-player" />,
}));

describe("LeccionPlayer", () => {
  beforeEach(() => {
    marcarProgresoActionMock.mockReset();
  });

  it("muestra el reproductor de Mux cuando hay muxAssetId", () => {
    render(
      <LeccionPlayer leccionId="l1" muxAssetId="mux-123" completado={false} />
    );

    expect(screen.getByTestId("mux-player")).toBeInTheDocument();
    expect(screen.queryByText("Video no disponible todavía")).not.toBeInTheDocument();
  });

  it("muestra el estado de fallback y permite marcar como completada sin muxAssetId", async () => {
    marcarProgresoActionMock.mockResolvedValue({ error: null });

    render(<LeccionPlayer leccionId="l1" muxAssetId={null} completado={false} />);

    expect(screen.getByText("Video no disponible todavía")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /marcar como completada/i }));

    await waitFor(() =>
      expect(marcarProgresoActionMock).toHaveBeenCalledWith("l1", { completado: true })
    );
  });

  it("muestra 'Completada' si ya estaba completada", () => {
    render(<LeccionPlayer leccionId="l1" muxAssetId={null} completado={true} />);

    expect(screen.getByText("Completada")).toBeInTheDocument();
  });
});
