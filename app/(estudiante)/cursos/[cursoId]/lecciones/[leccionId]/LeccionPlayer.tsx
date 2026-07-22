"use client";

import { useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { Loader2, Star, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { marcarProgresoAction } from "./actions";
import { guardarReseñaAction } from "@/lib/resenas/actions";

/* ── Rating widget ───────────────────────────────────────────── */
function RatingWidget({
  leccionId,
  cursoId,
  reseñaInicial,
}: {
  leccionId: string;
  cursoId: string;
  reseñaInicial: { estrellas: number; comentario: string | null } | null;
}) {
  const [estrellas, setEstrellas] = useState(reseñaInicial?.estrellas ?? 0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState(reseñaInicial?.comentario ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(!!reseñaInicial);
  const [error, setError] = useState("");

  async function handleGuardar() {
    if (estrellas === 0) { setError("Selecciona al menos 1 estrella."); return; }
    setGuardando(true);
    setError("");
    const r = await guardarReseñaAction(leccionId, cursoId, estrellas, comentario);
    setGuardando(false);
    if (r.ok) setGuardado(true);
    else setError(r.error ?? "Error al guardar.");
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.08] bg-ink-900/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4 text-gold-400" />
        <h3 className="font-display text-sm font-semibold text-white">
          {guardado ? "Tu calificación" : "¿Cómo estuvo esta lección?"}
        </h3>
        {guardado && (
          <span className="flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 font-mono text-[10px] text-green-400">
            <CheckCircle2 className="h-3 w-3" /> Guardada
          </span>
        )}
      </div>

      {/* Estrellas */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setEstrellas(i); setGuardado(false); }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`${i} estrella${i > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                i <= (hover || estrellas)
                  ? "text-gold-400 fill-gold-400"
                  : "text-mist-700"
              }`}
            />
          </button>
        ))}
        {estrellas > 0 && (
          <span className="ml-2 font-mono text-xs text-mist-400">
            {["", "Muy mala", "Mala", "Regular", "Buena", "Excelente"][estrellas]}
          </span>
        )}
      </div>

      {/* Comentario */}
      <textarea
        value={comentario}
        onChange={(e) => { setComentario(e.target.value); setGuardado(false); }}
        placeholder="Deja tu comentario sobre esta lección (opcional)…"
        rows={3}
        className="w-full resize-none rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-white placeholder:text-mist-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/20"
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleGuardar}
        disabled={guardando || (guardado && estrellas === (reseñaInicial?.estrellas ?? 0) && comentario === (reseñaInicial?.comentario ?? ""))}
        className="mt-3 flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 font-semibold text-sm text-ink-950 transition-all hover:bg-gold-400 disabled:opacity-50 active:scale-[0.98]"
      >
        {guardando
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</>
          : guardado
            ? <><CheckCircle2 className="h-4 w-4" /> Actualizar calificación</>
            : <><Send className="h-4 w-4" /> Enviar calificación</>
        }
      </button>
    </div>
  );
}

/* ── Main player ─────────────────────────────────────────────── */
export function LeccionPlayer({
  leccionId,
  cursoId,
  muxAssetId,
  completado,
  reseñaInicial,
}: {
  leccionId: string;
  cursoId: string;
  muxAssetId: string | null;
  completado: boolean;
  reseñaInicial: { estrellas: number; comentario: string | null } | null;
}) {
  const [completadaLocal, setCompletadaLocal] = useState(completado);
  const [mostrarRating, setMostrarRating] = useState(completado);
  const [guardando, setGuardando] = useState(false);
  const ultimoSegundoEnviado = useRef(-1);

  async function marcarCompletada() {
    setGuardando(true);
    const resultado = await marcarProgresoAction(leccionId, { completado: true });
    setGuardando(false);
    if (!resultado.error) {
      setCompletadaLocal(true);
      setMostrarRating(true);
    }
  }

  if (muxAssetId) {
    return (
      <div className="flex flex-col gap-0">
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
              setMostrarRating(true);
            }}
          />
        </div>
        {mostrarRating && (
          <RatingWidget leccionId={leccionId} cursoId={cursoId} reseñaInicial={reseñaInicial} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
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
      {mostrarRating && (
        <RatingWidget leccionId={leccionId} cursoId={cursoId} reseñaInicial={reseñaInicial} />
      )}
    </div>
  );
}
