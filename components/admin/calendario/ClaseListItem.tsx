"use client";

import { useState } from "react";
import type { ClaseCalendario } from "@/lib/db/calendario";
import { actualizarClaseAction, eliminarClaseAction } from "@/app/(admin)/admin/calendario/actions";
import { ClaseForm } from "./ClaseForm";

export function ClaseListItem({ clase }: { clase: ClaseCalendario }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="rounded-lg border border-white/10 p-4">
        <ClaseForm clase={clase} action={actualizarClaseAction.bind(null, clase.id)} />
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
        <p className="font-medium text-white">{clase.nombre}</p>
        <p className="text-sm text-mist-400">
          {clase.fechaAncla} · {clase.horaInicio}–{clase.horaFin} · {clase.recurrencia}
          {!clase.activo && " · inactiva"}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditando(true)} className="text-sm underline">
          Editar
        </button>
        <form action={eliminarClaseAction.bind(null, clase.id)}>
          <button type="submit" className="text-sm text-rose-400 underline">
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
