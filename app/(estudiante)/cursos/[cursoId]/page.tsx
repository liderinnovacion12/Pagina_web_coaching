import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Circle, Lock, ShoppingCart } from "lucide-react";
import { getSesionUsuario } from "@/lib/auth/session";
import { getCursoDetalle } from "@/lib/db/cursos";

export default async function CursoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ cursoId: string }>;
  searchParams: Promise<{ bloqueado?: string }>;
}) {
  const { cursoId } = await params;
  const { bloqueado } = await searchParams;
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

      {bloqueado === "1" && !curso.accesoCurso && (
        <p
          role="status"
          className="rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-200"
        >
          No tienes acceso a este curso todavía — habla con tu coach para inscribirte.
        </p>
      )}

      <ol className="flex flex-col gap-2">
        {curso.lecciones.map((leccion, indice) => {
          const tieneAcceso = leccion.accesoIndividual;

          // Lección con precio propio → pagar lección individual
          const pagarLeccion = !tieneAcceso && leccion.precio > 0;
          // Sin precio de lección pero curso tiene precio → pagar el curso completo
          const pagarCurso = !tieneAcceso && leccion.precio === 0 && curso.precio > 0;

          if (tieneAcceso) {
            return (
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
            );
          }

          if (pagarLeccion) {
            return (
              <li key={leccion.id}>
                <Link
                  href={`/pago?tipo=leccion&leccionId=${leccion.id}&cursoId=${curso.id}`}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-gold-500/40 group"
                >
                  <ShoppingCart className="h-5 w-5 shrink-0 text-gold-500 group-hover:text-gold-400" aria-hidden="true" />
                  <span className="font-mono text-xs text-mist-500">{indice + 1}</span>
                  <span className="flex-1 text-mist-300 group-hover:text-white">{leccion.titulo}</span>
                  <span className="font-display text-sm font-bold text-gold-400">${leccion.precio} USD</span>
                </Link>
              </li>
            );
          }

          if (pagarCurso) {
            return (
              <li key={leccion.id}>
                <Link
                  href={`/pago?tipo=curso&cursoId=${curso.id}`}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-gold-500/40 group"
                >
                  <ShoppingCart className="h-5 w-5 shrink-0 text-gold-500 group-hover:text-gold-400" aria-hidden="true" />
                  <span className="font-mono text-xs text-mist-500">{indice + 1}</span>
                  <span className="flex-1 text-mist-300 group-hover:text-white">{leccion.titulo}</span>
                  <span className="font-display text-sm font-bold text-gold-400">${curso.precio} USD</span>
                </Link>
              </li>
            );
          }

          return (
            <li key={leccion.id}>
              <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 opacity-60">
                <Lock className="h-5 w-5 shrink-0 text-mist-500" aria-hidden="true" />
                <span className="font-mono text-xs text-mist-500">{indice + 1}</span>
                <span className="text-mist-400">{leccion.titulo}</span>
                <span className="sr-only">(bloqueada)</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
