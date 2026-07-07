import { requireRol } from "@/lib/auth/session";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRol(["coach", "admin"]);

  return <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>;
}
