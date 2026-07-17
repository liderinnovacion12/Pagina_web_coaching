import { getTodosLosContactosSoporte } from "@/lib/db/contactos-soporte";
import { ContactoSoporteForm } from "@/components/admin/soporte/ContactoSoporteForm";
import { ContactoSoporteListItem } from "@/components/admin/soporte/ContactoSoporteListItem";
import { crearContactoSoporteAction } from "./actions";

export default async function AdminSoportePage() {
  const contactos = await getTodosLosContactosSoporte();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-white">Contactos de soporte</h1>

      <section className="flex flex-col gap-3">
        {contactos.map((contacto) => (
          <ContactoSoporteListItem key={contacto.id} contacto={contacto} />
        ))}
        {contactos.length === 0 && (
          <p className="text-sm text-mist-400">Sin contactos registrados.</p>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Nuevo contacto</h2>
        <ContactoSoporteForm action={crearContactoSoporteAction} />
      </section>
    </div>
  );
}
