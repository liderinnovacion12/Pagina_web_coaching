"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, X } from "lucide-react";
import { formatHora } from "@/lib/calendario/recurrencia";
import { ETIQUETA_MODALIDAD } from "@/lib/db/calendario";
import type { OcurrenciaClase } from "./WeekGrid";

const ETIQUETA_RECURRENCIA: Record<string, string> = {
  semanal: "Semanal",
  quincenal: "Quincenal",
  unica: "Única",
};

// next.config.ts solo autoriza imágenes servidas desde Supabase Storage;
// cualquier otra URL debe ignorarse en vez de dejar que next/image lance
// un error en tiempo de ejecución por hostname no configurado.
function esImagenPermitida(url: string): boolean {
  return /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//.test(url);
}

export function EventDetailPanel({
  ocurrencia,
  onClose,
}: {
  ocurrencia: OcurrenciaClase | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {ocurrencia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(evento) => evento.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-950 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-300">
                  Detalle
                </p>
                <h3 className="mt-2 text-xl font-semibold leading-tight text-white">
                  {ocurrencia.clase.nombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar detalle"
                className="shrink-0 rounded-full border border-white/10 p-2 text-mist-400 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {ocurrencia.clase.imagenUrl && esImagenPermitida(ocurrencia.clase.imagenUrl) && (
              <div className="relative mt-4 h-32 w-full overflow-hidden rounded-xl">
                <Image
                  src={ocurrencia.clase.imagenUrl}
                  alt=""
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              </div>
            )}

            <dl className="mt-4 space-y-2 text-sm text-mist-300">
              <div className="flex justify-between">
                <dt>Horario</dt>
                <dd>
                  {formatHora(ocurrencia.inicioUtc.getHours(), ocurrencia.inicioUtc.getMinutes())}–
                  {formatHora(ocurrencia.finUtc.getHours(), ocurrencia.finUtc.getMinutes())}
                </dd>
              </div>
              {ocurrencia.clase.dirigidoPor && (
                <div className="flex justify-between">
                  <dt>Dirige</dt>
                  <dd>{ocurrencia.clase.dirigidoPor}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Modalidad</dt>
                <dd>{ETIQUETA_MODALIDAD[ocurrencia.clase.modalidad]}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Recurrencia</dt>
                <dd>{ETIQUETA_RECURRENCIA[ocurrencia.clase.recurrencia]}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col gap-2">
              {ocurrencia.clase.enlaceSesion && (
                <a
                  href={ocurrencia.clase.enlaceSesion}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                  <ExternalLink className="h-4 w-4" />
                  Unirse por Zoom
                </a>
              )}
              {ocurrencia.clase.enlacePreguntas && (
                <a
                  href={ocurrencia.clase.enlacePreguntas}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-sm text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver preguntas / precalificación
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
