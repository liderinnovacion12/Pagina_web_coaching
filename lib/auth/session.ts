import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Rol = "admin" | "estudiante" | "coach";

export type SesionUsuario = {
  id: string;
  email: string;
  rol: Rol;
};

export async function getSesionUsuario(): Promise<SesionUsuario | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!perfil) return null;

  return { id: user.id, email: user.email ?? "", rol: perfil.rol as Rol };
}

export async function requireRol(
  rolesPermitidos: Rol | Rol[]
): Promise<SesionUsuario> {
  const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
  const sesion = await getSesionUsuario();

  if (!sesion) {
    redirect("/login");
    return sesion as never;
  }

  if (!roles.includes(sesion.rol)) {
    redirect(
      sesion.rol === "admin"
        ? "/admin"
        : sesion.rol === "coach"
          ? "/coach"
          : "/dashboard"
    );
    return sesion as never;
  }

  return sesion;
}
