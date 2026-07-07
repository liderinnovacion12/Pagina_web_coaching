export type Rol = "admin" | "estudiante";

const PREFIJO_ESTUDIANTE = "/dashboard";
const PREFIJO_ADMIN = "/admin";

export function calcularRedireccion(
  pathname: string,
  rol: Rol | null
): string | null {
  const esRutaEstudiante = pathname.startsWith(PREFIJO_ESTUDIANTE);
  const esRutaAdmin = pathname.startsWith(PREFIJO_ADMIN);

  if (!esRutaEstudiante && !esRutaAdmin) return null;

  if (rol === null) return "/login";

  if (esRutaAdmin && rol !== "admin") return "/dashboard";

  return null;
}
