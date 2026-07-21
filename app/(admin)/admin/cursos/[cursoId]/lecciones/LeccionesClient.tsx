"use client";

import { useActionState, useState } from "react";
import { Play, Plus, Trash2, GripVertical, Video, FileText, X, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { LeccionAdmin } from "@/lib/db/admin";
import { crearLeccionAction, eliminarLeccionAction } from "./actions";

const INIT = { error: null };

const TIPO_ICONS: Record<string, React.ReactNode> = {
  video: <Video className="h-4 w-4 text-blue-400" />,
  pdf: <FileText className="h-4 w-4 text-gold-400" />,
};

function NuevaLeccionForm({ cursoId }: { cursoId: string }) {
  const action = crearLeccionAction.bind(null, cursoId);
  const [state, formAction, pending] = useActionState(action, INIT);
  const [open, setOpen] = useState(false);

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 font-semibold text-ink-950 text-sm hover:bg-gold-400 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nueva lección
        </button>
      ) : (
        <div className="rounded-2xl border border-gold-500/25 bg-ink-900/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold text-white">Nueva lección</h3>
            <button onClick={() => setOpen(false)} className="text-mist-500 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Título *</label>
              <input name="titulo" required placeholder="Ej: Introducción al liderazgo"
                className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Tipo</label>
                <select name="tipo_contenido"
                  className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white focus:border-gold-500/50 focus:outline-none"
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="texto">Texto</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Orden</label>
                <input name="orden" type="number" min="0" defaultValue="0"
                  className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white focus:border-gold-500/50 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">
                Mux Asset ID <span className="normal-case text-mist-500">(opcional)</span>
              </label>
              <input name="mux_asset_id" placeholder="asset_xxxxxxxxxxxxxxx"
                className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-gold-500/50 focus:outline-none"
              />
              <p className="mt-1 font-mono text-[10px] text-mist-500">ID del video en Mux — déjalo vacío si aún no tienes el video.</p>
            </div>
            {state.error && <p className="text-sm text-red-400">{state.error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={pending}
                className="flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-400 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {pending ? "Guardando…" : "Crear lección"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-mist-400 hover:text-white">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function LeccionRow({ leccion, cursoId }: { leccion: LeccionAdmin; cursoId: string }) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-ink-900/60 px-4 py-3 transition-all hover:border-white/12">
      <GripVertical className="h-4 w-4 text-mist-600 shrink-0 cursor-grab" />

      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-800 border border-white/8`}>
        {TIPO_ICONS[leccion.tipo_contenido] ?? <Play className="h-4 w-4 text-mist-400" />}
      </div>

      <span className="font-mono text-xs text-mist-500 w-6 shrink-0 text-center">{leccion.orden}</span>

      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-medium text-white truncate">{leccion.titulo}</p>
        <p className="font-mono text-[10px] text-mist-500 mt-0.5">
          {leccion.tipo_contenido}
          {leccion.mux_asset_id && <span className="ml-2 text-blue-400/70">· Mux: {leccion.mux_asset_id.slice(0, 16)}…</span>}
        </p>
      </div>

      {!confirm ? (
        <button onClick={() => setConfirm(true)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-mist-500 hover:border-red-500/30 hover:text-red-400 transition-all shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <form action={async () => { await eliminarLeccionAction(cursoId, leccion.id); }} className="flex items-center gap-1 shrink-0">
          <button type="submit" className="rounded-lg bg-red-500/20 border border-red-500/40 px-2 py-1 font-mono text-[10px] text-red-400 hover:bg-red-500/30">
            Eliminar
          </button>
          <button type="button" onClick={() => setConfirm(false)} className="font-mono text-[10px] text-mist-500 hover:text-white px-1">
            No
          </button>
        </form>
      )}
    </div>
  );
}

export function LeccionesClient({
  lecciones, cursoId, cursoTitulo,
}: {
  lecciones: LeccionAdmin[];
  cursoId: string;
  cursoTitulo: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/cursos" className="flex items-center gap-1 font-mono text-xs text-mist-400 hover:text-gold-300 mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a cursos
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Lecciones</h1>
            <p className="mt-1 font-mono text-xs text-mist-400">{cursoTitulo} · {lecciones.length} lecciones</p>
          </div>
          <NuevaLeccionForm cursoId={cursoId} />
        </div>
      </div>

      {lecciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <Play className="mx-auto h-10 w-10 text-mist-500 mb-3" />
          <p className="text-mist-400">No hay lecciones aún. Crea la primera.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lecciones.map((l) => <LeccionRow key={l.id} leccion={l} cursoId={cursoId} />)}
        </div>
      )}
    </div>
  );
}
