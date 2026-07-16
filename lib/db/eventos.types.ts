export type CategoriaEvento = "internacional" | "nacional_eeuu";

export type FechaEvento = {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
};

export type FechaEventoInput = {
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
};

export type Evento = {
  id: string;
  categoria: CategoriaEvento;
  titulo: string;
  subtitulo: string;
  youtubeUrl: string | null;
  orden: number;
  activo: boolean;
  creadoEn?: string;
  fechas: FechaEvento[];
};

export type EventoInput = {
  categoria: CategoriaEvento;
  titulo: string;
  subtitulo: string;
  youtubeUrl: string | null;
  orden: number;
  activo: boolean;
  fechas: FechaEventoInput[];
};

export const CATEGORIA_EVENTO_INFO: Record<CategoriaEvento, { titulo: string; subtitulo: string }> = {
  internacional: {
    titulo: "Eventos Internacionales",
    subtitulo: "Conferencias y eventos fuera de EE.UU.",
  },
  nacional_eeuu: {
    titulo: "Eventos Nacionales en EE.UU.",
    subtitulo: "Conferencias y networking dentro de Estados Unidos",
  },
};

export type EstadoFecha = "realizado" | "en_ejecucion" | "proximo";

export function calcularEstadoFecha(fechaInicio: string, fechaFin: string, hoyIso: string): EstadoFecha {
  if (hoyIso < fechaInicio) return "proximo";
  if (hoyIso > fechaFin) return "realizado";
  return "en_ejecucion";
}

export function extraerIdVideoYoutube(url: string): string | null {
  const coincidenciaParametro = url.match(/[?&]v=([^&]+)/);
  if (coincidenciaParametro) return coincidenciaParametro[1];

  const coincidenciaRutaCorta = url.match(/youtu\.be\/([^?&/]+)/);
  if (coincidenciaRutaCorta) return coincidenciaRutaCorta[1];

  const coincidenciaEmbed = url.match(/\/embed\/([^?&/]+)/);
  if (coincidenciaEmbed) return coincidenciaEmbed[1];

  return null;
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function formatearRangoFecha(fechaInicio: string, fechaFin: string): string {
  const [anioInicio, mesInicio, diaInicio] = fechaInicio.split("-").map(Number);
  const [anioFin, mesFin, diaFin] = fechaFin.split("-").map(Number);

  if (fechaInicio === fechaFin) {
    return `${diaInicio} de ${MESES[mesInicio - 1]} de ${anioInicio}`;
  }

  if (anioInicio === anioFin && mesInicio === mesFin) {
    return `${diaInicio} al ${diaFin} de ${MESES[mesInicio - 1]} de ${anioInicio}`;
  }

  if (anioInicio === anioFin) {
    return `${diaInicio} de ${MESES[mesInicio - 1]} al ${diaFin} de ${MESES[mesFin - 1]} de ${anioInicio}`;
  }

  return `${diaInicio} de ${MESES[mesInicio - 1]} de ${anioInicio} al ${diaFin} de ${MESES[mesFin - 1]} de ${anioFin}`;
}
