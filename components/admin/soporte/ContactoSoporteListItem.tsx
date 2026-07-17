"use client";

import { useState } from "react";
import type { ContactoSoporte } from "@/lib/db/contactos-soporte.types";
import {
  actualizarContactoSoporteAction,
  eliminarContactoSoporteAction,
} from "@/app/(admin)/admin/soporte/actions";
import { ContactoSoporteForm } from "./ContactoSoporteForm";

export function ContactoSoporteListItem({ contacto }: { contacto: ContactoSoporte }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="rounded-lg border border-white/10 p-4">
        <ContactoSoporteForm
          contacto={contacto}
          action={actualizarContactoSoporteAction.bind(null, contacto.id)}
        />
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="mt-3 text-sm text-mist-400 underline"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 p-4">
      <div>
        <p className="font-medium text-white">{contacto.nombre}</p>
        <p className="text-sm text-mist-400">
          {contacto.cargo}
          {!contacto.fotoUrl && " · sin foto"}
          {!contacto.activo && " · inactivo"}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditando(true)} className="text-sm underline">
          Editar
        </button>
        <form action={eliminarContactoSoporteAction.bind(null, contacto.id)}>
          <button type="submit" className="text-sm text-rose-400 underline">
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
