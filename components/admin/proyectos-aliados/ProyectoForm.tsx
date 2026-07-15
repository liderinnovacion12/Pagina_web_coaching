"use client";

import { useActionState } from "react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import type { ProyectoFormState } from "@/app/(admin)/admin/proyectos-inmobiliarios-aliados/actions";

const estadoInicial: ProyectoFormState = { error: null };

const CAMPO_CLASES =
  "h-11 w-full rounded-lg border border-white/10 bg-ink-950 px-3 text-sm text-white placeholder:text-mist-500 outline-none transition focus:border-gold-500/60";

export function ProyectoForm({
  proyecto,
  action,
}: {
  proyecto?: ProyectoAliado;
  action: (prevState: ProyectoFormState, formData: FormData) => Promise<ProyectoFormState>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Nombre
        <input name="nombre" defaultValue={proyecto?.nombre} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Descripción
        <textarea
          name="descripcion"
          defaultValue={proyecto?.descripcion}
          required
          rows={3}
          className={`${CAMPO_CLASES} h-auto py-2`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Precio (opcional)
        <input
          name="precioDesde"
          defaultValue={proyecto?.precioDesde ?? ""}
          placeholder="Desde $480K"
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Orden
        <input type="number" name="orden" defaultValue={proyecto?.orden ?? 0} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Contacto In House
        <input
          name="contactoNombre"
          defaultValue={proyecto?.contactoNombre}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Teléfono de contacto
        <input
          name="contactoTelefono"
          defaultValue={proyecto?.contactoTelefono}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Enlace de WhatsApp
        <input
          name="whatsappUrl"
          defaultValue={proyecto?.whatsappUrl}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        URL de imagen (Supabase Storage)
        <input
          name="imagenUrl"
          defaultValue={proyecto?.imagenUrl ?? ""}
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-mist-300">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={proyecto?.activo ?? true}
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
        {pendiente ? "Guardando..." : proyecto ? "Guardar cambios" : "Crear proyecto"}
      </button>
    </form>
  );
}
