import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";

const BADGES = ["Oficial", "100% Privado"];

export function GrupoPrincipalCard({ grupo }: { grupo: GrupoComunidad | undefined }) {
  if (!grupo) {
    return null;
  }

  const tieneEnlace = Boolean(grupo.enlaceUrl);

  return (
    <div className="flex flex-col gap-6 rounded-[24px] border border-whatsapp/20 bg-gradient-to-r from-whatsapp/15 via-whatsapp/5 to-transparent p-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-whatsapp/30 bg-whatsapp/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-whatsapp"
            >
              {badge}
            </span>
          ))}
        </div>
        <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          {grupo.nombre}
        </h3>
        <p className="mt-1.5 text-sm text-mist-300">
          {grupo.detalle || "Canal maestro de comunicación general del equipo."}
        </p>
      </div>
      {tieneEnlace ? (
        <a
          href={grupo.enlaceUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-3.5 font-semibold text-ink-950 transition hover:scale-[1.02] hover:bg-whatsapp-dark active:scale-[0.98]"
        >
          Unirse al grupo ↗
        </a>
      ) : (
        <span
          aria-disabled="true"
          title="Este grupo todavía no tiene enlace cargado"
          className="shrink-0 text-sm font-medium text-mist-500 opacity-50 cursor-not-allowed"
        >
          Enlace pendiente
        </span>
      )}
    </div>
  );
}
