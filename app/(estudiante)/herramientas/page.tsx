import { getGruposComunidad } from "@/lib/db/grupos-comunidad";
import { HerramientasHub } from "@/components/estudiante/herramientas/HerramientasHub";

export default async function HerramientasPage() {
  const grupos = await getGruposComunidad();

  return <HerramientasHub grupos={grupos} />;
}
