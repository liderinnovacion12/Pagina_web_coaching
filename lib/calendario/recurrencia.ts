export type Recurrencia = "semanal" | "quincenal" | "unica";

const MS_POR_DIA = 86_400_000;

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

function inicioDelDia(fecha: Date): Date {
  const copia = new Date(fecha);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function diaSemanaISO(fecha: Date): number {
  const dia = fecha.getDay();
  return dia === 0 ? 6 : dia - 1;
}

function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function formatearPartesEnZona(
  fecha: Date,
  timeZone: string
): Record<string, string> {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(fecha)
    .reduce<Record<string, string>>((acumulador, parte) => {
      if (parte.type !== "literal") {
        acumulador[parte.type] = parte.value;
      }
      return acumulador;
    }, {});
}

export function getInicioSemana(fecha: Date): Date {
  const dia = fecha.getDay();
  const diferenciaALunes = dia === 0 ? -6 : 1 - dia;
  const inicio = sumarDias(fecha, diferenciaALunes);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

export function getOcurrenciaEnSemana(
  fechaAncla: string,
  recurrencia: Recurrencia,
  inicioSemana: Date
): Date | null {
  const ancla = new Date(`${fechaAncla}T00:00:00`);
  const inicioSemanaAncla = getInicioSemana(ancla);
  const diffDias = Math.round(
    (inicioDelDia(inicioSemana).getTime() - inicioSemanaAncla.getTime()) / MS_POR_DIA
  );

  if (diffDias < 0) {
    return null;
  }

  if (recurrencia === "unica" && diffDias !== 0) {
    return null;
  }

  if (recurrencia === "semanal" && diffDias % 7 !== 0) {
    return null;
  }

  if (recurrencia === "quincenal" && diffDias % 14 !== 0) {
    return null;
  }

  const ocurrencia = new Date(inicioDelDia(inicioSemana));
  ocurrencia.setDate(inicioSemana.getDate() + diaSemanaISO(ancla));
  return ocurrencia;
}

export const getOcurrenciasEnSemana = getOcurrenciaEnSemana;

function obtenerOffsetZonaHoraria(fecha: Date, timeZone: string): number {
  const partes = formatearPartesEnZona(fecha, timeZone);
  const comoUTC = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    Number(partes.hour),
    Number(partes.minute),
    Number(partes.second)
  );

  return comoUTC - fecha.getTime();
}

/**
 * Convierte una fecha + hora de pared en una zona horaria destino a un instante UTC.
 * La implementación es manual para evitar dependencias extra y mantener EST/EDT
 * correctos automáticamente.
 */
export function zonedTimeToUtc(
  fechaISO: string,
  horaHHmm: string,
  tz = "America/New_York"
): Date {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const [hora, minuto] = horaHHmm.split(":").map(Number);
  const instants = new Date(Date.UTC(anio, mes - 1, dia, hora, minuto, 0));

  const offsetPrimero = obtenerOffsetZonaHoraria(instants, tz);
  const primerAjuste = new Date(instants.getTime() - offsetPrimero);
  const offsetSegundo = obtenerOffsetZonaHoraria(primerAjuste, tz);

  return new Date(instants.getTime() - offsetSegundo);
}

export function getRangoHorasSemana(
  ocurrencias: { inicioUtc: Date; finUtc: Date }[]
): { horaInicio: number; horaFin: number } {
  if (ocurrencias.length === 0) {
    return { horaInicio: 8, horaFin: 18 };
  }

  const horasInicio = ocurrencias.map((ocurrencia) => ocurrencia.inicioUtc.getHours());
  const horasFin = ocurrencias.map((ocurrencia) => {
    const hora = ocurrencia.finUtc.getHours();
    return hora + (ocurrencia.finUtc.getMinutes() > 0 ? 1 : 0);
  });

  return {
    horaInicio: Math.max(0, Math.min(...horasInicio) - 1),
    horaFin: Math.min(24, Math.max(...horasFin) + 1),
  };
}

export function formatRangoSemana(inicioSemana: Date): string {
  const finSemana = sumarDias(inicioSemana, 6);

  if (
    inicioSemana.getFullYear() === finSemana.getFullYear() &&
    inicioSemana.getMonth() === finSemana.getMonth()
  ) {
    return `${inicioSemana.getDate()}–${finSemana.getDate()} ${
      MESES[finSemana.getMonth()]
    } ${finSemana.getFullYear()}`;
  }

  if (inicioSemana.getFullYear() === finSemana.getFullYear()) {
    return `${inicioSemana.getDate()} ${MESES[inicioSemana.getMonth()]} – ${finSemana.getDate()} ${
      MESES[finSemana.getMonth()]
    } ${finSemana.getFullYear()}`;
  }

  return `${inicioSemana.getDate()} ${MESES[inicioSemana.getMonth()]} ${inicioSemana.getFullYear()} – ${finSemana.getDate()} ${MESES[finSemana.getMonth()]} ${finSemana.getFullYear()}`;
}

export function formatHora(hora: number, minuto: number): string {
  const horas12 = hora % 12 === 0 ? 12 : hora % 12;
  const sufijo = hora < 12 ? "AM" : "PM";
  return `${horas12}:${String(minuto).padStart(2, "0")} ${sufijo}`;
}

export function aFechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}
