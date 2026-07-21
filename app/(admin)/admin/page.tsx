import { getEstadisticasAdmin, getCursosAdmin } from "@/lib/db/admin";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const [stats, cursos] = await Promise.all([
    getEstadisticasAdmin(),
    getCursosAdmin(),
  ]);

  return <AdminDashboardClient stats={stats} cursos={cursos} />;
}
