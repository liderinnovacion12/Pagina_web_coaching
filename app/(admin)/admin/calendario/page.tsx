import { getTodasLasClases } from "@/lib/db/calendario";
import { ClaseForm } from "@/components/admin/calendario/ClaseForm";
import { ClaseListItem } from "@/components/admin/calendario/ClaseListItem";
import { crearClaseAction } from "./actions";

export default async function AdminCalendarioPage() {
  const clases = await getTodasLasClases();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-white">Clases del calendario</h1>

      <section className="flex flex-col gap-3">
        {clases.map((clase) => (
          <ClaseListItem key={clase.id} clase={clase} />
        ))}
        {clases.length === 0 && <p className="text-sm text-mist-400">Sin clases registradas.</p>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Nueva clase</h2>
        <ClaseForm action={crearClaseAction} />
      </section>
    </div>
  );
}
