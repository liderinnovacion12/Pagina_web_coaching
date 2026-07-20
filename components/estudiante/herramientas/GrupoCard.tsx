"use client";

import { motion } from "framer-motion";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";
import { ETIQUETA_CATEGORIA } from "@/lib/db/grupos-comunidad.types";

const ETIQUETA_ACCION: Record<GrupoComunidad["tipoCanal"], string> = {
  whatsapp: "Unirse",
  dropbox: "Abrir carpeta",
};

const ACENTO_CANAL: Record<
  GrupoComunidad["tipoCanal"],
  { franja: string; hoverBorde: string; link: string; glow: string }
> = {
  whatsapp: {
    franja: "border-l-4 border-l-whatsapp",
    hoverBorde: "hover:border-whatsapp/40",
    link: "text-whatsapp hover:text-whatsapp-dark",
    glow: "bg-whatsapp/20",
  },
  dropbox: {
    franja: "border-l-4 border-l-gold-500",
    hoverBorde: "hover:border-gold-500/40",
    link: "text-gold-300 hover:text-gold-200",
    glow: "bg-gold-500/20",
  },
};

export function GrupoCard({
  grupo,
  vista,
}: {
  grupo: GrupoComunidad;
  vista: "grid" | "lista";
}) {
  const tieneEnlace = Boolean(grupo.enlaceUrl);
  const etiquetaAccion = ETIQUETA_ACCION[grupo.tipoCanal];
  const acento = ACENTO_CANAL[grupo.tipoCanal];

  const accion = tieneEnlace ? (
    <a
      href={grupo.enlaceUrl!}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-sm font-semibold transition hover:scale-[1.02] active:scale-[0.98] ${acento.link}`}
    >
      {etiquetaAccion} ↗
    </a>
  ) : (
    <span
      aria-disabled="true"
      title="Este grupo todavía no tiene enlace cargado"
      className="text-sm font-medium text-mist-500 opacity-50 cursor-not-allowed"
    >
      Enlace pendiente
    </span>
  );

  if (vista === "lista") {
    return (
      <div
        className={`flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition ${acento.franja} ${acento.hoverBorde}`}
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{grupo.nombre}</p>
          <p className="truncate text-xs text-mist-400">
            {ETIQUETA_CATEGORIA[grupo.categoria]}
            {grupo.detalle ? ` · ${grupo.detalle}` : ""}
          </p>
        </div>
        {accion}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors ${acento.franja} ${acento.hoverBorde}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${acento.glow}`}
      />
      <div className="relative">
        <h3 className="font-display font-semibold text-white">{grupo.nombre}</h3>
        {grupo.detalle && <p className="mt-1 text-sm text-mist-400">{grupo.detalle}</p>}
        <span className="mt-3 inline-block rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-mist-400">
          {ETIQUETA_CATEGORIA[grupo.categoria]}
        </span>
      </div>
      <div className="relative flex justify-end">{accion}</div>
    </motion.div>
  );
}
