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
    expect(calcularRedireccion("/coach", null)).toBe("/login");
  });

  it("redirige a un estudiante fuera de /admin", () => {
    expect(calcularRedireccion("/admin", "estudiante")).toBe("/dashboard");
  });

  it("redirige a un estudiante fuera de /coach", () => {
    expect(calcularRedireccion("/coach", "estudiante")).toBe("/dashboard");
  });

  it("redirige a un coach fuera de /admin", () => {
    expect(calcularRedireccion("/admin", "coach")).toBe("/coach");
  });

  it("permite a un estudiante entrar a /dashboard", () => {
    expect(calcularRedireccion("/dashboard", "estudiante")).toBeNull();
  });

  it("permite a un coach entrar a /coach y a /dashboard", () => {
    expect(calcularRedireccion("/coach", "coach")).toBeNull();
    expect(calcularRedireccion("/dashboard", "coach")).toBeNull();
  });

  it("permite a un admin entrar a /admin, /coach y /dashboard", () => {
    expect(calcularRedireccion("/admin", "admin")).toBeNull();
    expect(calcularRedireccion("/coach", "admin")).toBeNull();
    expect(calcularRedireccion("/dashboard", "admin")).toBeNull();
  });

  it("redirige a /login si no hay rol en /sistema-100, /clases o /cursos", () => {
    expect(calcularRedireccion("/sistema-100", null)).toBe("/login");
    expect(calcularRedireccion("/clases", null)).toBe("/login");
    expect(calcularRedireccion("/cursos/c1", null)).toBe("/login");
  });

  it("permite a un estudiante entrar a /sistema-100, /clases y /cursos", () => {
    expect(calcularRedireccion("/sistema-100", "estudiante")).toBeNull();
    expect(calcularRedireccion("/clases", "estudiante")).toBeNull();
    expect(calcularRedireccion("/cursos/c1/lecciones/l1", "estudiante")).toBeNull();
  });
});
