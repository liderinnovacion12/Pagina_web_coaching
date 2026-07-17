"use client";

import { useActionState } from "react";
import type { ContactoSoporte } from "@/lib/db/contactos-soporte.types";
import type { ContactoSoporteFormState } from "@/app/(admin)/admin/soporte/actions";

const estadoInicial: ContactoSoporteFormState = { error: null };

const CAMPO_CLASES =
  "h-11 w-full rounded-lg border border-white/10 bg-ink-950 px-3 text-sm text-white placeholder:text-mist-500 outline-none transition focus:border-gold-500/60";

export function ContactoSoporteForm({
  contacto,
  action,
}: {
  contacto?: ContactoSoporte;
  action: (
    prevState: ContactoSoporteFormState,
    formData: FormData
  ) => Promise<ContactoSoporteFormState>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Nombre
        <input name="nombre" defaultValue={contacto?.nombre} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Cargo
        <input
          name="cargo"
          defaultValue={contacto?.cargo}
          required
          placeholder="Ej. DIRECTOR – MARKETING"
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Orden
        <input type="number" name="orden" defaultValue={contacto?.orden ?? 0} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Descripción del cargo
        <input
          name="descripcionCargo"
          defaultValue={contacto?.descripcionCargo}
          required
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Teléfono
        <input name="telefono" defaultValue={contacto?.telefono} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Correo
        <input name="correo" defaultValue={contacto?.correo} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        URL de foto (Supabase Storage, opcional)
        <input name="fotoUrl" defaultValue={contacto?.fotoUrl ?? ""} className={CAMPO_CLASES} />
      </label>

      <label className="flex items-center gap-2 text-sm text-mist-300">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={contacto?.activo ?? true}
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
        {pendiente ? "Guardando..." : contacto ? "Guardar cambios" : "Crear contacto"}
      </button>
    </form>
  );
}
