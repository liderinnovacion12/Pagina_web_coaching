"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Mail, Phone } from "lucide-react";
import type { Aliado } from "@/lib/db/aliados.types";
import { parsearContactos } from "@/lib/db/aliados.types";
import { blurFadeUp, staggerContainer, useReducedMotionSafe } from "@/lib/motion";

export function AliadosGrid({ aliados }: { aliados: Aliado[] }) {
  const [seleccionadoId, setSeleccionadoId] = useState(aliados[0]?.id);
  const reducedMotion = useReducedMotionSafe();
  const seleccionado = aliados.find((a) => a.id === seleccionadoId) ?? aliados[0];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08)}
      className="flex flex-col gap-10"
    >
      <motion.div variants={blurFadeUp}>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Aliados Estratégicos del Equipo
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          Contactos y aliados que trabajan con el Team Wilmar & Samuel.
        </p>
      </motion.div>

      <motion.div
        variants={blurFadeUp}
        className="flex flex-col gap-8 lg:flex-row"
      >
        {/* Lista maestro */}
        <div className="flex shrink-0 flex-row gap-2 overflow-x-auto lg:w-72 lg:flex-col lg:overflow-visible">
          {aliados.map((aliado) => {
            const activo = aliado.id === seleccionado?.id;
            return (
              <button
                key={aliado.id}
                type="button"
                aria-current={activo}
                onClick={() => setSeleccionadoId(aliado.id)}
                className={`shrink-0 rounded-xl border px-5 py-4 text-left font-display font-semibold transition-colors duration-200 ${
                  activo
                    ? "border-gold-500/30 bg-gold-500/10 text-gold-200"
                    : "border-white/[0.06] bg-white/[0.02] text-white hover:border-white/15"
                }`}
              >
                {aliado.servicio}
              </button>
            );
          })}
        </div>

        {/* Panel de detalle */}
        <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
          <AnimatePresence>
            {seleccionado && (
              <motion.div
                key={seleccionado.id}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  {seleccionado.imagenUrl ? (
                    <Image
                      src={seleccionado.imagenUrl}
                      alt={seleccionado.servicio}
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold-500/20 bg-gold-500/10 text-gold-300"
                      aria-hidden="true"
                    >
                      <Building2 className="h-6 w-6" />
                    </span>
                  )}
                  <h2 className="font-display text-xl font-bold text-white">
                    {seleccionado.servicio}
                  </h2>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-mist-300">
                  {seleccionado.descripcion}
                </p>

                <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-5">
                  {parsearContactos(seleccionado).map((contacto, indice) => (
                    <div
                      key={`${contacto.nombre}-${indice}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                    >
                      <span className="font-medium text-mist-300">{contacto.nombre}</span>
                      {contacto.telefono && (
                        <a
                          href={`tel:${contacto.telefono}`}
                          className="inline-flex items-center gap-1.5 text-gold-300 transition hover:text-gold-200"
                        >
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          {contacto.telefono}
                        </a>
                      )}
                      {contacto.correo && (
                        <a
                          href={`mailto:${contacto.correo}`}
                          className="inline-flex items-center gap-1.5 text-gold-300 transition hover:text-gold-200"
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                          {contacto.correo}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
