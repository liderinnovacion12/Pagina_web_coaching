"use client";

import { useState, useTransition } from "react";
import { Users, Search, Shield, GraduationCap, UserCog } from "lucide-react";
import type { UsuarioAdmin } from "@/lib/db/admin";
import { cambiarRolAction } from "./actions";

const ROL_CONFIG = {
  admin:      { label: "Admin",      color: "text-gold-400",   bg: "bg-gold-500/10",   border: "border-gold-500/25",   icon: Shield },
  coach:      { label: "Coach",      color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/25", icon: UserCog },
  estudiante: { label: "Estudiante", color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/25",   icon: GraduationCap },
};

function RolSelector({ usuario, sesionId }: { usuario: UsuarioAdmin; sesionId?: string }) {
  const [pending, startTransition] = useTransition();
  const esMismo = usuario.id === sesionId;
  const cfg = ROL_CONFIG[usuario.rol as keyof typeof ROL_CONFIG] ?? ROL_CONFIG.estudiante;
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.border} ${cfg.bg} px-2.5 py-1 font-mono text-[11px] ${cfg.color}`}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </span>
      {!esMismo && (
        <select
          value={usuario.rol}
          disabled={pending}
          onChange={(e) => {
            startTransition(() => cambiarRolAction(usuario.id, e.target.value));
          }}
          className="rounded-lg border border-white/10 bg-ink-800 px-2 py-1 font-mono text-xs text-mist-300 focus:outline-none focus:border-gold-500/40 disabled:opacity-40"
        >
          <option value="estudiante">Estudiante</option>
          <option value="coach">Coach</option>
          <option value="admin">Admin</option>
        </select>
      )}
    </div>
  );
}

export function UsuariosClient({
  usuarios,
  sesionId,
}: {
  usuarios: UsuarioAdmin[];
  sesionId: string;
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = usuarios.filter((u) =>
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totales = {
    admin: usuarios.filter((u) => u.rol === "admin").length,
    coach: usuarios.filter((u) => u.rol === "coach").length,
    estudiante: usuarios.filter((u) => u.rol === "estudiante").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Usuarios</h1>
        <p className="mt-1 font-mono text-xs text-mist-400">
          {usuarios.length} registrados · {totales.admin} admins · {totales.coach} coaches · {totales.estudiante} estudiantes
        </p>
      </div>

      {/* Chips resumen */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(totales).map(([rol, count]) => {
          const cfg = ROL_CONFIG[rol as keyof typeof ROL_CONFIG];
          const Icon = cfg.icon;
          return (
            <div key={rol} className={`flex items-center gap-2 rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-2`}>
              <Icon className={`h-4 w-4 ${cfg.color}`} />
              <span className={`font-display text-lg font-bold ${cfg.color}`}>{count}</span>
              <span className="font-mono text-xs text-mist-400">{cfg.label}s</span>
            </div>
          );
        })}
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist-500" />
        <input
          type="search"
          placeholder="Buscar por email…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-xl border border-white/10 bg-ink-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-mist-500 focus:border-gold-500/40 focus:outline-none focus:ring-1 focus:ring-gold-500/20"
        />
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-white/8 bg-ink-900/60 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/8 px-5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Email</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Rol</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Registro</span>
        </div>

        <div className="divide-y divide-white/5">
          {filtrados.map((u) => (
            <div key={u.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-700 border border-white/10 font-display text-xs font-bold text-white">
                  {u.email[0].toUpperCase()}
                </div>
                <span className="font-mono text-sm text-white truncate">{u.email}</span>
                {u.id === sesionId && (
                  <span className="shrink-0 font-mono text-[10px] text-gold-500 border border-gold-500/20 bg-gold-500/10 rounded-full px-2 py-0.5">tú</span>
                )}
              </div>

              <RolSelector usuario={u} sesionId={sesionId} />

              <span className="font-mono text-xs text-mist-500 whitespace-nowrap">
                {new Date(u.registrado_en).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
          ))}

          {filtrados.length === 0 && (
            <div className="px-5 py-10 text-center">
              <Users className="mx-auto h-8 w-8 text-mist-600 mb-2" />
              <p className="text-sm text-mist-400">No se encontraron usuarios.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
