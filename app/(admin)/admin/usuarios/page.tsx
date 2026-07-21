import { getUsuariosAdmin } from "@/lib/db/admin";
import { requireRol } from "@/lib/auth/session";
import { UsuariosClient } from "./UsuariosClient";

export default async function AdminUsuariosPage() {
  const [sesion, usuarios] = await Promise.all([
    requireRol("admin"),
    getUsuariosAdmin(),
  ]);

  return <UsuariosClient usuarios={usuarios} sesionId={sesion.id} />;
}
