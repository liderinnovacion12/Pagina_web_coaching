import { getAliados } from "@/lib/db/aliados";
import { AliadosGrid } from "@/components/estudiante/aliados/AliadosGrid";

export default async function AliadosPage() {
  const aliados = await getAliados();

  return <AliadosGrid aliados={aliados} />;
}
