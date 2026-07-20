import { getEventos } from "@/lib/db/eventos";
import { EventosTimeline } from "@/components/estudiante/eventos/EventosTimeline";

export default async function EventosPage() {
  const eventos = await getEventos();

  return <EventosTimeline eventos={eventos} />;
}
