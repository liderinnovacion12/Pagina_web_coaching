import { describe, it, expect } from "vitest";
import { parsearContactos } from "./aliados.types";

describe("parsearContactos", () => {
  it("retorna un solo contacto cuando las tres columnas tienen una línea", () => {
    const resultado = parsearContactos({
      contactoNombre: "Rafael Aguilera",
      contactoTelefono: "+1 (305) 297-5104",
      contactoCorreo: "raguilera@cfmtg.com",
    });

    expect(resultado).toEqual([
      { nombre: "Rafael Aguilera", telefono: "+1 (305) 297-5104", correo: "raguilera@cfmtg.com" },
    ]);
  });

  it("retorna varios contactos alineados por línea", () => {
    const resultado = parsearContactos({
      contactoNombre: "Anahis\nAntonio",
      contactoTelefono: "+1 (478) 412-5213\n+1 (832) 299-5129",
      contactoCorreo: "Anahis@keepitsimple.properties\nAntonio@keepitsimple.properties",
    });

    expect(resultado).toEqual([
      { nombre: "Anahis", telefono: "+1 (478) 412-5213", correo: "Anahis@keepitsimple.properties" },
      { nombre: "Antonio", telefono: "+1 (832) 299-5129", correo: "Antonio@keepitsimple.properties" },
    ]);
  });

  it("recorta espacios extra en cada línea", () => {
    const resultado = parsearContactos({
      contactoNombre: "  Rafael Aguilera  ",
      contactoTelefono: "  +1 (305) 297-5104  ",
      contactoCorreo: "  raguilera@cfmtg.com  ",
    });

    expect(resultado).toEqual([
      { nombre: "Rafael Aguilera", telefono: "+1 (305) 297-5104", correo: "raguilera@cfmtg.com" },
    ]);
  });

  it("usa cadena vacía si falta el teléfono o correo de un contacto", () => {
    const resultado = parsearContactos({
      contactoNombre: "Anahis\nAntonio",
      contactoTelefono: "+1 (478) 412-5213",
      contactoCorreo: "Anahis@keepitsimple.properties\nAntonio@keepitsimple.properties",
    });

    expect(resultado).toEqual([
      { nombre: "Anahis", telefono: "+1 (478) 412-5213", correo: "Anahis@keepitsimple.properties" },
      { nombre: "Antonio", telefono: "", correo: "Antonio@keepitsimple.properties" },
    ]);
  });

  it("mantiene la alineación cuando una línea intermedia está vacía", () => {
    const resultado = parsearContactos({
      contactoNombre: "A\nB\nC",
      contactoTelefono: "T1\n\nT3",
      contactoCorreo: "E1\nE2\nE3",
    });

    expect(resultado).toEqual([
      { nombre: "A", telefono: "T1", correo: "E1" },
      { nombre: "B", telefono: "", correo: "E2" },
      { nombre: "C", telefono: "T3", correo: "E3" },
    ]);
  });

  it("mantiene la alineación cuando una línea de nombre intermedia está vacía", () => {
    const resultado = parsearContactos({
      contactoNombre: "A\n\nC",
      contactoTelefono: "T1\nT2\nT3",
      contactoCorreo: "E1\nE2\nE3",
    });

    expect(resultado).toEqual([
      { nombre: "A", telefono: "T1", correo: "E1" },
      { nombre: "C", telefono: "T3", correo: "E3" },
    ]);
  });
});
