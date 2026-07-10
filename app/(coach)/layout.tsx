import { requireRol } from "@/lib/auth/session";
import { BotonCronograma } from "@/components/cronograma/BotonCronograma";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRol(["coach", "admin"]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex justify-end">
        <BotonCronograma href="/coach/cronograma" />
      </div>
      {children}
    </div>
  );
}
