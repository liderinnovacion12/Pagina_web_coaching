"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown, Lock } from "lucide-react";
import { type NavItem } from "./nav-config";
import { cerrarSesion } from "@/lib/auth/actions";
import { BotonCronograma } from "@/components/cronograma/BotonCronograma";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LogoNCS } from "@/components/ui/LogoNCS";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function idDePanel(label: string, prefijo: string): string {
  const slug = label
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  return `${prefijo}-panel-${slug}`;
}

export function EstudianteShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { tr } = useLanguage();
  const NAV_GROUPS = tr.estudiante.nav.grupos;
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(null);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function alClickAfuera(evento: MouseEvent) {
      if (navRef.current && !navRef.current.contains(evento.target as Node)) {
        setGrupoAbierto(null);
      }
    }

    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setGrupoAbierto(null);
        setMenuMovilAbierto(false);
      }
    }

    document.addEventListener("mousedown", alClickAfuera);
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.removeEventListener("mousedown", alClickAfuera);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, []);

  useEffect(() => {
    setGrupoAbierto(null);
    setMenuMovilAbierto(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-ink-950/90 backdrop-blur-md">
        <div
          ref={navRef}
          className="relative mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5"
        >
          <Link
            href="/dashboard"
            aria-label="NCS Realty Hub – Dashboard"
            className="transition duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 rounded-sm"
          >
            <LogoNCS height={48} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_GROUPS.map((grupo) => {
              const panelId = idDePanel(grupo.label, "desktop");
              return (
                <div key={grupo.label} className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setGrupoAbierto((actual) => (actual === grupo.label ? null : grupo.label))
                    }
                    aria-expanded={grupoAbierto === grupo.label}
                    aria-controls={panelId}
                    className={`flex items-center gap-1 rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 ${
                      grupo.items.some((item) => item.href === pathname)
                        ? "text-gold-300"
                        : "text-mist-400 hover:text-mist-300"
                    }`}
                  >
                    {grupo.label}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-300 ${
                        grupoAbierto === grupo.label ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {grupoAbierto === grupo.label && (
                    <motion.div
                      id={panelId}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-full z-50 mt-2 flex w-64 flex-col gap-1 rounded-xl border border-white/10 bg-ink-950 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl"
                    >
                      {grupo.items.map((item) => (
                        <NavLink
                          key={item.label}
                          item={item}
                          pathname={pathname}
                          superficie="ink-900"
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            <BotonCronograma href="/cronograma" compact />
            <span className="max-w-[160px] truncate text-sm text-mist-400">{email}</span>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-mist-300 transition duration-200 hover:border-gold-500/60 hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
              >
                {tr.estudiante.cerrarSesion}
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={() => setMenuMovilAbierto(true)}
            aria-label="Abrir menú"
            className="text-mist-300 transition duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 lg:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </header>

      {menuMovilAbierto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-grain fixed inset-0 z-30 overflow-y-auto bg-ink-950 lg:hidden"
        >
          <div className="flex items-center justify-between px-6 py-5">
            <LogoNCS height={40} />
            <button
              type="button"
              onClick={() => setMenuMovilAbierto(false)}
              aria-label="Cerrar menú"
              className="text-mist-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-1 px-6 pb-10">
            {NAV_GROUPS.map((grupo) => {
              const panelId = idDePanel(grupo.label, "movil");
              return (
                <div key={grupo.label} className="border-b border-white/[0.08] py-2">
                  <button
                    type="button"
                    onClick={() =>
                      setGrupoAbierto((actual) => (actual === grupo.label ? null : grupo.label))
                    }
                    aria-expanded={grupoAbierto === grupo.label}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between py-2 font-mono text-xs uppercase tracking-wider text-mist-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                  >
                    {grupo.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        grupoAbierto === grupo.label ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {grupoAbierto === grupo.label && (
                    <motion.div
                      id={panelId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-1 overflow-hidden pb-2"
                    >
                      {grupo.items.map((item) => (
                        <NavLink
                          key={item.label}
                          item={item}
                          pathname={pathname}
                          superficie="ink-950"
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}

            <BotonCronograma href="/cronograma" className="mt-6 w-full justify-center" />

            <form action={cerrarSesion} className="mt-3">
              <button
                type="submit"
                className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-mist-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </motion.div>
      )}

      <main className="mx-auto max-w-[1440px] px-6 py-10">{children}</main>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  superficie,
}: {
  item: NavItem;
  pathname: string;
  superficie: "ink-900" | "ink-950";
}) {
  if (!item.href) {
    return (
      <span
        aria-disabled="true"
        title="Próximamente"
        className="flex cursor-not-allowed items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-mist-500 opacity-60"
      >
        <span>{item.label}</span>
        <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] px-1 py-px font-mono text-[8px] uppercase tracking-wider text-mist-500">
          <Lock className="h-1.5 w-1.5" aria-hidden="true" />
          Próximamente
        </span>
      </span>
    );
  }

  const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const offsetRing =
    superficie === "ink-900"
      ? "focus-visible:ring-offset-ink-900"
      : "focus-visible:ring-offset-ink-950";

  return (
    <Link
      href={item.href}
      className={`block rounded-lg px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 ${offsetRing} ${
        activo ? "bg-gold-500/10 text-gold-300" : "text-mist-300 hover:bg-white/[0.03]"
      }`}
    >
      {item.label}
    </Link>
  );
}
