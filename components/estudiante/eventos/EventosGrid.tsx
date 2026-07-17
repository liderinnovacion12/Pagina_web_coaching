import type { CategoriaEvento, Evento } from "@/lib/db/eventos.types";
import { CATEGORIA_EVENTO_INFO } from "@/lib/db/eventos.types";
import { EventoCard } from "./EventoCard";

const ORDEN_CATEGORIAS: CategoriaEvento[] = ["internacional", "nacional_eeuu"];
const URL_WHATSAPP = "https://wa.link/o926ih";

export function EventosGrid({ eventos }: { eventos: Evento[] }) {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">Eventos</h1>
        <p className="mt-2 text-lg text-mist-400">
          Mantente informado sobre próximos eventos del equipo
        </p>
      </div>

      {ORDEN_CATEGORIAS.map((categoria) => {
        const eventosDeCategoria = eventos.filter((evento) => evento.categoria === categoria);

        if (eventosDeCategoria.length === 0) {
          return null;
        }

        return (
          <div key={categoria} className="flex flex-col gap-4">
            <div className="border-b border-white/10 pb-2">
              <h2 className="font-display text-xl font-bold text-white">
                {CATEGORIA_EVENTO_INFO[categoria].titulo}
              </h2>
              <p className="text-sm text-mist-400">{CATEGORIA_EVENTO_INFO[categoria].subtitulo}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {eventosDeCategoria.map((evento) => (
                <EventoCard key={evento.id} evento={evento} />
              ))}
            </div>
          </div>
        );
      })}

      <a
        href={URL_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-[54px] w-fit items-center justify-center gap-2.5 self-center rounded-xl bg-gold-500 px-8 font-semibold text-ink-950 transition-all duration-200 hover:scale-[1.02] hover:bg-gold-400 hover:shadow-[0_0_24px_rgba(217,169,78,0.25)] active:scale-[0.98]"
      >
        Solicitar más Información
      </a>
    </div>
  );
}
