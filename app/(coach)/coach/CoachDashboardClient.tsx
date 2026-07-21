"use client";

import Link from "next/link";
import { BookOpen, Users, Play, Eye, TrendingUp, Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Curso = {
  id: string;
  titulo: string;
  publicado: boolean;
  totalLecciones: number;
  totalEstudiantes: number;
  precio: number;
};

type Stats = {
  totalCursos: number;
  cursosPublicados: number;
  totalLecciones: number;
  totalEstudiantes: number;
};

export function CoachDashboardClient({
  stats,
  cursos,
  nombre,
}: {
  stats: Stats;
  cursos: Curso[];
  nombre: string;
}) {
  const { tr } = useLanguage();
  const d = tr.coach.dashboard;

  const STATS = [
    { label: d.stats.misCursos,       valor: stats.totalCursos,       icon: BookOpen, color: "text-gold-400",   bg: "bg-gold-500/10",   border: "border-gold-500/20" },
    { label: d.stats.publicados,      valor: stats.cursosPublicados,  icon: Eye,      color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
    { label: d.stats.totalLecciones,  valor: stats.totalLecciones,    icon: Play,     color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
    { label: d.stats.estudiantes,     valor: stats.totalEstudiantes,  icon: Users,    color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="rounded-2xl border border-gold-500/20 bg-gradient-to-br from-ink-900 to-ink-800 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-gold-400 mb-1">{d.bienvenido}</p>
            <h1 className="font-display text-3xl font-bold text-white capitalize">{nombre} 👋</h1>
            <p className="mt-1 text-sm text-mist-400">{d.subtitulo}</p>
          </div>
          <Link
            href="/coach/cursos"
            className="flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 font-semibold text-ink-950 text-sm hover:bg-gold-400 transition-colors"
          >
            <Plus className="h-4 w-4" /> {d.nuevoCurso}
          </Link>
        </div>
      </div>

      {/* Stats */}
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

      {/* Cursos recientes */}
      <div className="rounded-2xl border border-white/8 bg-ink-900/60 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 className="font-display text-base font-semibold text-white">{d.cursosRecientes}</h2>
          <Link href="/coach/cursos" className="font-mono text-xs text-gold-400 hover:text-gold-300 transition-colors">
            {d.verTodos}
          </Link>
        </div>

        {cursos.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-mist-600 mb-3" />
            <p className="text-sm text-mist-400">{d.sinCursos}</p>
            <Link href="/coach/cursos" className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-gold-400 hover:text-gold-300">
              <Plus className="h-3 w-3" /> {d.crearPrimero}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {cursos.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/20">
                  <BookOpen className="h-5 w-5 text-gold-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-white truncate">{c.titulo}</p>
                  <p className="font-mono text-xs text-mist-500">
                    {c.totalLecciones} {d.lecciones} · {c.totalEstudiantes} {d.stats.estudiantes.toLowerCase()} · ${c.precio}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase ${
                    c.publicado ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-white/10 bg-white/5 text-mist-500"
                  }`}>
                    {c.publicado ? d.publicado : d.borrador}
                  </span>
                  <Link href={`/coach/cursos/${c.id}/lecciones`}
                    className="font-mono text-[11px] text-gold-400 hover:text-gold-300 border border-gold-500/20 rounded-lg px-2.5 py-1 hover:border-gold-500/40 transition-all"
                  >
                    {d.leccionesLink}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: d.accesos.gestionar,      href: "/coach/cursos",      icon: BookOpen,   color: "text-gold-400",   bg: "bg-gold-500/10",   border: "border-gold-500/20" },
          { label: d.accesos.verEstudiantes, href: "/coach/estudiantes", icon: Users,      color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          { label: d.accesos.cronograma,     href: "/coach/cronograma",  icon: TrendingUp, color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-ink-900/60 px-5 py-4 transition-all hover:border-white/15 hover:bg-ink-800/60"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} border ${a.border}`}>
                <Icon className={`h-5 w-5 ${a.color}`} />
              </div>
              <span className="font-display text-sm font-semibold text-white">{a.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
