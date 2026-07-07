"use client";

import { useActionState } from "react";
import { login, loginConGoogle, type LoginState } from "./actions";

const estadoInicial: LoginState = { error: null };

export function LoginForm() {
  const [estado, formAction, pendiente] = useActionState(login, estadoInicial);

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span>Correo</span>
          <input name="email" type="email" className="border rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1">
          <span>Contraseña</span>
          <input name="password" type="password" className="border rounded px-3 py-2" />
        </label>
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
          {pendiente ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => loginConGoogle()}
        className="border rounded px-4 py-2"
      >
        Continuar con Google
      </button>
    </div>
  );
}
