import { getTodosLosAliados } from "@/lib/db/aliados";
import { AliadoForm } from "@/components/admin/aliados/AliadoForm";
import { AliadoListItem } from "@/components/admin/aliados/AliadoListItem";
import { crearAliadoAction } from "./actions";

export default async function AdminAliadosPage() {
  const aliados = await getTodosLosAliados();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-white">Aliados estratégicos</h1>

      <section className="flex flex-col gap-3">
        {aliados.map((aliado) => (
          <AliadoListItem key={aliado.id} aliado={aliado} />
        ))}
        {aliados.length === 0 && <p className="text-sm text-mist-400">Sin aliados registrados.</p>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Nuevo aliado</h2>
        <AliadoForm action={crearAliadoAction} />
      </section>
    </div>
  );
}
