"use client";

import { useActionState } from "react";
import { registrar, type RegistroState } from "./actions";

const SECTORES = [
  { valor: "liderazgo", etiqueta: "Liderazgo" },
  { valor: "ventas", etiqueta: "Ventas" },
  { valor: "finanzas", etiqueta: "Finanzas" },
  { valor: "marketing", etiqueta: "Marketing" },
  { valor: "tecnologia", etiqueta: "Tecnología" },
];

const estadoInicial: RegistroState = { error: null };

export function RegistroForm() {
  const [estado, formAction, pendiente] = useActionState(registrar, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      <label className="flex flex-col gap-1">
        <span>Correo</span>
        <input name="email" type="email" className="border rounded px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        <span>Contraseña</span>
        <input name="password" type="password" className="border rounded px-3 py-2" />
      </label>
      <fieldset className="flex flex-col gap-1">
        <legend>Tus intereses</legend>
        {SECTORES.map((sector) => (
          <label key={sector.valor} className="flex items-center gap-2">
            <input type="checkbox" name="intereses" value={sector.valor} />
            {sector.etiqueta}
          </label>
        ))}
      </fieldset>
      {estado.error && (
        <p role="alert" className="text-red-600">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="bg-slate-900 text-white rounded px-4 py-2"
      >
        {pendiente ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
