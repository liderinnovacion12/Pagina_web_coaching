export type Aliado = {
  id: string;
  servicio: string;
  descripcion: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoCorreo: string;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
  creadoEn?: string;
};

export type AliadoInput = {
  servicio: string;
  descripcion: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoCorreo: string;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
};

export type Contacto = {
  nombre: string;
  telefono: string;
  correo: string;
};

function partirLineas(texto: string): string[] {
  return texto.split("\n").map((linea) => linea.trim());
}

export function parsearContactos(
  aliado: Pick<Aliado, "contactoNombre" | "contactoTelefono" | "contactoCorreo">
): Contacto[] {
  const nombres = partirLineas(aliado.contactoNombre);
  const telefonos = partirLineas(aliado.contactoTelefono);
  const correos = partirLineas(aliado.contactoCorreo);

  return nombres
    .map((nombre, indice) => ({
      nombre,
      telefono: telefonos[indice] ?? "",
      correo: correos[indice] ?? "",
    }))
    .filter((contacto) => contacto.nombre !== "");
}
