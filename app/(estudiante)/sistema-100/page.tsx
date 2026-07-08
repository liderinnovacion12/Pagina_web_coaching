import { getSesionUsuario } from "@/lib/auth/session";
import { getCursosPorCategoria } from "@/lib/db/cursos";
import { CursoCard } from "@/components/estudiante/CursoCard";

export default async function Sistema100Page() {
  const sesion = await getSesionUsuario();
  const cursos = await getCursosPorCategoria(sesion!.id, "sistema_100");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="font-mono text-xs uppercase tracking-wider text-mist-500">
          Los 5 pilares del Sistema 100+
        </span>
        <h1 className="mt-2 font-display text-[42px] font-bold leading-tight text-white">
          Sistema 100+
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <CursoCard key={curso.id} curso={curso} />
        ))}
      </div>
    </div>
  );
}
