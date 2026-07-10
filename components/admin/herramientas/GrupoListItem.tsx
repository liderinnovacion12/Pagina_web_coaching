"use client";

import { useState } from "react";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad";
import { ETIQUETA_CATEGORIA } from "@/lib/db/grupos-comunidad";
import { actualizarGrupoAction, eliminarGrupoAction } from "@/app/(admin)/admin/herramientas/actions";
import { GrupoForm } from "./GrupoForm";

export function GrupoListItem({ grupo }: { grupo: GrupoComunidad }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="rounded-lg border border-white/10 p-4">
        <GrupoForm grupo={grupo} action={actualizarGrupoAction.bind(null, grupo.id)} />
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
        <p className="font-medium text-white">{grupo.nombre}</p>
        <p className="text-sm text-mist-400">
          {ETIQUETA_CATEGORIA[grupo.categoria]} · {grupo.tipoCanal}
          {!grupo.enlaceUrl && " · sin enlace"}
          {!grupo.activo && " · inactivo"}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditando(true)} className="text-sm underline">
          Editar
        </button>
        <form action={eliminarGrupoAction.bind(null, grupo.id)}>
          <button type="submit" className="text-sm text-rose-400 underline">
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
