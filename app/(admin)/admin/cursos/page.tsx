import { getCursosAdmin } from "@/lib/db/admin";
import { CursosClient } from "./CursosClient";

export default async function AdminCursosPage() {
  const cursos = await getCursosAdmin();
  return <CursosClient cursos={cursos} />;
}
