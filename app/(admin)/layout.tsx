import { requireRol } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sesion = await requireRol("admin");

  return (
    <div className="flex min-h-screen bg-ink-950">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/8 bg-ink-950/90 backdrop-blur-xl px-6">
          <div />
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="text-right">
              <p className="font-display text-sm font-semibold text-white">{sesion.email}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-gold-400">Administrador</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 font-display text-sm font-bold text-ink-950">
              {sesion.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
