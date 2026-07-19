"use client";

import { Folder, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";
import { ETIQUETA_CATEGORIA } from "@/lib/db/grupos-comunidad.types";

const ETIQUETA_ACCION: Record<GrupoComunidad["tipoCanal"], string> = {
  whatsapp: "Unirse",
  dropbox: "Abrir carpeta",
};

const ACENTO_CANAL: Record<
  GrupoComunidad["tipoCanal"],
  { badge: string; hoverBorde: string; link: string; glow: string }
> = {
  whatsapp: {
    badge: "border-whatsapp/20 bg-whatsapp/10 text-whatsapp",
    hoverBorde: "hover:border-whatsapp/40",
    link: "text-whatsapp hover:text-whatsapp-dark",
    glow: "bg-whatsapp/20",
  },
  dropbox: {
    badge: "border-gold-500/20 bg-gold-500/10 text-gold-300",
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
  const Icono = grupo.tipoCanal === "dropbox" ? Folder : MessageCircle;
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
        className={`flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition ${acento.hoverBorde}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${acento.badge}`}
          >
            <Icono className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{grupo.nombre}</p>
            <p className="truncate text-xs text-mist-400">
              {ETIQUETA_CATEGORIA[grupo.categoria]}
              {grupo.detalle ? ` · ${grupo.detalle}` : ""}
            </p>
          </div>
        </div>
        {accion}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors ${acento.hoverBorde}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${acento.glow}`}
      />
      <div className="relative">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 ${acento.badge}`}
        >
          <Icono className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-display font-semibold text-white">{grupo.nombre}</h3>
        {grupo.detalle && <p className="mt-1 text-sm text-mist-400">{grupo.detalle}</p>}
        <span className="mt-3 inline-block rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-mist-400">
          {ETIQUETA_CATEGORIA[grupo.categoria]}
        </span>
      </div>
      <div className="relative flex justify-end">{accion}</div>
    </motion.div>
  );
}
