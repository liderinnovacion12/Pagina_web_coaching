"use client";

import { motion } from "framer-motion";
import { MapPin, Video } from "lucide-react";
import { formatHora } from "@/lib/calendario/recurrencia";
import { ETIQUETA_MODALIDAD } from "@/lib/calendario/tipos";
import type { ClaseCalendario } from "@/lib/db/calendario";
import type { OcurrenciaClase } from "./WeekGrid";

function iconoModalidad(modalidad: ClaseCalendario["modalidad"]) {
  return modalidad === "presencial" ? MapPin : Video;
}

export function EventCard({
  ocurrencia,
  onClick,
}: {
  ocurrencia: OcurrenciaClase;
  onClick: (ocurrencia: OcurrenciaClase) => void;
}) {
  const Icono = iconoModalidad(ocurrencia.clase.modalidad);
  const inicio = ocurrencia.inicioUtc;
  const fin = ocurrencia.finUtc;
  const horario = `${formatHora(inicio.getHours(), inicio.getMinutes())}–${formatHora(
    fin.getHours(),
    fin.getMinutes()
  )}`;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick(ocurrencia)}
      className="group flex h-full w-full flex-col gap-0.5 overflow-hidden rounded-lg border border-white/10 bg-white/[0.05] p-2 text-left transition hover:border-gold-500/50 hover:bg-gold-500/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold-300">
        <Icono className="h-3 w-3 shrink-0" />
        <span className="truncate">
          {horario} · {ETIQUETA_MODALIDAD[ocurrencia.clase.modalidad]}
        </span>
      </div>
      <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">
        {ocurrencia.clase.nombre}
      </p>
      {ocurrencia.clase.dirigidoPor && (
        <p className="truncate text-[11px] text-mist-500">{ocurrencia.clase.dirigidoPor}</p>
      )}
    </motion.button>
  );
}
