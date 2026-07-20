import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HerramientasHub } from "./HerramientasHub";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";

function crearGrupo(overrides: Partial<GrupoComunidad> & { id: string; nombre: string }): GrupoComunidad {
  return {
    categoria: "miami",
    detalle: null,
    tipoCanal: "whatsapp",
    enlaceUrl: null,
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const GRUPOS: GrupoComunidad[] = [
  crearGrupo({ id: "principal", nombre: "Grupo Principal del Equipo", categoria: "grupo_principal" }),
  crearGrupo({ id: "m1", nombre: "Domus", categoria: "miami", detalle: "Miami" }),
  crearGrupo({ id: "m2", nombre: "Botanic Residences", categoria: "miami", detalle: "Miami" }),
  crearGrupo({ id: "o1", nombre: "Millenia Park", categoria: "orlando_centro_florida", detalle: "Residencial" }),
];

describe("HerramientasHub", () => {
  it("no repite el grupo principal en el grid de proyectos", () => {
    render(<HerramientasHub grupos={GRUPOS} />);
    expect(screen.getAllByText("Grupo Principal del Equipo")).toHaveLength(1);
  });

  it("filtra por texto de búsqueda", () => {
    render(<HerramientasHub grupos={GRUPOS} />);

    fireEvent.change(screen.getByLabelText("Buscar grupo"), { target: { value: "domus" } });

    expect(screen.getByText("Domus")).toBeInTheDocument();
    expect(screen.queryByText("Botanic Residences")).not.toBeInTheDocument();
  });

  it("filtra por categoría con los chips", () => {
    render(<HerramientasHub grupos={GRUPOS} />);

    fireEvent.click(screen.getByRole("button", { name: /Orlando y Centro de Florida/ }));

    expect(screen.getByText("Millenia Park")).toBeInTheDocument();
    expect(screen.queryByText("Domus")).not.toBeInTheDocument();
  });

  it("muestra estado vacío si no hay resultados", () => {
    render(<HerramientasHub grupos={GRUPOS} />);

    fireEvent.change(screen.getByLabelText("Buscar grupo"), { target: { value: "no existe" } });

    expect(screen.getByText("No encontramos grupos con ese nombre.")).toBeInTheDocument();
  });

  it("pagina los resultados de a 12", () => {
    const muchosGrupos: GrupoComunidad[] = Array.from({ length: 13 }, (_, indice) =>
      crearGrupo({
        id: `p${indice}`,
        nombre: `Proyecto ${String(indice).padStart(2, "0")}`,
        categoria: "miami",
      })
    );
    render(<HerramientasHub grupos={muchosGrupos} />);

    expect(screen.queryByText("Proyecto 12")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(screen.getByText("Proyecto 12")).toBeInTheDocument();
  });

  it("muestra el indicador 'En vivo' en el banner", () => {
    render(<HerramientasHub grupos={GRUPOS} />);
    expect(screen.getByText("En vivo")).toBeInTheDocument();
  });

  it("muestra el conteo real de grupos activos en el banner", () => {
    render(<HerramientasHub grupos={GRUPOS} />);
    const etiqueta = screen.getByText("Grupos activos");
    expect(etiqueta.parentElement).toHaveTextContent("3");
  });

  it("el conteo de grupos activos del banner es accesible para lectores de pantalla (ya no hay IndicadoresPanel que lo repita accesiblemente)", () => {
    render(<HerramientasHub grupos={GRUPOS} />);
    const etiqueta = screen.getByText("Grupos activos");
    expect(etiqueta.parentElement).not.toHaveAttribute("aria-hidden");
  });

  it("ya no muestra el panel de estadisticas junto a la tarjeta principal", () => {
    render(<HerramientasHub grupos={GRUPOS} />);
    expect(screen.queryByText("Grupos")).not.toBeInTheDocument();
  });
});
