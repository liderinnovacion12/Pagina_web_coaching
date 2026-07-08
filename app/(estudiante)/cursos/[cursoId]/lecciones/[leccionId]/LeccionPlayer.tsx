"use client";

import { useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { Loader2 } from "lucide-react";
import { marcarProgresoAction } from "./actions";

export function LeccionPlayer({
  leccionId,
  muxAssetId,
  completado,
}: {
  leccionId: string;
  muxAssetId: string | null;
  completado: boolean;
}) {
  const [completadaLocal, setCompletadaLocal] = useState(completado);
  const [guardando, setGuardando] = useState(false);
  const ultimoSegundoEnviado = useRef(-1);

  async function marcarCompletada() {
    setGuardando(true);
    const resultado = await marcarProgresoAction(leccionId, { completado: true });
    setGuardando(false);

    if (!resultado.error) {
      setCompletadaLocal(true);
    }
  }

  if (muxAssetId) {
    return (
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
    );
  }

  return (
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
  );
}
