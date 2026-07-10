"use client";

import { useActionState } from "react";
import type { ClaseCalendario } from "@/lib/db/calendario";
import type { ClaseFormState } from "@/app/(admin)/admin/calendario/actions";

const estadoInicial: ClaseFormState = { error: null };

const CAMPO_CLASES =
  "h-11 w-full rounded-lg border border-white/10 bg-ink-950 px-3 text-sm text-white placeholder:text-mist-500 outline-none transition focus:border-gold-500/60";

export function ClaseForm({
  clase,
  action,
}: {
  clase?: ClaseCalendario;
  action: (prevState: ClaseFormState, formData: FormData) => Promise<ClaseFormState>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Nombre
        <input name="nombre" defaultValue={clase?.nombre} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Fecha ancla
        <input
          type="date"
          name="fechaAncla"
          defaultValue={clase?.fechaAncla}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Recurrencia
        <select
          name="recurrencia"
          defaultValue={clase?.recurrencia ?? "semanal"}
          className={CAMPO_CLASES}
        >
          <option value="semanal">Semanal</option>
          <option value="quincenal">Quincenal</option>
          <option value="unica">Única</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Hora de inicio (EST)
        <input
          type="time"
          name="horaInicio"
          defaultValue={clase?.horaInicio}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Hora de fin (EST)
        <input
          type="time"
          name="horaFin"
          defaultValue={clase?.horaFin}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Dirige
        <input
          name="dirigidoPor"
          defaultValue={clase?.dirigidoPor ?? ""}
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Modalidad
        <select
          name="modalidad"
          defaultValue={clase?.modalidad ?? "online"}
          className={CAMPO_CLASES}
        >
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
          <option value="hibrida">Híbrida</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Enlace de sesión (Zoom)
        <input
          name="enlaceSesion"
          defaultValue={clase?.enlaceSesion ?? ""}
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Enlace de preguntas / precalificación
        <input
          name="enlacePreguntas"
          defaultValue={clase?.enlacePreguntas ?? ""}
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        URL de la imagen
        <input name="imagenUrl" defaultValue={clase?.imagenUrl ?? ""} className={CAMPO_CLASES} />
      </label>

      <label className="flex items-center gap-2 text-sm text-mist-300">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={clase?.activo ?? true}
          className="h-4 w-4 rounded border-white/20 bg-ink-950 text-gold-500"
        />
        Activa
      </label>

      {estado.error && (
        <p role="alert" className="text-sm text-rose-400 sm:col-span-2">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="h-11 rounded-lg bg-gold-500 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60 sm:col-span-2"
      >
        {pendiente ? "Guardando..." : clase ? "Guardar cambios" : "Crear clase"}
      </button>
    </form>
  );
}
