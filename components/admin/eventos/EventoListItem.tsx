"use client";

import { useState } from "react";
import type { Evento } from "@/lib/db/eventos.types";
import { CATEGORIA_EVENTO_INFO } from "@/lib/db/eventos.types";
import { actualizarEventoAction, eliminarEventoAction } from "@/app/(admin)/admin/eventos/actions";
import { EventoForm } from "./EventoForm";

export function EventoListItem({ evento }: { evento: Evento }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="rounded-lg border border-white/10 p-4">
        <EventoForm evento={evento} action={actualizarEventoAction.bind(null, evento.id)} />
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
        <p className="font-medium text-white">{evento.titulo}</p>
        <p className="text-sm text-mist-400">
          {CATEGORIA_EVENTO_INFO[evento.categoria].titulo} · {evento.fechas.length} fecha
          {evento.fechas.length === 1 ? "" : "s"}
          {!evento.youtubeUrl && " · sin video"}
          {!evento.activo && " · inactivo"}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditando(true)} className="text-sm underline">
          Editar
        </button>
        <form action={eliminarEventoAction.bind(null, evento.id)}>
          <button type="submit" className="text-sm text-rose-400 underline">
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
