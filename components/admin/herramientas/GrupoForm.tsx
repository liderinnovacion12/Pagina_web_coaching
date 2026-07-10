"use client";

import { useActionState } from "react";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";
import type { GrupoFormState } from "@/app/(admin)/admin/herramientas/actions";

const estadoInicial: GrupoFormState = { error: null };

const CAMPO_CLASES =
  "h-11 w-full rounded-lg border border-white/10 bg-ink-950 px-3 text-sm text-white placeholder:text-mist-500 outline-none transition focus:border-gold-500/60";

export function GrupoForm({
  grupo,
  action,
}: {
  grupo?: GrupoComunidad;
  action: (prevState: GrupoFormState, formData: FormData) => Promise<GrupoFormState>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Nombre
        <input name="nombre" defaultValue={grupo?.nombre} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Categoría
        <select name="categoria" defaultValue={grupo?.categoria ?? "otros"} className={CAMPO_CLASES}>
          <option value="grupo_principal">Grupo Principal</option>
          <option value="miami">Miami</option>
          <option value="orlando_centro_florida">Orlando y Centro de Florida</option>
          <option value="venta_renta">Venta y Renta</option>
          <option value="otros">Otros</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Tipo de canal
        <select name="tipoCanal" defaultValue={grupo?.tipoCanal ?? "whatsapp"} className={CAMPO_CLASES}>
          <option value="whatsapp">WhatsApp</option>
          <option value="dropbox">Dropbox</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Detalle (zona o tipo de proyecto)
        <input name="detalle" defaultValue={grupo?.detalle ?? ""} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Enlace (WhatsApp o Dropbox)
        <input name="enlaceUrl" defaultValue={grupo?.enlaceUrl ?? ""} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Orden
        <input type="number" name="orden" defaultValue={grupo?.orden ?? 0} className={CAMPO_CLASES} />
      </label>

      <label className="flex items-center gap-2 text-sm text-mist-300">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={grupo?.activo ?? true}
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
        {pendiente ? "Guardando..." : grupo ? "Guardar cambios" : "Crear grupo"}
      </button>
    </form>
  );
}
