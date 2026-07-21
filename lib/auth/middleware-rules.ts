export type Rol = "admin" | "estudiante" | "coach";

const PREFIJOS_ESTUDIANTE = ["/dashboard", "/sistema-100", "/clases", "/cursos", "/pago"];
const PREFIJO_ADMIN = "/admin";
const PREFIJO_COACH = "/coach";

function destinoPorRol(rol: Rol): string {
  if (rol === "admin") return "/admin";
  if (rol === "coach") return "/coach";
  return "/dashboard";
}

export function calcularRedireccion(
  pathname: string,
  rol: Rol | null
): string | null {
  const esRutaEstudiante = PREFIJOS_ESTUDIANTE.some((prefijo) =>
    pathname.startsWith(prefijo)
  );
  const esRutaAdmin = pathname.startsWith(PREFIJO_ADMIN);
  const esRutaCoach = pathname.startsWith(PREFIJO_COACH);

  if (!esRutaEstudiante && !esRutaAdmin && !esRutaCoach) return null;
  if (rol === null) return "/login";
  if (esRutaAdmin && rol !== "admin") return destinoPorRol(rol);
  if (esRutaCoach && rol !== "admin" && rol !== "coach") return destinoPorRol(rol);

  return null;
}
