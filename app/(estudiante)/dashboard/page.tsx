import Link from "next/link";
import { getSesionUsuario } from "@/lib/auth/session";
import { getResumenEstudiante } from "@/lib/db/dashboard";

const ETIQUETAS_MEMBRESIA: Record<string, string> = {
  activa: "Activa",
  cancelada: "Cancelada",
  vencida: "Vencida",
  sin_membresia: "Sin membresía",
};

export default async function DashboardPage() {
  const sesion = await getSesionUsuario();
  const resumen = await getResumenEstudiante(sesion!.id);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Bienvenido de nuevo
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          El liderazgo se construye, no se improvisa.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard etiqueta="XP total" valor={resumen.xpTotal} />
        <StatCard etiqueta="Insignias" valor={resumen.insigniasCount} />
        <StatCard etiqueta="Cursos en progreso" valor={resumen.cursosEnProgreso} />
        <StatCard etiqueta="Membresía" valor={ETIQUETAS_MEMBRESIA[resumen.membresiaEstado]} />
      </dl>

      {resumen.continuarViendo && (
        <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-8">
          <p className="font-mono text-xs uppercase tracking-wider text-mist-500">
            Continuar viendo
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold text-white">
            {resumen.continuarViendo.leccionTitulo}
          </h2>
          <p className="mt-1 text-sm text-mist-400">{resumen.continuarViendo.cursoTitulo}</p>
          <Link
            href={`/cursos/${resumen.continuarViendo.cursoId}/lecciones/${resumen.continuarViendo.leccionId}`}
            className="mt-5 inline-flex h-[44px] items-center justify-center rounded-xl bg-gold-500 px-6 font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            Retomar
          </Link>
        </div>
      )}

      {!resumen.continuarViendo && (
        <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-8 text-center">
          <h2 className="font-display text-xl font-semibold text-white">
            Tu formación empieza hoy
          </h2>
          <p className="mt-2 text-mist-400">
            Da tu primer paso con los 5 pilares del Sistema 100+.
          </p>
          <Link
            href="/sistema-100"
            className="mt-5 inline-flex h-[44px] items-center justify-center rounded-xl bg-gold-500 px-6 font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            Comenzar Sistema 100+
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/sistema-100"
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-gold-500/40"
        >
          <h3 className="font-display font-semibold text-white">Sistema 100+</h3>
          <p className="mt-1 text-sm text-mist-400">Los 5 pilares del éxito</p>
        </Link>
        <Link
          href="/clases"
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-gold-500/40"
        >
          <h3 className="font-display font-semibold text-white">Clases</h3>
          <p className="mt-1 text-sm text-mist-400">Videoteca completa</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-5">
      <dt className="font-mono text-xs uppercase tracking-wider text-mist-500">{etiqueta}</dt>
      <dd className="mt-2 text-2xl font-semibold text-white">{valor}</dd>
    </div>
  );
}
