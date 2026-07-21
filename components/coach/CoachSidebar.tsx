"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, CalendarDays, ChevronRight, LogOut, Home } from "lucide-react";
import { logoutAction } from "@/lib/auth/logout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function CoachSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const { tr } = useLanguage();
  const c = tr.coach;

  const NAV = [
    { label: c.nav.dashboard, href: "/coach", icon: LayoutDashboard, exact: true },
    { label: c.nav.misCursos, href: "/coach/cursos", icon: BookOpen },
    { label: c.nav.estudiantes, href: "/coach/estudiantes", icon: Users },
    { label: c.nav.cronograma, href: "/coach/cronograma", icon: CalendarDays },
  ];

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-white/8 bg-ink-950 sticky top-0">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/8 px-5">
        <Link href="/coach" className="font-display text-sm font-bold text-white leading-tight">
          TEAM 100%
          <span className="text-gold-400"> REAL ESTATE</span>
          <span className="ml-2 rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 font-mono text-[10px] text-purple-400 align-middle">
            COACH
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-mist-500">{c.panel}</p>
        {NAV.map(({ label, href, icon: Icon, exact }) => {
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
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 font-display text-xs font-bold text-white shrink-0">
            {email[0].toUpperCase()}
          </div>
          <p className="font-mono text-xs text-mist-400 truncate">{email}</p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-mist-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          {c.footer.portalEstudiante}
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            {c.footer.cerrarSesion}
          </button>
        </form>
      </div>
    </aside>
  );
}
