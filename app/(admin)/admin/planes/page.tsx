import { createClient } from "@/lib/supabase/server";
import { PlanesClient } from "./PlanesClient";

export const metadata = { title: "Planes de membresía | Admin" };

export default async function PlanesPage() {
  const supabase = await createClient();
  const { data: planes } = await supabase
    .from("planes_membresia")
    .select("*")
    .order("orden")
    .order("creado_en");

  return <PlanesClient planes={planes ?? []} />;
}
