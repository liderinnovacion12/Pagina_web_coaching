import { getContactosSoporte } from "@/lib/db/contactos-soporte";
import { SoporteContent } from "@/components/estudiante/soporte/SoporteContent";

export default async function SoportePage() {
  const contactos = await getContactosSoporte();

  return <SoporteContent contactos={contactos} />;
}
