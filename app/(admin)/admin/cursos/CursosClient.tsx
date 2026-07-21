"use client";

import { useActionState, useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, Eye, EyeOff, ChevronRight, X, Check } from "lucide-react";
import Link from "next/link";
import type { CursoAdmin } from "@/lib/db/admin";
import { crearCursoAction, eliminarCursoAction, togglePublicadoAction, actualizarCursoAction } from "./actions";

const INIT = { error: null };

function NuevoCursoForm() {
  const [state, action, pending] = useActionState(crearCursoAction, INIT);
  const [open, setOpen] = useState(false);

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 font-semibold text-ink-950 text-sm hover:bg-gold-400 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nuevo curso
        </button>
      ) : (
        <div className="rounded-2xl border border-gold-500/25 bg-ink-900/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold text-white">Nuevo curso</h3>
            <button onClick={() => setOpen(false)} className="text-mist-500 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <form action={action} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Título *</label>
              <input name="titulo" required placeholder="Ej: Liderazgo de Alto Impacto"
                className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Precio (USD)</label>
                <input name="precio" type="number" min="0" step="0.01" defaultValue="0"
                  className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Categoría</label>
                <select name="categoria"
                  className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                >
                  <option value="clases">Clases</option>
                  <option value="sistema_100">Sistema 100+</option>
                </select>
              </div>
            </div>
            {state.error && <p className="text-sm text-red-400">{state.error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={pending}
                className="flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-400 disabled:opacity-50 transition-colors"
              >
                <Check className="h-4 w-4" />
                {pending ? "Guardando…" : "Crear curso"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-mist-400 hover:text-white transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function EditarCursoForm({ curso, onClose }: { curso: CursoAdmin; onClose: () => void }) {
  const action = actualizarCursoAction.bind(null, curso.id);
  const [state, formAction, pending] = useActionState(action, INIT);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <div>
        <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Título</label>
        <input name="titulo" defaultValue={curso.titulo} required
          className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Precio (USD)</label>
          <input name="precio" type="number" min="0" step="0.01" defaultValue={curso.precio}
            className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
          />
        </div>
        <div>
          <label className="block font-mono text-xs text-mist-400 mb-1.5 uppercase tracking-wider">Categoría</label>
          <select name="categoria" defaultValue={curso.categoria}
            className="w-full rounded-lg border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white focus:border-gold-500/50 focus:outline-none"
          >
            <option value="clases">Clases</option>
            <option value="sistema_100">Sistema 100+</option>
          </select>
        </div>
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={pending}
          className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-400 disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-mist-400 hover:text-white">Cancelar</button>
      </div>
    </form>
  );
}

function CursoRow({ curso }: { curso: CursoAdmin }) {
  const [editando, setEditando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-2xl border border-white/8 bg-ink-900/60 p-5 transition-all hover:border-white/12">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/20">
          <BookOpen className="h-5 w-5 text-gold-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-display text-base font-semibold text-white">{curso.titulo}</h3>
            <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
              curso.publicado ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-white/10 bg-white/5 text-mist-500"
            }`}>
              {curso.publicado ? "Publicado" : "Borrador"}
            </span>
            <span className="rounded-full border border-gold-500/20 bg-gold-500/8 px-2.5 py-0.5 font-mono text-[10px] text-gold-500 uppercase">
              {curso.categoria === "sistema_100" ? "Sistema 100+" : "Clases"}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-mist-500">
            ${curso.precio.toFixed(2)} · {curso.totalLecciones} lecciones
          </p>

          {editando && <EditarCursoForm curso={curso} onClose={() => setEditando(false)} />}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/admin/cursos/${curso.id}/lecciones`}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-mist-300 hover:border-gold-500/30 hover:text-gold-300 transition-all"
          >
            Lecciones <ChevronRight className="h-3 w-3" />
          </Link>

          <form action={async () => { await togglePublicadoAction(curso.id, !curso.publicado); }}>
            <button type="submit" title={curso.publicado ? "Despublicar" : "Publicar"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-mist-400 hover:border-gold-500/30 hover:text-gold-400 transition-all"
            >
              {curso.publicado ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </form>

          <button onClick={() => { setEditando(!editando); setConfirmDelete(false); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-mist-400 hover:border-blue-500/30 hover:text-blue-400 transition-all"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-mist-400 hover:border-red-500/30 hover:text-red-400 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <form action={async () => { await eliminarCursoAction(curso.id); }} className="flex items-center gap-1">
              <button type="submit" className="rounded-lg bg-red-500/20 border border-red-500/40 px-2 py-1 font-mono text-[11px] text-red-400 hover:bg-red-500/30">
                Confirmar
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="font-mono text-[11px] text-mist-500 hover:text-white px-1">
                No
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function CursosClient({ cursos }: { cursos: CursoAdmin[] }) {
  const publicados = cursos.filter((c) => c.publicado).length;
  const borradores = cursos.filter((c) => !c.publicado).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Cursos</h1>
          <p className="mt-1 font-mono text-xs text-mist-400">
            {publicados} publicados · {borradores} borradores
          </p>
        </div>
        <NuevoCursoForm />
      </div>

      {cursos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-mist-500 mb-3" />
          <p className="text-mist-400">No hay cursos aún. Crea el primero.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cursos.map((c) => <CursoRow key={c.id} curso={c} />)}
        </div>
      )}
    </div>
  );
}
