export type ProyectoAliado = {
  id: string;
  nombre: string;
  descripcion: string;
  precioDesde: string | null;
  contactoNombre: string;
  contactoTelefono: string;
  whatsappUrl: string;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
  creadoEn?: string;
};

export type ProyectoAliadoInput = {
  nombre: string;
  descripcion: string;
  precioDesde: string | null;
  contactoNombre: string;
  contactoTelefono: string;
  whatsappUrl: string;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
};
