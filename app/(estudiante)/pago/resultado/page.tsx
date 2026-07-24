import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Infinity as InfinityIcon,
} from "lucide-react";
import { confirmarPago } from "../actions";

export const metadata = { title: "Resultado del pago | NCS Realty Hub" };

export default async function ResultadoPagoPage({
  searchParams,
}: {
  searchParams: Promise<{
    id?: string;
    tipo?: string;
    cursoId?: string;
    leccionId?: string;
    status?: string;
  }>;
}) {
  const { id, tipo, cursoId, leccionId, status: wompiStatus } = await searchParams;

  if (!id && wompiStatus !== "APPROVED") {
    redirect("/pago");
  }

  let status = wompiStatus?.toUpperCase() ?? "PENDING";

  if (id && status !== "DECLINED" && status !== "VOIDED" && status !== "ERROR") {
    const result = await confirmarPago(id, tipo ?? "curso", cursoId, leccionId);
    status = result.status;
  }

  const approved = status === "APPROVED";
  const pending  = status === "PENDING";

  return (
    <main className="min-h-screen bg-ink-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/[0.08] bg-ink-900/50 p-8 text-center space-y-6">

          {/* Icon */}
          <div className="flex justify-center">
            {approved ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
                <CheckCircle2 className="h-9 w-9 text-green-400" />
              </div>
            ) : pending ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10">
                <Clock className="h-9 w-9 text-gold-400 animate-pulse" />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
                <XCircle className="h-9 w-9 text-red-400" />
              </div>
            )}
          </div>

          {/* Text */}
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              {approved ? "¡Pago aprobado!" : pending ? "Pago en proceso" : "Pago no completado"}
            </h1>
            <p className="mt-2 text-sm text-mist-400">
              {approved
                ? tipo === "membresia"
                  ? "Tu membresía ilimitada está activa. Accede a todos los cursos ahora."
                  : "Tu curso ha sido desbloqueado. ¡Empieza cuando quieras!"
                : pending
                  ? "Tu pago está siendo verificado por el banco. Puede tomar unos minutos."
                  : "El pago no fue aprobado. Ningún cargo fue realizado. Puedes intentarlo de nuevo."}
            </p>
          </div>

          {/* Transaction ID */}
          {id && (
            <p className="font-mono text-[10px] text-mist-500 break-all">
              Transacción: {id}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {approved && tipo === "membresia" && (
              <Link
                href="/clases"
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-sm text-ink-950 hover:bg-gold-400 transition-colors"
              >
                <InfinityIcon className="h-4 w-4" /> Ver todos los cursos
              </Link>
            )}
            {approved && tipo === "leccion" && cursoId && leccionId && (
              <Link
                href={`/cursos/${cursoId}/lecciones/${leccionId}`}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-sm text-ink-950 hover:bg-gold-400 transition-colors"
              >
                <ArrowRight className="h-4 w-4" /> Ver lección
              </Link>
            )}
            {approved && tipo === "curso" && cursoId && (
              <Link
                href={`/cursos/${cursoId}`}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-sm text-ink-950 hover:bg-gold-400 transition-colors"
              >
                <ArrowRight className="h-4 w-4" /> Ir al curso
              </Link>
            )}
            {!approved && (
              <Link
                href="/pago"
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-sm text-ink-950 hover:bg-gold-400 transition-colors"
              >
                Intentar de nuevo
              </Link>
            )}
            <Link
              href="/dashboard"
              className="flex h-11 items-center justify-center rounded-xl border border-white/10 text-sm text-mist-400 hover:border-white/20 hover:text-white transition-colors"
            >
              Ir al dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
