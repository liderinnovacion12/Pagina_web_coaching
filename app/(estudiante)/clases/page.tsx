import { getSesionUsuario } from "@/lib/auth/session";
import { getCursosPorCategoria } from "@/lib/db/cursos";
import { ClasesCatalogo } from "./ClasesCatalogo";

export default async function ClasesPage() {
  const sesion = await getSesionUsuario();
  const cursos = await getCursosPorCategoria(sesion!.id, undefined);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">Clases</h1>
        <p className="mt-2 text-lg text-mist-400">Videoteca completa de CoachPro.</p>
      </div>

      <ClasesCatalogo cursos={cursos} />
    </div>
  );
}
