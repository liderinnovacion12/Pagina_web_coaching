"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Users, CalendarDays,
  Wrench, Globe, Handshake, Building2, HeadphonesIcon,
  ChevronRight, LogOut, Home,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/logout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function AdminSidebar() {
  const pathname = usePathname();
  const { tr } = useLanguage();
  const a = tr.admin;

  const NAV = [
    { label: a.nav.dashboard, href: "/admin", icon: LayoutDashboard, exact: true },
    { label: a.nav.cursos, href: "/admin/cursos", icon: BookOpen },
    { label: a.nav.usuarios, href: "/admin/usuarios", icon: Users },
    { label: a.nav.calendario, href: "/admin/calendario", icon: CalendarDays },
    { label: a.nav.herramientas, href: "/admin/herramientas", icon: Wrench },
    { label: a.nav.eventos, href: "/admin/eventos", icon: Globe },
    { label: a.nav.aliados, href: "/admin/aliados", icon: Handshake },
    { label: a.nav.proyectos, href: "/admin/proyectos-inmobiliarios-aliados", icon: Building2 },
    { label: a.nav.soporte, href: "/admin/soporte", icon: HeadphonesIcon },
  ];

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-white/8 bg-ink-950 sticky top-0">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/8 px-5">
        <Link href="/admin" className="font-display text-sm font-bold text-white leading-tight">
          TEAM 100%
          <span className="text-gold-400"> REAL ESTATE</span>
          <span className="ml-2 rounded-full bg-gold-500/15 border border-gold-500/30 px-2 py-0.5 font-mono text-[10px] text-gold-400 align-middle">
            ADMIN
          </span>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-mist-500">
          {a.general}
        </p>
        {NAV.slice(0, 3).map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-gold-500/15 text-gold-300 border border-gold-500/20"
                  : "text-mist-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-gold-400" : "text-mist-500 group-hover:text-mist-300"}`} />
              {label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-gold-500" />}
            </Link>
          );
        })}

        <p className="px-2 pb-2 pt-5 font-mono text-[10px] uppercase tracking-widest text-mist-500">
          {a.contenido}
        </p>
        {NAV.slice(3).map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-gold-500/15 text-gold-300 border border-gold-500/20"
                  : "text-mist-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-gold-400" : "text-mist-500 group-hover:text-mist-300"}`} />
              {label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-gold-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 p-4 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-mist-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          {a.footer.portalEstudiante}
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            {a.footer.cerrarSesion}
          </button>
        </form>
      </div>
    </aside>
  );
}
