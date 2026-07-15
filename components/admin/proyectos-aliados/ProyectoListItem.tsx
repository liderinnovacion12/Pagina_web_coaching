"use client";

import { useState } from "react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import {
  actualizarProyectoAction,
  eliminarProyectoAction,
} from "@/app/(admin)/admin/proyectos-inmobiliarios-aliados/actions";
import { ProyectoForm } from "./ProyectoForm";

export function ProyectoListItem({ proyecto }: { proyecto: ProyectoAliado }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="rounded-lg border border-white/10 p-4">
        <ProyectoForm proyecto={proyecto} action={actualizarProyectoAction.bind(null, proyecto.id)} />
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
        <p className="font-medium text-white">{proyecto.nombre}</p>
        <p className="text-sm text-mist-400">
          {proyecto.precioDesde ?? "Sin precio"}
          {!proyecto.imagenUrl && " · sin imagen"}
          {!proyecto.activo && " · inactivo"}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditando(true)} className="text-sm underline">
          Editar
        </button>
        <form action={eliminarProyectoAction.bind(null, proyecto.id)}>
          <button type="submit" className="text-sm text-rose-400 underline">
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
