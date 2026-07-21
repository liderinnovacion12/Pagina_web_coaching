"use client";

import Link from "next/link";
import { BookOpen, Users, Award, TrendingUp, Eye, Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CursoAdmin } from "@/lib/db/admin";

type Stats = {
  totalUsuarios: number;
  totalCursos: number;
  cursosPublicados: number;
  totalInscripciones: number;
};

export function AdminDashboardClient({
  stats,
  cursos,
}: {
  stats: Stats;
  cursos: CursoAdmin[];
}) {
  const { tr } = useLanguage();
  const d = tr.admin.dashboard;

  const STATS = [
    { label: d.stats.usuariosTotales,   valor: stats.totalUsuarios,       icon: Users,   color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
    { label: d.stats.cursosCreados,     valor: stats.totalCursos,         icon: BookOpen, color: "text-gold-400",  bg: "bg-gold-500/10",   border: "border-gold-500/20" },
    { label: d.stats.cursosPublicados,  valor: stats.cursosPublicados,    icon: Eye,     color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
    { label: d.stats.inscripciones,     valor: stats.totalInscripciones,  icon: Award,   color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">{d.titulo}</h1>
        <p className="mt-1 text-sm text-mist-400">{d.subtitulo}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-2xl border ${s.border} bg-ink-900/60 p-5`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs text-mist-400 uppercase tracking-wider">{s.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} border ${s.border}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
              <p className={`font-display text-4xl font-extrabold ${s.color}`}>{s.valor}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-ink-900/60 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <h2 className="font-display text-base font-semibold text-white">{d.cursosRecientes}</h2>
            <Link href="/admin/cursos" className="flex items-center gap-1 font-mono text-xs text-gold-400 hover:text-gold-300 transition-colors">
              {d.verTodos}
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {cursos.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/20">
                  <BookOpen className="h-4 w-4 text-gold-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-medium text-white truncate">{c.titulo}</p>
                  <p className="font-mono text-xs text-mist-500">{c.totalLecciones} {d.lecciones} · ${c.precio}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${
                  c.publicado ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-white/10 bg-white/5 text-mist-500"
                }`}>
                  {c.publicado ? d.publicado : d.borrador}
                </span>
              </div>
            ))}
            {cursos.length === 0 && (
              <p className="px-6 py-8 text-sm text-mist-400 text-center">{d.sinCursos}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-ink-900/60 overflow-hidden">
          <div className="border-b border-white/8 px-6 py-4">
            <h2 className="font-display text-base font-semibold text-white">{d.accionesRapidas}</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: d.acciones.nuevoCurso, href: "/admin/cursos",   icon: Plus,       color: "text-gold-400",   bg: "bg-gold-500/10",   border: "border-gold-500/20" },
              { label: d.acciones.verUsuarios, href: "/admin/usuarios", icon: Users,      color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
              { label: d.acciones.calendario,  href: "/admin/calendario", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.href} href={a.href}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-ink-800/40 px-4 py-3 transition-all hover:border-white/15 hover:bg-ink-800/70"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${a.bg} border ${a.border}`}>
                    <Icon className={`h-4 w-4 ${a.color}`} />
                  </div>
                  <span className="text-sm font-medium text-white">{a.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
