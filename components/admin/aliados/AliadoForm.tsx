"use client";

import { useActionState } from "react";
import type { Aliado } from "@/lib/db/aliados.types";
import type { AliadoFormState } from "@/app/(admin)/admin/aliados/actions";

const estadoInicial: AliadoFormState = { error: null };

const CAMPO_CLASES =
  "h-11 w-full rounded-lg border border-white/10 bg-ink-950 px-3 text-sm text-white placeholder:text-mist-500 outline-none transition focus:border-gold-500/60";

export function AliadoForm({
  aliado,
  action,
}: {
  aliado?: Aliado;
  action: (prevState: AliadoFormState, formData: FormData) => Promise<AliadoFormState>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Servicio
        <input name="servicio" defaultValue={aliado?.servicio} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Descripción
        <textarea
          name="descripcion"
          defaultValue={aliado?.descripcion}
          required
          rows={3}
          className={`${CAMPO_CLASES} h-auto py-2`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Contacto(s) — nombre
        <textarea
          name="contactoNombre"
          defaultValue={aliado?.contactoNombre}
          required
          rows={2}
          placeholder="Un nombre por línea si hay más de un contacto"
          className={`${CAMPO_CLASES} h-auto py-2`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Contacto(s) — teléfono
        <textarea
          name="contactoTelefono"
          defaultValue={aliado?.contactoTelefono}
          required
          rows={2}
          placeholder="Mismo orden que los nombres, un teléfono por línea"
          className={`${CAMPO_CLASES} h-auto py-2`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Contacto(s) — correo
        <textarea
          name="contactoCorreo"
          defaultValue={aliado?.contactoCorreo}
          required
          rows={2}
          placeholder="Mismo orden que los nombres, un correo por línea"
          className={`${CAMPO_CLASES} h-auto py-2`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Orden
        <input type="number" name="orden" defaultValue={aliado?.orden ?? 0} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        URL de imagen (Supabase Storage)
        <input
          name="imagenUrl"
          defaultValue={aliado?.imagenUrl ?? ""}
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-mist-300">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={aliado?.activo ?? true}
          className="h-4 w-4 rounded border-white/20 bg-ink-950 text-gold-500"
        />
        Activo
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
        {pendiente ? "Guardando..." : aliado ? "Guardar cambios" : "Crear aliado"}
      </button>
    </form>
  );
}
