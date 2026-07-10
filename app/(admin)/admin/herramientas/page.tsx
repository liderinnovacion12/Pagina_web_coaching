import { getTodosLosGrupos } from "@/lib/db/grupos-comunidad";
import { GrupoForm } from "@/components/admin/herramientas/GrupoForm";
import { GrupoListItem } from "@/components/admin/herramientas/GrupoListItem";
import { crearGrupoAction } from "./actions";

export default async function AdminHerramientasPage() {
  const grupos = await getTodosLosGrupos();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-white">Grupos de comunidad</h1>

      <section className="flex flex-col gap-3">
        {grupos.map((grupo) => (
          <GrupoListItem key={grupo.id} grupo={grupo} />
        ))}
        {grupos.length === 0 && <p className="text-sm text-mist-400">Sin grupos registrados.</p>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Nuevo grupo</h2>
        <GrupoForm action={crearGrupoAction} />
      </section>
    </div>
  );
}
