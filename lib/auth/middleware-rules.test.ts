import { describe, it, expect } from "vitest";
import { calcularRedireccion } from "./middleware-rules";

describe("calcularRedireccion", () => {
  it("no redirige rutas públicas sin importar el rol", () => {
    expect(calcularRedireccion("/", null)).toBeNull();
    expect(calcularRedireccion("/login", null)).toBeNull();
  });

  it("redirige a /login si no hay rol y la ruta es protegida", () => {
    expect(calcularRedireccion("/dashboard", null)).toBe("/login");
    expect(calcularRedireccion("/admin", null)).toBe("/login");
  });

  it("redirige a un estudiante fuera de /admin", () => {
    expect(calcularRedireccion("/admin", "estudiante")).toBe("/dashboard");
  });

  it("permite a un estudiante entrar a /dashboard", () => {
    expect(calcularRedireccion("/dashboard", "estudiante")).toBeNull();
  });

  it("permite a un admin entrar a /admin y a /dashboard", () => {
    expect(calcularRedireccion("/admin", "admin")).toBeNull();
    expect(calcularRedireccion("/dashboard", "admin")).toBeNull();
  });
});
