import { requireRol } from "@/lib/auth/session";
import { getEstudiantesDelCoach } from "@/lib/db/coach";
import { Users, GraduationCap } from "lucide-react";

export default async function CoachEstudiantesPage() {
  const sesion = await requireRol(["coach", "admin"]);
  const estudiantes = await getEstudiantesDelCoach(sesion.id);

  const porCurso = estudiantes.reduce<Record<string, number>>((acc, e) => {
    acc[e.cursoTitulo] = (acc[e.cursoTitulo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Estudiantes</h1>
        <p className="mt-1 font-mono text-xs text-mist-400">
          {estudiantes.length} inscripciones en tus cursos
        </p>
      </div>

      {/* Resumen por curso */}
      {Object.keys(porCurso).length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(porCurso).map(([titulo, count]) => (
            <div key={titulo} className="rounded-xl border border-gold-500/20 bg-gold-500/5 px-4 py-3">
              <p className="font-display text-sm font-semibold text-white truncate">{titulo}</p>
              <p className="mt-1 font-mono text-xs text-gold-400">{count} estudiantes</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-2xl border border-white/8 bg-ink-900/60 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 border-b border-white/8 px-5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Email</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Curso</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Inscrito</span>
        </div>

        <div className="divide-y divide-white/5">
          {estudiantes.map((e, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-700 border border-white/10 font-display text-xs font-bold text-white">
                  {e.email[0].toUpperCase()}
                </div>
                <span className="font-mono text-sm text-white truncate">{e.email}</span>
              </div>
              <span className="font-mono text-xs text-mist-300 truncate">{e.cursoTitulo}</span>
              <span className="font-mono text-xs text-mist-500 whitespace-nowrap">
                {new Date(e.inscrito_en).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
          ))}

          {estudiantes.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-mist-600 mb-2" />
              <p className="text-sm text-mist-400">Aún no tienes estudiantes inscritos.</p>
              <p className="mt-1 font-mono text-xs text-mist-500 flex items-center justify-center gap-1">
                <GraduationCap className="h-3 w-3" /> Publica un curso para empezar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
