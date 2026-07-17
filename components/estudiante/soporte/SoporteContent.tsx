import type { ContactoSoporte } from "@/lib/db/contactos-soporte.types";
import { ContactoSoporteCard } from "./ContactoSoporteCard";

const URL_MY_ASSISTANT = "https://chatgpt.com/g/g-688ad2df1708819186005deae59fc948-myassistant";

export function SoporteContent({ contactos }: { contactos: ContactoSoporte[] }) {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Soporte, Ayuda y Contactos
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          Estamos aquí para ayudarte - Encuentra toda la información de contacto del equipo
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 sm:p-10">
        <h2 className="font-display text-2xl font-bold text-white">My Assistant</h2>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-gold-300">
          Asistente de IA de My Realty
        </p>
        <p className="mt-3.5 max-w-2xl text-base leading-relaxed text-mist-300">
          Asistente virtual 24/7 para formatos, procesos, dudas e información operativa.
        </p>
        <a
          href={URL_MY_ASSISTANT}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-[54px] items-center justify-center rounded-xl bg-gold-500 px-8 font-semibold text-ink-950 transition-all duration-200 hover:scale-[1.02] hover:bg-gold-400 hover:shadow-[0_0_24px_rgba(217,169,78,0.25)] active:scale-[0.98]"
        >
          Empieza a usar My Assistant hoy
        </a>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-white">Contactos del Equipo</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contactos.map((contacto) => (
            <ContactoSoporteCard key={contacto.id} contacto={contacto} />
          ))}
        </div>
      </div>
    </div>
  );
}
