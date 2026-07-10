import { getClasesCalendario } from "@/lib/db/calendario";
import { CalendarioSemanal } from "@/components/estudiante/calendario/CalendarioSemanal";

export default async function CalendarioPage() {
  const clases = await getClasesCalendario();

  return <CalendarioSemanal clases={clases} />;
}
