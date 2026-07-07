import { requireRol } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRol("admin");

  return <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>;
}
