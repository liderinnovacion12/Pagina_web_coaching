import { describe, it, expect } from "vitest";
import { NAV_GROUPS } from "./nav-config";

describe("NAV_GROUPS", () => {
  it("tiene 5 grupos", () => {
    expect(NAV_GROUPS).toHaveLength(5);
  });

  it("incluye los 17 módulos del mapa de referencia en total", () => {
    const totalItems = NAV_GROUPS.reduce((suma, grupo) => suma + grupo.items.length, 0);
    expect(totalItems).toBe(17);
  });

  it("Bienvenida, Sistema 100+, Clases, Curso de Rentas, Calendario, Herramientas, Marketing, Proyectos Inmobiliarios Aliados, Aliados Estratégicos, CRM y Soporte tienen href navegable", () => {
    const conHref = NAV_GROUPS.flatMap((grupo) => grupo.items).filter((item) => item.href !== null);
    expect(conHref.map((item) => item.href).sort()).toEqual(
      [
        "/aliados",
        "/calendario",
        "/clases",
        "/crm",
        "/curso-de-rentas",
        "/dashboard",
        "/herramientas",
        "/marketing",
        "/proyectos-inmobiliarios-aliados",
        "/sistema-100",
        "/soporte",
      ].sort()
    );
  });
});
