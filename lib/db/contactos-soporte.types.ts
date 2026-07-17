export type ContactoSoporte = {
  id: string;
  nombre: string;
  cargo: string;
  descripcionCargo: string;
  telefono: string;
  correo: string;
  fotoUrl: string | null;
  orden: number;
  activo: boolean;
  creadoEn?: string;
};

export type ContactoSoporteInput = {
  nombre: string;
  cargo: string;
  descripcionCargo: string;
  telefono: string;
  correo: string;
  fotoUrl: string | null;
  orden: number;
  activo: boolean;
};
