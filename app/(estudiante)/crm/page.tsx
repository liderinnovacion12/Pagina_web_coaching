import { Check, Database, DollarSign, ExternalLink, Sparkles } from "lucide-react";

const BENEFICIOS = [
  "CRM con plantillas preconfiguradas",
  "Automatizaciones listas para usar",
  "Flujos diseñados para agentes inmobiliarios",
  "Grabaciones y entrenamientos semanales",
  "Soporte y acompañamiento",
];

const URL_RECORRIDO = "https://gohighlevel.samueloropeza.com/";
const URL_CUENTA = "https://gohighlevelscrm.com/crm";

export default function CrmPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          CRM para Agentes Inmobiliarios
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          GoHighLevel – Domina el sistema para gestionar tus leads
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 sm:p-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-300">
          <Database className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-3.5 font-display text-2xl font-bold text-white">
          Entrenamiento CRM – GoHighLevel
        </h2>
        <p className="mt-3.5 text-base leading-relaxed text-mist-300">
          Como agentes del Team Wilmar & Samuel, tenemos acceso al CRM GoHighLevel, gracias a una
          alianza estratégica diseñada para apoyar el crecimiento del equipo.
        </p>

        <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-300">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="mt-3 font-display text-base font-semibold text-white">
            Conoce la plataforma GoHighLevel
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            Antes de abrir tu cuenta, recorre la plataforma y descubre todas las funcionalidades,
            automatizaciones y herramientas que GoHighLevel ofrece para los agentes del equipo.
          </p>
          <a
            href={URL_RECORRIDO}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-transparent px-5 text-sm font-semibold text-white transition-all duration-200 hover:border-white/30 hover:bg-white/[0.05]"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Ver recorrido de la plataforma
          </a>
        </div>

        <a
          href={URL_CUENTA}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-[54px] items-center justify-center gap-2.5 rounded-xl bg-gold-500 px-8 font-semibold text-ink-950 transition-all duration-200 hover:scale-[1.02] hover:bg-gold-400 hover:shadow-[0_0_24px_rgba(217,169,78,0.25)] active:scale-[0.98]"
        >
          Abrir mi cuenta de CRM
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-300">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-3.5 font-display text-lg font-bold text-white">Beneficios</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio} className="flex items-start gap-2.5 text-sm text-mist-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                {beneficio}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-300">
            <DollarSign className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-3.5 font-display text-lg font-bold text-white">Precio Exclusivo</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-lg text-mist-400 line-through">$97/mes</span>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-mist-400">
              Precio regular
            </span>
          </div>
          <div className="mt-4 rounded-xl border border-gold-500/20 bg-gold-500/10 p-4">
            <p className="text-sm text-mist-300">Precio Team Wilmar & Samuel:</p>
            <p className="mt-1 text-2xl font-bold text-gold-300">
              $77<span className="text-base font-normal text-mist-400">/mes</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
