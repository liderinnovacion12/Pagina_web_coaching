import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  MessageCircle,
  Target,
  Users,
} from "lucide-react";
import { getMiembrosEquipo } from "@/lib/db/equipo";

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

const VALORES = [
  {
    nombre: "Integridad",
    descripcion: "Actuamos con honestidad y transparencia en cada transacción.",
  },
  {
    nombre: "Compromiso",
    descripcion: "Cumplimos nuestras promesas con clientes y compañeros.",
  },
  {
    nombre: "Colaboración",
    descripcion: "El éxito de uno es el éxito de todos.",
  },
  {
    nombre: "Excelencia",
    descripcion: "Buscamos la mejora continua en todo lo que hacemos.",
  },
];

const GALERIA_EQUIPO = Array.from(
  { length: 8 },
  (_, indice) => `/images/cultura/galeria/galeria-${String(indice + 1).padStart(2, "0")}.jpg`
);

export default async function DashboardPage() {
  const miembrosEquipo = await getMiembrosEquipo();

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

      <div>
        <h2 className="font-display text-3xl font-bold text-white">Cultura y Equipo</h2>
        <p className="mt-2 text-lg text-mist-400">
          Conoce a los líderes y los principios que nos guían.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gold-300" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-white">Team Leaders</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {miembrosEquipo.map((miembro) => (
            <div
              key={miembro.id}
              className="relative h-[420px] overflow-hidden rounded-[20px] border border-white/[0.08]"
            >
              {miembro.fotoUrl ? (
                <Image
                  src={miembro.fotoUrl}
                  alt={miembro.nombre}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-ink-800" aria-hidden="true" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-mono text-xs uppercase tracking-wider text-gold-300">
                  {miembro.cargo}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-white">
                  {miembro.nombre}
                </h3>
                <p className="mt-2 text-sm text-mist-300">{miembro.descripcionCargo}</p>
                <a
                  href={`tel:${miembro.telefono}`}
                  className="mt-3 inline-block text-sm font-semibold text-gold-300 transition hover:text-gold-200 hover:underline"
                >
                  {miembro.telefono}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <Target className="h-5 w-5 text-gold-300" aria-hidden="true" />
          <h3 className="mt-3 font-display font-semibold text-white">Nuestra Misión</h3>
          <p className="mt-2 text-sm text-mist-300">
            Empoderar a cada agente para que alcance su máximo potencial, brindándole las
            herramientas, el acompañamiento y el entorno correcto para crecer de manera
            profesional y personal.
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <Eye className="h-5 w-5 text-gold-300" aria-hidden="true" />
          <h3 className="mt-3 font-display font-semibold text-white">Nuestra Visión</h3>
          <p className="mt-2 text-sm text-mist-300">
            Construir un equipo sólido, colaborativo y en constante crecimiento, donde cada
            agente opere su negocio con claridad, estructura y mentalidad de liderazgo.
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-gold-300" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-white">Nuestros Valores</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {VALORES.map((valor) => (
            <div
              key={valor.nombre}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/10">
                <Check className="h-4 w-4 text-gold-300" aria-hidden="true" />
              </div>
              <h3 className="mt-3 font-display font-semibold text-white">{valor.nombre}</h3>
              <p className="mt-1 text-sm text-mist-300">{valor.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-8">
        <Lightbulb className="h-5 w-5 text-gold-300" aria-hidden="true" />
        <h2 className="mt-3 font-display text-2xl font-semibold text-white">
          Filosofía de Equipo
        </h2>
        <p className="mt-3 text-mist-300">
          Creemos firmemente en el trabajo en equipo, la transformación continua y la dedicación
          diaria. Somos una comunidad colaborativa donde nos apoyamos unos a otros, compartimos
          conocimiento y buscamos crecer juntos.
        </p>
        <p className="mt-4 font-semibold text-white">
          Aquí no estamos solo para recibir información. Estamos para dar, aportar y sumar valor
          al equipo.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-gold-300" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-white">Galería del Equipo</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {GALERIA_EQUIPO.map((src) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-xl border border-white/[0.08]"
            >
              <Image
                src={src}
                alt="Foto del equipo Team 100% Real Estate"
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
