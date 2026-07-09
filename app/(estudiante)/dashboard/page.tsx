import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

const PASOS_USO = [
  "Usa el menú lateral para navegar entre módulos.",
  "Revisa el calendario de clases y eventos.",
  "Descarga los recursos disponibles.",
  "Contacta a soporte si tienes dudas.",
];

const ACCESOS_RAPIDOS = [
  { label: "Grupos de WhatsApp", href: "/herramientas" },
  { label: "Calendario de Clases", href: "/calendario" },
  { label: "Recursos de Ventas", href: "/marketing" },
  { label: "Soporte", href: "/soporte" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Bienvenido a Team 100% Real Estate
        </h1>
        <p className="mt-2 text-lg text-mist-400">by Wilmar Sosa y Samuel Oropeza</p>
      </div>

      <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-6">
        <div className="flex items-center justify-between px-1 pb-3">
          <p className="font-mono text-xs uppercase tracking-wider text-mist-500">
            Video de bienvenida
          </p>
          <span className="text-xs font-medium text-mist-400">4 min</span>
        </div>
        <div className="aspect-video overflow-hidden rounded-xl border border-white/[0.08]">
          <iframe
            src="https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1"
            title="Video de bienvenida — Team 100% Real Estate"
            allow="fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>

      <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-mist-500">
          Conéctate con el equipo
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold text-white">
          Únete a la comunidad de Team 100% Real Estate
        </h2>
        <p className="mt-2 text-mist-400">
          Súmate a los grupos y comunidades de WhatsApp para conectar con otros
          agentes, resolver dudas y enterarte de las próximas clases en vivo.
        </p>
        <Link
          href="/herramientas"
          className="mt-5 inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 font-semibold text-white transition hover:bg-whatsapp-dark"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Únete a los Grupos y Comunidades de WhatsApp
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h3 className="font-display font-semibold text-white">Cómo Usar la Plataforma</h3>
          <ol className="mt-4 flex flex-col gap-4">
            {PASOS_USO.map((paso, indice) => (
              <li key={paso} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/10 font-mono text-xs text-gold-300">
                  {indice + 1}
                </span>
                <span className="text-sm text-mist-300">{paso}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h3 className="font-display font-semibold text-white">Accesos Rápidos</h3>
          <ul className="mt-4 flex flex-col gap-1">
            {ACCESOS_RAPIDOS.map((acceso) => (
              <li key={acceso.href}>
                <Link
                  href={acceso.href}
                  className="flex items-center justify-between rounded-lg px-2 py-3 text-sm text-mist-300 transition hover:text-gold-300"
                >
                  {acceso.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
