"use client";

import { motion } from "framer-motion";
import { Check, X, BookOpen, Infinity, Award, Video, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const PLANES = {
  es: [
    {
      id: "curso",
      nombre: "Por Curso",
      badge: null,
      frecuencia: "pago único",
      precio: null,
      precioTexto: "Precio del curso",
      desc: "Accede a un curso específico pagando solo su valor. Sin suscripciones, sin compromisos.",
      destacado: false,
      cta: "Ver catálogo de cursos",
      ctaHref: "/registro?plan=curso",
      features: [
        { texto: "Acceso de por vida al curso comprado", activo: true },
        { texto: "Videos y material del curso", activo: true },
        { texto: "Certificado digital del curso", activo: true },
        { texto: "Acceso a todos los cursos", activo: false },
        { texto: "Certificados ilimitados", activo: false },
        { texto: "Nuevos cursos sin costo adicional", activo: false },
        { texto: "Soporte prioritario", activo: false },
      ],
    },
    {
      id: "mensual",
      nombre: "Plan Ilimitado",
      badge: "MÁS POPULAR",
      frecuencia: "mes",
      precio: "$100",
      precioTexto: null,
      desc: "Accede a todos los cursos, certificados y contenido nuevo sin restricciones. La mejor inversión para tu carrera.",
      destacado: true,
      cta: "Comenzar ahora",
      ctaHref: "/registro?plan=membresia",
      features: [
        { texto: "Acceso a todos los cursos", activo: true },
        { texto: "Videos y material de todos los cursos", activo: true },
        { texto: "Certificados digitales ilimitados", activo: true },
        { texto: "Nuevos cursos sin costo adicional", activo: true },
        { texto: "Comunidad exclusiva de agentes", activo: true },
        { texto: "Soporte prioritario", activo: true },
        { texto: "Cancela cuando quieras", activo: true },
      ],
    },
  ],
  en: [
    {
      id: "curso",
      nombre: "Per Course",
      badge: null,
      frecuencia: "one-time",
      precio: null,
      precioTexto: "Course price",
      desc: "Access a specific course by paying only its price. No subscriptions, no commitments.",
      destacado: false,
      cta: "Browse courses",
      ctaHref: "/registro",
      features: [
        { texto: "Lifetime access to purchased course", activo: true },
        { texto: "Course videos and materials", activo: true },
        { texto: "Digital certificate for the course", activo: true },
        { texto: "Access to all courses", activo: false },
        { texto: "Unlimited certificates", activo: false },
        { texto: "New courses at no extra cost", activo: false },
        { texto: "Priority support", activo: false },
      ],
    },
    {
      id: "mensual",
      nombre: "Unlimited Plan",
      badge: "MOST POPULAR",
      frecuencia: "month",
      precio: "$100",
      precioTexto: null,
      desc: "Access all courses, certificates, and new content without restrictions. The best investment for your career.",
      destacado: true,
      cta: "Get started",
      ctaHref: "/registro",
      features: [
        { texto: "Access to all courses", activo: true },
        { texto: "Videos and materials for all courses", activo: true },
        { texto: "Unlimited digital certificates", activo: true },
        { texto: "New courses at no extra cost", activo: true },
        { texto: "Exclusive agent community", activo: true },
        { texto: "Priority support", activo: true },
        { texto: "Cancel anytime", activo: true },
      ],
    },
  ],
};

const ICONOS = [BookOpen, Video, Award, Infinity, Users, Zap, Check];

export function SeccionPrecios() {
  const { locale } = useLanguage();
  const planes = PLANES[locale];

  return (
    <section id="precios" className="relative isolate mx-auto max-w-5xl px-6 py-24">
      {/* Glow de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(0,201,87,0.08),transparent_65%)]"
      />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-14 text-center"
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-400">
          {locale === "es" ? "Planes y precios" : "Plans & pricing"}
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {locale === "es" ? (
            <>Invierte en tu <span className="text-gold-400">carrera</span></>
          ) : (
            <>Invest in your <span className="text-gold-400">career</span></>
          )}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-mist-400">
          {locale === "es"
            ? "Elige cómo quieres aprender. Sin contratos, sin letra pequeña."
            : "Choose how you want to learn. No contracts, no fine print."}
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 sm:items-stretch">
        {planes.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE, delay: i * 0.1 }}
            className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-300 ${
              plan.destacado
                ? "border-gold-500/50 bg-gradient-to-b from-gold-500/[0.07] to-ink-900/80 shadow-[0_0_60px_rgba(0,201,87,0.08)]"
                : "border-white/10 bg-ink-900/60 hover:border-white/20"
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gold-500 px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-950">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <h3 className={`font-display text-xl font-bold ${plan.destacado ? "text-gold-300" : "text-white"}`}>
                {plan.nombre}
              </h3>

              <div className="mt-4 flex items-end gap-1">
                {plan.precio ? (
                  <>
                    <span className={`font-display text-5xl font-extrabold leading-none ${plan.destacado ? "text-gold-400" : "text-white"}`}>
                      {plan.precio}
                    </span>
                    <span className="mb-1 font-mono text-sm text-mist-400">/{plan.frecuencia}</span>
                  </>
                ) : (
                  <span className="font-display text-2xl font-bold text-mist-300">{plan.precioTexto}</span>
                )}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-mist-400">{plan.desc}</p>
            </div>

            {/* Divider */}
            <div className="mb-6 h-px bg-white/8" />

            {/* Features */}
            <ul className="mb-8 flex flex-1 flex-col gap-3">
              {plan.features.map((f, fi) => {
                const Icon = f.activo ? Check : X;
                return (
                  <li key={fi} className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      f.activo
                        ? plan.destacado
                          ? "bg-gold-500/15 text-gold-400"
                          : "bg-green-500/10 text-green-400"
                        : "bg-white/5 text-mist-600"
                    }`}>
                      <Icon className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span className={`text-sm leading-snug ${f.activo ? "text-mist-200" : "text-mist-600 line-through decoration-mist-700"}`}>
                      {f.texto}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* CTA */}
            <Link
              href={plan.ctaHref}
              className={`flex h-12 items-center justify-center rounded-xl font-semibold text-sm transition-all duration-200 ${
                plan.destacado
                  ? "bg-gold-500 text-ink-950 hover:bg-gold-400 hover:shadow-[0_0_24px_rgba(0,201,87,0.35)] active:scale-[0.98]"
                  : "border border-white/15 text-white hover:border-gold-500/40 hover:bg-gold-500/8"
              }`}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Fine print */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 text-center font-mono text-xs text-mist-600"
      >
        {locale === "es"
          ? "Precios en USD · Sin tarjeta de crédito para empezar · Cancela cuando quieras"
          : "Prices in USD · No credit card to get started · Cancel anytime"}
      </motion.p>
    </section>
  );
}
