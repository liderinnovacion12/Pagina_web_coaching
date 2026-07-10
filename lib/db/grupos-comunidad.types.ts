export type CategoriaGrupoComunidad =
  | "grupo_principal"
  | "miami"
  | "orlando_centro_florida"
  | "venta_renta"
  | "otros";

export type CanalGrupoComunidad = "whatsapp" | "dropbox";

export const ETIQUETA_CATEGORIA: Record<CategoriaGrupoComunidad, string> = {
  grupo_principal: "Grupo Principal",
  miami: "Miami",
  orlando_centro_florida: "Orlando y Centro de Florida",
  venta_renta: "Venta y Renta",
  otros: "Otros",
};

export type GrupoComunidad = {
  id: string;
  nombre: string;
  categoria: CategoriaGrupoComunidad;
  detalle: string | null;
  tipoCanal: CanalGrupoComunidad;
  enlaceUrl: string | null;
  orden: number;
  activo: boolean;
  creadoEn?: string;
};

export type GrupoComunidadInput = {
  nombre: string;
  categoria: CategoriaGrupoComunidad;
  detalle: string | null;
  tipoCanal: CanalGrupoComunidad;
  enlaceUrl: string | null;
  orden: number;
  activo: boolean;
};
