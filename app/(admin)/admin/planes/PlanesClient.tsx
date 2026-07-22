"use client";

import { useActionState, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Star, ToggleLeft, ToggleRight } from "lucide-react";
import {
  crearPlanAction,
  actualizarPlanAction,
  togglePlanActivoAction,
  eliminarPlanAction,
  type PlanState,
} from "./actions";

type Plan = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_dias: number;
  activo: boolean;
  destacado: boolean;
};

const INIT: PlanState = { error: null };

const INPUT = "w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30";

function PlanForm({
  plan,
  onCancel,
}: {
  plan?: Plan;
  onCancel: () => void;
}) {
  const action = plan
    ? actualizarPlanAction.bind(null, plan.id)
    : crearPlanAction;
  const [state, formAction, pending] = useActionState(action, INIT);

  return (
    <form action={async (fd) => { await formAction(fd); if (!state.error) onCancel(); }} className="space-y-4 rounded-2xl border border-gold-500/25 bg-ink-900/80 p-6">
      <h3 className="font-display text-base font-semibold text-white">
        {plan ? "Editar plan" : "Nuevo plan"}
      </h3>

      <div>
        <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Nombre *</label>
        <input name="nombre" required defaultValue={plan?.nombre} placeholder="Plan Ilimitado" className={INPUT} />
      </div>

      <div>
        <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Descripción *</label>
        <textarea name="descripcion" required rows={2} defaultValue={plan?.descripcion}
          placeholder="Acceso a todos los cursos sin restricciones…"
          className={`${INPUT} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Precio (USD) *</label>
          <input name="precio" type="number" min="0.01" step="0.01" required defaultValue={plan?.precio ?? ""} placeholder="100" className={INPUT} />
        </div>
        <div>
          <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Duración (días)</label>
          <input name="duracion_dias" type="number" min="1" defaultValue={plan?.duracion_dias ?? 30} className={INPUT} />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" name="destacado" defaultChecked={plan?.destacado ?? false}
          className="h-4 w-4 rounded border-white/20 bg-ink-800 text-gold-500 focus:ring-gold-500/40"
        />
        <span className="text-sm text-mist-300">Marcar como plan destacado (MÁS POPULAR)</span>
      </label>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={pending}
          className="flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-400 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          {pending ? "Guardando…" : plan ? "Guardar cambios" : "Crear plan"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-mist-400 hover:text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function PlanRow({ plan }: { plan: Plan }) {
  const [editando, setEditando] = useState(false);
  const [confirm, setConfirm] = useState(false);

  if (editando) {
    return <PlanForm plan={plan} onCancel={() => setEditando(false)} />;
  }

  return (
    <div className={`rounded-xl border bg-ink-900/60 p-5 transition-all ${plan.activo ? "border-white/8" : "border-white/4 opacity-50"}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-display text-base font-semibold text-white">{plan.nombre}</p>
            {plan.destacado && (
              <span className="flex items-center gap-1 rounded-full bg-gold-500/15 border border-gold-500/30 px-2 py-0.5 font-mono text-[10px] text-gold-400">
                <Star className="h-2.5 w-2.5" /> Destacado
              </span>
            )}
            {!plan.activo && (
              <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-mist-500">
                Inactivo
              </span>
            )}
          </div>
          <p className="text-sm text-mist-400 mb-3">{plan.descripcion}</p>
          <div className="flex items-center gap-4 font-mono text-xs text-mist-500">
            <span className="text-gold-400 font-bold text-base">${Number(plan.precio).toFixed(2)} USD</span>
            <span>· {plan.duracion_dias} días</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => togglePlanActivoAction(plan.id, !plan.activo)}
            title={plan.activo ? "Desactivar" : "Activar"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-mist-400 hover:border-gold-500/30 hover:text-gold-300 transition-all"
          >
            {plan.activo
              ? <ToggleRight className="h-4 w-4 text-emerald-400" />
              : <ToggleLeft className="h-4 w-4" />
            }
          </button>
          <button onClick={() => setEditando(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-mist-400 hover:border-gold-500/30 hover:text-gold-300 transition-all"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {!confirm ? (
            <button onClick={() => setConfirm(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-mist-400 hover:border-red-500/30 hover:text-red-400 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={() => eliminarPlanAction(plan.id)}
                className="rounded-lg bg-red-500/20 border border-red-500/40 px-2 py-1 font-mono text-[10px] text-red-400 hover:bg-red-500/30"
              >
                Eliminar
              </button>
              <button onClick={() => setConfirm(false)} className="font-mono text-[10px] text-mist-500 hover:text-white px-1">
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlanesClient({ planes }: { planes: Plan[] }) {
  const [creando, setCreando] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Planes de membresía</h1>
          <p className="mt-1 font-mono text-xs text-mist-400">{planes.length} plan{planes.length !== 1 ? "es" : ""} configurado{planes.length !== 1 ? "s" : ""}</p>
        </div>
        {!creando && (
          <button onClick={() => setCreando(true)}
            className="flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 font-semibold text-ink-950 text-sm hover:bg-gold-400 transition-colors"
          >
            <Plus className="h-4 w-4" /> Nuevo plan
          </button>
        )}
      </div>

      {creando && <PlanForm onCancel={() => setCreando(false)} />}

      {planes.length === 0 && !creando ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-mist-400">No hay planes configurados. Crea el primero.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {planes.map((p) => <PlanRow key={p.id} plan={p} />)}
        </div>
      )}
    </div>
  );
}
