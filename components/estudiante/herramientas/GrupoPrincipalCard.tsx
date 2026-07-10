import { MessageCircle } from "lucide-react";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";

export function GrupoPrincipalCard({ grupo }: { grupo: GrupoComunidad | undefined }) {
  if (!grupo) {
    return null;
  }

  const tieneEnlace = Boolean(grupo.enlaceUrl);

  const contenido = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-whatsapp/20 bg-whatsapp/10 text-whatsapp">
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-white">{grupo.nombre}</h3>
      <p className="mt-1.5 text-sm text-mist-400">
        Canal maestro de comunicación general del equipo.
      </p>
      <div className="mt-5 flex justify-end">
        {tieneEnlace ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300">
            Unirse ↗
          </span>
        ) : (
          <span className="text-sm font-medium text-mist-500 opacity-50">Enlace pendiente</span>
        )}
      </div>
    </>
  );

  if (!tieneEnlace) {
    return (
      <div
        aria-disabled="true"
        title="Este grupo todavía no tiene enlace cargado"
        className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
      >
        {contenido}
      </div>
    );
  }

  return (
    <a
      href={grupo.enlaceUrl!}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:scale-[1.01] hover:border-whatsapp/40"
    >
      {contenido}
    </a>
  );
}
