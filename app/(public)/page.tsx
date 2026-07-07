import Link from "next/link";
import { getCursosPublicados } from "@/lib/db/cursos";
import { CatalogoList } from "./CatalogoList";
import { HeroBackground } from "./HeroBackground";

const ESTADISTICAS = [
  { valor: "2,000+", etiqueta: "Líderes" },
  { valor: "40+", etiqueta: "Países" },
  { valor: "95%", etiqueta: "Satisfacción" },
];

export default async function LandingPage() {
  const cursos = await getCursosPublicados();

  return (
    <main className="bg-ink-950">
      <div className="relative overflow-hidden bg-grain">
        <HeroBackground />

        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <span className="font-display text-lg font-bold tracking-tight text-white">
            COACH<span className="text-gold-400">PRO</span>
            <span className="text-gold-400"> •</span>
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-mist-300">
              <span className="text-white">ES</span>
              <span className="text-mist-500">|</span>
              <span>EN</span>
            </div>
            <Link
              href="/login"
              className="rounded-full border border-gold-500/60 px-4 py-1.5 text-sm font-medium text-gold-300 transition hover:bg-gold-500/10"
            >
              Ingresar
            </Link>
          </div>
        </header>

        <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-gold-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            Coaching Executive Platform
          </span>

          <h1 className="animate-fade-up mt-8 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white [animation-delay:120ms] sm:text-7xl">
            Transforma tu
            <br />
            <span className="text-gradient-gold">Liderazgo</span>
          </h1>

          <p className="animate-fade-up mt-6 max-w-xl text-balance text-lg text-mist-400 [animation-delay:220ms]">
            Plataforma de coaching ejecutivo para líderes que buscan impacto
            real. Aprende de los mejores, donde estés.
          </p>

          <div className="animate-fade-up mt-10 flex flex-col gap-4 [animation-delay:320ms] sm:flex-row">
            <Link
              href="/registro"
              className="rounded-lg bg-gold-500 px-7 py-3 font-semibold text-ink-950 transition hover:bg-gold-400"
            >
              Comenzar ahora
            </Link>
            <Link
              href="#cursos"
              className="rounded-lg border border-gold-500/50 px-7 py-3 font-semibold text-gold-300 transition hover:bg-gold-500/10"
            >
              Ver metodología
            </Link>
          </div>

          <dl className="animate-fade-up mt-16 flex gap-10 [animation-delay:420ms] sm:gap-16">
            {ESTADISTICAS.map((stat) => (
              <div key={stat.etiqueta}>
                <dt className="sr-only">{stat.etiqueta}</dt>
                <dd className="font-mono text-3xl font-semibold text-gold-400">
                  {stat.valor}
                </dd>
                <p className="mt-1 text-sm text-mist-500">{stat.etiqueta}</p>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section id="cursos" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold text-white">
          Catálogo de cursos
        </h2>
        <p className="mt-2 text-mist-400">
          Programas diseñados por coaches ejecutivos con experiencia real.
        </p>
        <div className="mt-10">
          <CatalogoList cursos={cursos} />
        </div>
      </section>
    </main>
  );
}
