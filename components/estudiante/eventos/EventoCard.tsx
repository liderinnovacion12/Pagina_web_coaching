import { Calendar, MapPin } from "lucide-react";
import type { Evento } from "@/lib/db/eventos.types";
import { calcularEstadoFecha, extraerIdVideoYoutube, formatearRangoFecha, hoyIso } from "@/lib/db/eventos.types";

const ETIQUETA_ESTADO: Record<"realizado" | "en_ejecucion", string> = {
  realizado: "Realizado con éxito",
  en_ejecucion: "En ejecución",
};

export function EventoCard({ evento }: { evento: Evento }) {
  const idVideo = evento.youtubeUrl ? extraerIdVideoYoutube(evento.youtubeUrl) : null;
  const hoy = hoyIso();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div>
        <h3 className="font-display text-lg font-bold text-white">{evento.titulo}</h3>
        <p className="mt-1 text-sm text-mist-400">{evento.subtitulo}</p>
      </div>

      {idVideo && (
        <div className="aspect-video max-w-sm overflow-hidden rounded-xl border border-white/[0.08]">
          <iframe
            src={`https://www.youtube.com/embed/${idVideo}`}
            title={`Video de ${evento.titulo}`}
            className="h-full w-full"
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {evento.fechas.map((fecha) => {
          const estado = calcularEstadoFecha(fecha.fechaInicio, fecha.fechaFin, hoy);

          return (
            <li
              key={fecha.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-white/10 pl-3 text-sm text-mist-300"
            >
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-mist-500" aria-hidden="true" />
                {formatearRangoFecha(fecha.fechaInicio, fecha.fechaFin)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-mist-400">
                <MapPin className="h-3.5 w-3.5 text-mist-500" aria-hidden="true" />
                {fecha.ubicacion}
              </span>
              {estado !== "proximo" && (
                <span
                  className={
                    estado === "en_ejecucion"
                      ? "rounded-full border border-gold-500/20 bg-gold-500/10 px-2 py-0.5 text-[11px] font-semibold text-gold-300"
                      : "rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-mist-400"
                  }
                >
                  {ETIQUETA_ESTADO[estado]}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
