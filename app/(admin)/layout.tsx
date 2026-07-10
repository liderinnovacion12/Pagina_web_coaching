import { requireRol } from "@/lib/auth/session";
import { BotonCronograma } from "@/components/cronograma/BotonCronograma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRol("admin");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex justify-end">
        <BotonCronograma href="/admin/cronograma" />
      </div>
      {children}
    </div>
  );
}
