import { getProyectosAliados } from "@/lib/db/proyectos-aliados";
import { ProyectosAliadosGrid } from "@/components/estudiante/proyectos-aliados/ProyectosAliadosGrid";

export default async function ProyectosAliadosPage() {
  const proyectos = await getProyectosAliados();

  return <ProyectosAliadosGrid proyectos={proyectos} />;
}
