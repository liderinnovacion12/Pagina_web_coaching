import Image from "next/image";
import type { ContactoSoporte } from "@/lib/db/contactos-soporte.types";

export function ContactoSoporteCard({ contacto }: { contacto: ContactoSoporte }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
      <div className="flex items-center gap-4">
        {contacto.fotoUrl ? (
          <Image
            src={contacto.fotoUrl}
            alt={contacto.nombre}
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold-500/20 bg-gold-500/10 text-lg font-semibold text-gold-300"
            aria-hidden="true"
          >
            {contacto.nombre.charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-display font-semibold text-white">{contacto.nombre}</h3>
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-gold-300">
            {contacto.cargo}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-mist-300">{contacto.descripcionCargo}</p>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/[0.06] pt-3 text-sm">
        <a href={`tel:${contacto.telefono}`} className="text-gold-300 transition hover:text-gold-200">
          {contacto.telefono}
        </a>
        <a href={`mailto:${contacto.correo}`} className="text-gold-300 transition hover:text-gold-200">
          {contacto.correo}
        </a>
      </div>
    </div>
  );
}
