"use client";

import { useState } from "react";
import type { Aliado } from "@/lib/db/aliados.types";
import { parsearContactos } from "@/lib/db/aliados.types";
import {
  actualizarAliadoAction,
  eliminarAliadoAction,
} from "@/app/(admin)/admin/aliados/actions";
import { AliadoForm } from "./AliadoForm";

export function AliadoListItem({ aliado }: { aliado: Aliado }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="rounded-lg border border-white/10 p-4">
        <AliadoForm aliado={aliado} action={actualizarAliadoAction.bind(null, aliado.id)} />
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

  const [primerContacto] = parsearContactos(aliado);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 p-4">
      <div>
        <p className="font-medium text-white">{aliado.servicio}</p>
        <p className="text-sm text-mist-400">
          {primerContacto?.nombre ?? "Sin contacto"}
          {!aliado.imagenUrl && " · sin imagen"}
          {!aliado.activo && " · inactivo"}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditando(true)} className="text-sm underline">
          Editar
        </button>
        <form action={eliminarAliadoAction.bind(null, aliado.id)}>
          <button type="submit" className="text-sm text-rose-400 underline">
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
