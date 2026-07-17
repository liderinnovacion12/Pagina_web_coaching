"use client";

import { useActionState, useState } from "react";
import type { Evento } from "@/lib/db/eventos.types";
import type { EventoFormState } from "@/app/(admin)/admin/eventos/actions";

const estadoInicial: EventoFormState = { error: null };

const CAMPO_CLASES =
  "h-11 w-full rounded-lg border border-white/10 bg-ink-950 px-3 text-sm text-white placeholder:text-mist-500 outline-none transition focus:border-gold-500/60";

type FilaFecha = {
  clave: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
};

let contadorFilas = 0;

function nuevaFilaFecha(): FilaFecha {
  contadorFilas += 1;
  return { clave: `fila-${contadorFilas}`, fechaInicio: "", fechaFin: "", ubicacion: "" };
}

export function EventoForm({
  evento,
  action,
}: {
  evento?: Evento;
  action: (prevState: EventoFormState, formData: FormData) => Promise<EventoFormState>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, estadoInicial);
  const [fechas, setFechas] = useState<FilaFecha[]>(() =>
    evento && evento.fechas.length > 0
      ? evento.fechas.map((fecha) => ({
          clave: fecha.id,
          fechaInicio: fecha.fechaInicio,
          fechaFin: fecha.fechaFin,
          ubicacion: fecha.ubicacion,
        }))
      : [nuevaFilaFecha()]
  );

  function actualizarFila(clave: string, campo: keyof Omit<FilaFecha, "clave">, valor: string) {
    setFechas((filas) => filas.map((fila) => (fila.clave === clave ? { ...fila, [campo]: valor } : fila)));
  }

  function agregarFila() {
    setFechas((filas) => [...filas, nuevaFilaFecha()]);
  }

  function quitarFila(clave: string) {
    setFechas((filas) => (filas.length > 1 ? filas.filter((fila) => fila.clave !== clave) : filas));
  }

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Categoría
        <select
          name="categoria"
          defaultValue={evento?.categoria ?? "internacional"}
          className={CAMPO_CLASES}
        >
          <option value="internacional">Eventos Internacionales</option>
          <option value="nacional_eeuu">Eventos Nacionales en EE.UU.</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300">
        Orden
        <input type="number" name="orden" defaultValue={evento?.orden ?? 0} className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Título
        <input name="titulo" defaultValue={evento?.titulo} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        Subtítulo
        <input name="subtitulo" defaultValue={evento?.subtitulo} required className={CAMPO_CLASES} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-mist-300 sm:col-span-2">
        URL de YouTube (opcional)
        <input
          name="youtubeUrl"
          defaultValue={evento?.youtubeUrl ?? ""}
          placeholder="https://www.youtube.com/watch?v=..."
          className={CAMPO_CLASES}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-mist-300 sm:col-span-2">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={evento?.activo ?? true}
          className="h-4 w-4 rounded border-white/20 bg-ink-950 text-gold-500"
        />
        Activo
      </label>

      <div className="flex flex-col gap-3 rounded-xl border border-white/10 p-4 sm:col-span-2">
        <p className="text-sm font-semibold text-white">Fechas</p>
        {fechas.map((fila) => (
          <div key={fila.clave} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <label className="flex flex-col gap-1 text-xs text-mist-400">
              Inicio
              <input
                type="date"
                name="fechaInicio"
                required
                value={fila.fechaInicio}
                onChange={(evento) => actualizarFila(fila.clave, "fechaInicio", evento.target.value)}
                className={CAMPO_CLASES}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-mist-400">
              Fin
              <input
                type="date"
                name="fechaFin"
                required
                value={fila.fechaFin}
                onChange={(evento) => actualizarFila(fila.clave, "fechaFin", evento.target.value)}
                className={CAMPO_CLASES}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-mist-400">
              Ubicación
              <input
                name="ubicacion"
                required
                value={fila.ubicacion}
                onChange={(evento) => actualizarFila(fila.clave, "ubicacion", evento.target.value)}
                className={CAMPO_CLASES}
              />
            </label>
            <button
              type="button"
              onClick={() => quitarFila(fila.clave)}
              disabled={fechas.length === 1}
              className="h-11 rounded-lg border border-white/10 px-3 text-sm text-mist-400 transition hover:border-rose-400/40 hover:text-rose-400 disabled:opacity-40"
            >
              Quitar
            </button>
          </div>
        ))}
        <button type="button" onClick={agregarFila} className="self-start text-sm text-gold-300 underline">
          Agregar fecha
        </button>
      </div>

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
        {pendiente ? "Guardando..." : evento ? "Guardar cambios" : "Crear evento"}
      </button>
    </form>
  );
}
