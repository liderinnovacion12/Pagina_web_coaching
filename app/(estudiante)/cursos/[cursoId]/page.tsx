import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Circle } from "lucide-react";
import { getSesionUsuario } from "@/lib/auth/session";
import { getCursoDetalle } from "@/lib/db/cursos";

export default async function CursoDetallePage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const { cursoId } = await params;
  const sesion = await getSesionUsuario();
  const curso = await getCursoDetalle(cursoId, sesion!.id);

  if (!curso) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-[42px] font-bold leading-tight text-white">
        {curso.titulo}
      </h1>

      <ol className="flex flex-col gap-2">
        {curso.lecciones.map((leccion, indice) => (
          <li key={leccion.id}>
            <Link
              href={`/cursos/${curso.id}/lecciones/${leccion.id}`}
              className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-gold-500/40"
            >
              {leccion.completado ? (
                <Check className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-mist-500" aria-hidden="true" />
              )}
              <span className="font-mono text-xs text-mist-500">{indice + 1}</span>
              <span className="text-white">{leccion.titulo}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
