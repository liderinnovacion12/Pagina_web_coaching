import { requireRol } from "@/lib/auth/session";
import { EstudianteShell } from "@/components/estudiante/EstudianteShell";

export default async function EstudianteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await requireRol("estudiante");

  return <EstudianteShell email={sesion.email}>{children}</EstudianteShell>;
}
