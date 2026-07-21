import { requireRol } from "@/lib/auth/session";
import { CoachSidebar } from "@/components/coach/CoachSidebar";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const sesion = await requireRol(["coach", "admin"]);

  return (
    <div className="flex min-h-screen bg-ink-950">
      <CoachSidebar email={sesion.email} />
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/8 bg-ink-950/90 backdrop-blur-xl px-6">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-display text-sm font-semibold text-white">{sesion.email}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-purple-400">Coach</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 font-display text-sm font-bold text-white">
              {sesion.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
