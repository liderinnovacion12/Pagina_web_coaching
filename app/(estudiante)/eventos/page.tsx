import { getEventos } from "@/lib/db/eventos";
import { EventosGrid } from "@/components/estudiante/eventos/EventosGrid";

export default async function EventosPage() {
  const eventos = await getEventos();

  return <EventosGrid eventos={eventos} />;
}
