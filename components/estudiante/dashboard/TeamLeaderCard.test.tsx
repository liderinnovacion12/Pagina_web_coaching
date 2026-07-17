import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamLeaderCard } from "./TeamLeaderCard";
import type { MiembroEquipo } from "@/lib/db/equipo";

const useReducedMotionSafeMock = vi.fn().mockReturnValue(false);

vi.mock("@/lib/motion", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/motion")>("@/lib/motion");
  return {
    ...actual,
    useReducedMotionSafe: () => useReducedMotionSafeMock(),
  };
});

const miembro: MiembroEquipo = {
  id: "m1",
  nombre: "Wilmar Sosa",
  cargo: "Ventas y Liderazgo",
  descripcionCargo: "Agente inmobiliario, top producer y coach en liderazgo.",
  telefono: "+10000000000",
  correo: "wilmar@example.com",
  fotoUrl: "/images/cultura/wilmar-sosa.jpg",
};

describe("TeamLeaderCard", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza nombre, cargo y telefono clicable", () => {
    render(<TeamLeaderCard miembro={miembro} variants={{}} />);

    expect(
      screen.getByRole("heading", { name: "Wilmar Sosa" })
    ).toBeInTheDocument();
    expect(screen.getByText("Ventas y Liderazgo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+10000000000" })).toHaveAttribute(
      "href",
      "tel:+10000000000"
    );
  });

  it("renderiza la foto con el alt correcto", () => {
    render(<TeamLeaderCard miembro={miembro} variants={{}} />);
    expect(screen.getByAltText("Wilmar Sosa")).toBeInTheDocument();
  });

  it("no rompe el render cuando el usuario prefiere reduced motion", () => {
    useReducedMotionSafeMock.mockReturnValue(true);
    render(<TeamLeaderCard miembro={miembro} variants={{}} />);
    expect(
      screen.getByRole("heading", { name: "Wilmar Sosa" })
    ).toBeInTheDocument();
  });
});
