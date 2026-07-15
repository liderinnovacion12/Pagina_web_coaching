"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, Mail, Phone } from "lucide-react";
import type { Aliado } from "@/lib/db/aliados.types";
import { parsearContactos } from "@/lib/db/aliados.types";
import { blurFadeUp } from "@/lib/motion";

export function AliadoCard({ aliado }: { aliado: Aliado }) {
  const contactos = parsearContactos(aliado);

  return (
    <motion.div
      variants={blurFadeUp}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-colors hover:border-white/20"
    >
      <div className="flex items-center gap-4">
        {aliado.imagenUrl ? (
          <Image
            src={aliado.imagenUrl}
            alt={aliado.servicio}
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
        <div className="min-w-0">
          <h3 className="truncate font-display font-semibold text-white">{aliado.servicio}</h3>
          <p className="truncate text-sm text-mist-400">
            {contactos.map((contacto) => contacto.nombre).join(" · ")}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-mist-300">{aliado.descripcion}</p>

      <div className="mt-auto flex flex-col gap-2 border-t border-white/[0.06] pt-4">
        {contactos.map((contacto, indice) => (
          <div
            key={`${contacto.nombre}-${indice}`}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
          >
            {contactos.length > 1 && (
              <span className="font-medium text-mist-300">{contacto.nombre}</span>
            )}
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
  );
}
