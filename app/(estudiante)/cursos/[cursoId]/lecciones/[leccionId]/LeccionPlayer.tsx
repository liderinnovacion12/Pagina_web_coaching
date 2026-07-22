"use client";

import { useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { Loader2, MessageSquare, CheckCircle2, Send } from "lucide-react";
import { marcarProgresoAction } from "./actions";
import { guardarComentarioAction } from "@/lib/comentarios/actions";

function ComentarioWidget({
  leccionId,
  cursoId,
  comentarioInicial,
}: {
  leccionId: string;
  cursoId: string;
  comentarioInicial: string | null;
}) {
  const [texto, setTexto] = useState(comentarioInicial ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(!!comentarioInicial);
  const [error, setError] = useState("");

  async function handleGuardar() {
    setGuardando(true);
    setError("");
    const r = await guardarComentarioAction(leccionId, cursoId, texto);
    setGuardando(false);
    if (r.ok) setGuardado(true);
    else setError(r.error ?? "Error al guardar.");
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/[0.08] bg-ink-900/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-gold-400" />
        <h3 className="font-display text-sm font-semibold text-white">Tu comentario</h3>
        {guardado && (
          <span className="flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 font-mono text-[10px] text-green-400">
            <CheckCircle2 className="h-3 w-3" /> Guardado
          </span>
        )}
      </div>

      <textarea
        value={texto}
        onChange={(e) => { setTexto(e.target.value); setGuardado(false); }}
        placeholder="Escribe tu comentario sobre esta lección…"
        rows={4}
        className="w-full resize-none rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-white placeholder:text-mist-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/20"
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleGuardar}
        disabled={guardando || !texto.trim() || (guardado && texto === (comentarioInicial ?? ""))}
        className="mt-3 flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 font-semibold text-sm text-ink-950 transition-all hover:bg-gold-400 disabled:opacity-50 active:scale-[0.98]"
      >
        {guardando
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</>
          : guardado
            ? <><CheckCircle2 className="h-4 w-4" /> Actualizar comentario</>
            : <><Send className="h-4 w-4" /> Guardar comentario</>
        }
      </button>
    </div>
  );
}

export function LeccionPlayer({
  leccionId,
  cursoId,
  muxAssetId,
  completado,
  comentarioInicial,
}: {
  leccionId: string;
  cursoId: string;
  muxAssetId: string | null;
  completado: boolean;
  comentarioInicial: string | null;
}) {
  const [completadaLocal, setCompletadaLocal] = useState(completado);
  const [guardando, setGuardando] = useState(false);
  const ultimoSegundoEnviado = useRef(-1);

  async function marcarCompletada() {
    setGuardando(true);
    const resultado = await marcarProgresoAction(leccionId, { completado: true });
    setGuardando(false);
    if (!resultado.error) setCompletadaLocal(true);
  }

  if (muxAssetId) {
    return (
      <div className="flex flex-col">
        <div className="overflow-hidden rounded-xl border border-white/[0.08]">
          <MuxPlayer
            playbackId={muxAssetId}
            onTimeUpdate={(evento) => {
              const segundo = Math.floor((evento.target as HTMLMediaElement).currentTime);
              if (segundo > ultimoSegundoEnviado.current) {
                ultimoSegundoEnviado.current = segundo;
                void marcarProgresoAction(leccionId, { segundoActual: segundo });
              }
            }}
            onEnded={() => {
              void marcarProgresoAction(leccionId, { completado: true });
              setCompletadaLocal(true);
            }}
          />
        </div>
        <ComentarioWidget leccionId={leccionId} cursoId={cursoId} comentarioInicial={comentarioInicial} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-12 text-center">
        <p className="text-mist-400">Video no disponible todavía</p>
        {completadaLocal ? (
          <p className="text-sm font-medium text-emerald-400">Completada</p>
        ) : (
          <button
            type="button"
            onClick={marcarCompletada}
            disabled={guardando}
            className="flex h-[44px] items-center gap-2 rounded-xl bg-gold-500 px-6 font-semibold text-ink-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Marcar como completada
          </button>
        )}
      </div>
      <ComentarioWidget leccionId={leccionId} cursoId={cursoId} comentarioInicial={comentarioInicial} />
    </div>
  );
}
