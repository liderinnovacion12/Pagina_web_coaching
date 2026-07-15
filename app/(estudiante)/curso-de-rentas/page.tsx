import Image from "next/image";

const CHECKLIST = [
  {
    titulo: "Módulos en video:",
    detalle: "Clases paso a paso disponibles 24/7.",
  },
  {
    titulo: "Guiones y plantillas:",
    detalle: "Scripts de llamadas, emails y tableros de gestión.",
  },
  {
    titulo: "Sesiones de reuniones en vivo grupales.",
    detalle: "También encuentras las grabaciones en caso de no poder asistir.",
  },
  {
    titulo: "Comunidad privada de WhatsApp:",
    detalle: "Soporte y networking con otros agentes.",
  },
  {
    titulo: "Bonus",
    detalle: "de charlas con Expertos.",
  },
  {
    titulo: "Plan de 30 días:",
    detalle: 'Guía clara para activar tu "salario inmobiliario".',
  },
];

const URL_INSCRIPCION = "https://www.aprendeconwilmar.com/maestriaenrentas/pdp";

export default function CursoDeRentasPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Maestría en Rentas
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          Domina el arte de las rentas inmobiliarias con nuestro programa completo.
        </p>
      </div>

      <div className="rounded-2xl border border-gold-500/20 bg-gold-500/10 p-6">
        <p className="text-sm text-mist-300">
          Beneficio exclusivo para los agentes que hacen parte de este Team 100% Real Estate:
        </p>
        <p className="mt-2 text-xl font-semibold text-gold-300">
          Disfruta de un 50% de descuento en tu inscripción.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-mist-300">
          Dirígete al enlace, realiza tu inscripción y no olvides ingresar el código{" "}
          <code className="rounded border border-white/10 bg-ink-950 px-2 py-0.5 font-mono text-gold-300">
            TEAM100REAL
          </code>{" "}
          antes de pagar.
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/[0.06]">
        <Image
          src="https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/rentas/maestria-rentas-banner-CPOeJvYN.png"
          alt=""
          width={1280}
          height={720}
          className="h-auto w-full object-cover"
        />
      </div>

      <p className="text-base leading-relaxed text-mist-300">
        Aprende a generar ingresos con propiedades de renta. Con estrategias probadas para el
        mercado inmobiliario, acceso a material exclusivo y una guía paso a paso desde cero hasta
        tu primera renta.
      </p>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
        <h2 className="font-display text-lg font-bold text-white">
          ¿Qué incluye la Maestría en Rentas?
        </h2>
        <p className="mt-2 text-sm text-mist-300">
          Todo lo que necesitas para dominar las rentas y construir un ingreso constante como
          agente inmobiliario.
        </p>

        <ul className="mt-6 flex flex-col gap-4">
          {CHECKLIST.map((item) => (
            <li key={item.titulo} className="border-l-2 border-gold-500/60 pl-4">
              <p className="text-sm leading-relaxed text-mist-300">
                <span className="font-semibold text-white">{item.titulo}</span> {item.detalle}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-base font-bold text-white">
          Todo esto en una sola plataforma y podrás disfrutar el curso de por vida.
        </p>

        <a
          href={URL_INSCRIPCION}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-[54px] items-center justify-center gap-2.5 rounded-xl bg-gold-500 px-8 font-semibold text-ink-950 transition-all duration-200 hover:scale-[1.02] hover:bg-gold-400 hover:shadow-[0_0_24px_rgba(217,169,78,0.25)] active:scale-[0.98]"
        >
          Inscríbete ahora
        </a>
      </div>
    </div>
  );
}
