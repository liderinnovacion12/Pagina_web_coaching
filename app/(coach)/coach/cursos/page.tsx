import { requireRol } from "@/lib/auth/session";
import { getCursosDelCoach } from "@/lib/db/coach";
import { CursosCoachClient } from "./CursosCoachClient";

export default async function CoachCursosPage() {
  const sesion = await requireRol(["coach", "admin"]);
  const cursos = await getCursosDelCoach(sesion.id);
  return <CursosCoachClient cursos={cursos} coachId={sesion.id} />;
}
