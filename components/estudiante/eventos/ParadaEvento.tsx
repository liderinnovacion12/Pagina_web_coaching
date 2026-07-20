import { Calendar, MapPin } from "lucide-react";
import type { ParadaLineaDeTiempo } from "@/lib/db/eventos.types";
import { CATEGORIA_EVENTO_INFO, extraerIdVideoYoutube, formatearRangoFecha } from "@/lib/db/eventos.types";

export function ParadaEvento({ parada }: { parada: ParadaLineaDeTiempo }) {
  const { evento, fecha, estado, mostrarVideo } = parada;
  const idVideo = mostrarVideo && evento.youtubeUrl ? extraerIdVideoYoutube(evento.youtubeUrl) : null;
  const esPasado = estado === "realizado";

  return (
    // opacity-90 (no menos) para que lo "pasado" se sienta atenuado sin
    // que el texto mas chico (fecha/ubicacion/badges, ya mist-400/500)
    // caiga debajo del contraste minimo de WCAG AA (4.5:1) contra el
    // fondo ink-950 -- opacity-40 lo rompia (~3.7:1 o menos).
    <div className={`relative pb-10 pl-6 ${esPasado ? "opacity-90" : ""}`}>
      {/* Posicion pensada para alinearse con la linea vertical del
          padre (EventosTimeline): contenedor con pl-8 y linea en
          left-3. Si esos valores cambian, este offset debe ajustarse
          junto con ellos. */}
      <span
        className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-ink-950 bg-white/30"
        aria-hidden="true"
      />
      <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-mist-400">
        {CATEGORIA_EVENTO_INFO[evento.categoria].titulo}
      </span>
      <h3 className="mt-2 font-display text-lg font-bold text-white">{evento.titulo}</h3>
      <p className="mt-1 text-sm text-mist-400">{evento.subtitulo}</p>
      {idVideo && (
        <div className="mt-3 aspect-video max-w-sm overflow-hidden rounded-xl border border-white/[0.08]">
          <iframe
            src={`https://www.youtube.com/embed/${idVideo}`}
            title={`Video de ${evento.titulo}`}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mist-300">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-mist-500" aria-hidden="true" />
          {formatearRangoFecha(fecha.fechaInicio, fecha.fechaFin)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-mist-400">
          <MapPin className="h-3.5 w-3.5 text-mist-500" aria-hidden="true" />
          {fecha.ubicacion}
        </span>
        {estado === "en_ejecucion" && (
          <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-2 py-0.5 text-[11px] font-semibold text-gold-300">
            En ejecución
          </span>
        )}
      </div>
    </div>
  );
}
