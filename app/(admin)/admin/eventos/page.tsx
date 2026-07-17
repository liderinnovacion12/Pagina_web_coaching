import { getTodosLosEventos } from "@/lib/db/eventos";
import { EventoForm } from "@/components/admin/eventos/EventoForm";
import { EventoListItem } from "@/components/admin/eventos/EventoListItem";
import { crearEventoAction } from "./actions";

export default async function AdminEventosPage() {
  const eventos = await getTodosLosEventos();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-white">Eventos</h1>

      <section className="flex flex-col gap-3">
        {eventos.map((evento) => (
          <EventoListItem key={evento.id} evento={evento} />
        ))}
        {eventos.length === 0 && <p className="text-sm text-mist-400">Sin eventos registrados.</p>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Nuevo evento</h2>
        <EventoForm action={crearEventoAction} />
      </section>
    </div>
  );
}
