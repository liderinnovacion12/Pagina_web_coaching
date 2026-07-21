import { requireRol } from "@/lib/auth/session";
import { getEstadisticasCoach, getCursosDelCoach } from "@/lib/db/coach";
import { CoachDashboardClient } from "./CoachDashboardClient";

export default async function CoachDashboard() {
  const sesion = await requireRol(["coach", "admin"]);
  const [stats, cursos] = await Promise.all([
    getEstadisticasCoach(sesion.id),
    getCursosDelCoach(sesion.id),
  ]);

  return (
    <CoachDashboardClient
      stats={stats}
      cursos={cursos}
      nombre={sesion.email.split("@")[0]}
    />
  );
}
