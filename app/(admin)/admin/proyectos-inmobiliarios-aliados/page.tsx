import { getTodosLosProyectos } from "@/lib/db/proyectos-aliados";
import { ProyectoForm } from "@/components/admin/proyectos-aliados/ProyectoForm";
import { ProyectoListItem } from "@/components/admin/proyectos-aliados/ProyectoListItem";
import { crearProyectoAction } from "./actions";

export default async function AdminProyectosAliadosPage() {
  const proyectos = await getTodosLosProyectos();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-white">Proyectos inmobiliarios aliados</h1>

      <section className="flex flex-col gap-3">
        {proyectos.map((proyecto) => (
          <ProyectoListItem key={proyecto.id} proyecto={proyecto} />
        ))}
        {proyectos.length === 0 && <p className="text-sm text-mist-400">Sin proyectos registrados.</p>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Nuevo proyecto</h2>
        <ProyectoForm action={crearProyectoAction} />
      </section>
    </div>
  );
}
