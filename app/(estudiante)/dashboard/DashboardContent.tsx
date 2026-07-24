"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Eye,
  Lightbulb,
  MessageCircle,
  Target,
} from "lucide-react";
import type { MiembroEquipo } from "@/lib/db/equipo";
import type { FotoGaleria } from "@/lib/db/galeria";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { revealSlideLeft, revealSlideRight, revealUp } from "@/lib/motion";
import { TeamLeaderCard } from "@/components/estudiante/dashboard/TeamLeaderCard";
import { HorizontalIntroPanels } from "@/components/estudiante/dashboard/HorizontalIntroPanels";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Contenedor de grilla con stagger para los hijos, disparado cuando la
// grilla entra en el viewport (no al montar la página).
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const, // Ease Out Quad/Quart premium
    },
  },
};

// ── Coreografía de encabezados y tarjetas ─────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

const revealLeft: Variants = {
  hidden: { opacity: 0, x: -40, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

const revealRight: Variants = {
  hidden: { opacity: 0, x: 40, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

const revealScale: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

// Entrada lateral pronunciada para tarjetas dentro de grillas (Dos
// Columnas, Team Leaders, Valores, Galería) — mucho más recorrido y una
// leve rotación frente a revealLeft/revealRight, para que se sienta como
// que la tarjeta "cae" desde fuera de la pantalla en vez de un simple
// desplazamiento.
const revealFromLeftFar: Variants = {
  hidden: { opacity: 0, x: -130, rotate: -4, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
};

const revealFromRightFar: Variants = {
  hidden: { opacity: 0, x: 130, rotate: 4, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
};

interface DashboardContentProps {
  miembrosEquipo: MiembroEquipo[];
  galeriaEquipo: FotoGaleria[];
}

export function DashboardContent({
  miembrosEquipo,
  galeriaEquipo,
}: DashboardContentProps) {
  const { tr } = useLanguage();
  const d = tr.estudiante.dashboard;

  return (
    <div className="flex flex-col gap-12">
      {/* 1-2. Cabecera + Video: paneles horizontales en desktop, layout vertical en mobile/reduced-motion */}
      <HorizontalIntroPanels />

      {/* 3. Banner de Comunidad WhatsApp */}
      <ScrollReveal
        variants={revealUp}
        once={false}
        className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-r from-whatsapp/10 via-transparent to-transparent p-8 sm:p-10 transition-all duration-300 hover:border-whatsapp/30 hover:shadow-[0_0_40px_rgba(37,211,102,0.05)]"
      >
        {/* Glow de fondo */}
        <div className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-whatsapp/5 blur-[80px]" />

        <p className="font-mono text-xs uppercase tracking-wider text-whatsapp">
          {d.comunidad}
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          {d.comunidadTitulo}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mist-300">
          {d.comunidadDesc}
        </p>
        <Link
          href="/herramientas"
          className="mt-6 inline-flex h-[54px] items-center justify-center gap-2.5 rounded-xl bg-whatsapp px-8 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-whatsapp-dark hover:shadow-[0_0_24px_rgba(37,211,102,0.25)] active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          {d.comunidadBtn}
        </Link>
      </ScrollReveal>

      {/* 4. Dos Columnas: Inducción & Accesos */}
      <ScrollReveal
        variants={containerVariants}
        once={false}
        className="grid gap-6 overflow-x-hidden sm:grid-cols-2"
      >
        {/* Cómo Usar */}
        <motion.div
          variants={revealSlideLeft}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03]"
        >
          <h3 className="font-display text-xl font-bold text-gradient-gold">
            {d.comoUsarTitulo}
          </h3>
          <ol className="mt-7 flex flex-col gap-6">
            {d.pasos.map((paso, indice) => (
              <motion.li
                key={paso}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 group"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 font-mono text-sm font-bold text-gold-300 border border-gold-500/20 group-hover:bg-gold-500/20 transition-all duration-200">
                  {indice + 1}
                </span>
                <span className="text-base leading-relaxed text-mist-300 group-hover:text-white transition-colors duration-200">
                  {paso}
                </span>
              </motion.li>
            ))}
          </ol>
        </motion.div>

        {/* Accesos Rápidos */}
        <motion.div
          variants={revealSlideRight}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03]"
        >
          <h3 className="font-display text-xl font-bold text-gradient-gold">
            {d.enlacesTitulo}
          </h3>
          <ul className="mt-6 flex flex-col gap-2">
            {d.enlaces.map((acceso) => (
              <li key={acceso.href}>
                <Link
                  href={acceso.href}
                  className="group flex items-center justify-between rounded-xl border border-transparent px-5 py-4 text-base text-mist-300 transition-all duration-200 hover:border-white/5 hover:bg-white/[0.02] hover:text-gold-300"
                >
                  <span className="font-medium">{acceso.label}</span>
                  <ArrowRight className="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1 text-mist-500 group-hover:text-gold-300" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </ScrollReveal>

      {/* Separador de Sección */}
      <ScrollReveal
        variants={revealUp}
        once={false}
        className="my-2 border-t border-white/[0.06]"
      />

      {/* 5. Cabecera Cultura */}
      {/* El overflow-x-hidden vive en este wrapper estático (no en el
          ScrollReveal) porque revealLeft traslada el propio ScrollReveal en
          su estado "hidden" (x: -40) — recortar en el mismo elemento que se
          traslada no sirve, ya que el área de recorte se mueve junto con el
          contenido. */}
      <div className="overflow-x-hidden">
        <ScrollReveal variants={revealLeft} once={false}>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {d.culturaTitulo}
          </h2>
          <p className="mt-2.5 text-lg text-mist-400">
            {d.culturaDesc}
          </p>
        </ScrollReveal>
      </div>

      {/* 6. Team Leaders */}
      <div className="flex flex-col gap-6">
        <ScrollReveal
          variants={revealScale}
          once={false}
          className="flex items-center px-1"
        >
          <h3 className="font-display text-xl font-bold text-white">{d.teamLeaders}</h3>
        </ScrollReveal>

        <ScrollReveal
          variants={containerVariants}
          once={false}
          className="grid gap-6 overflow-x-hidden sm:grid-cols-2"
        >
          {miembrosEquipo.map((miembro, indice) => (
            <TeamLeaderCard
              key={miembro.id}
              miembro={miembro}
              variants={indice % 2 === 0 ? revealFromLeftFar : revealFromRightFar}
            />
          ))}
        </ScrollReveal>
      </div>

      {/* 7. Misión & Visión */}
      <ScrollReveal
        variants={containerVariants}
        once={false}
        className="grid gap-6 sm:grid-cols-2"
      >
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-gold-500/20"
        >
          <div className="flex items-center gap-4">
            <Target className="h-11 w-11 shrink-0 text-gold-400" aria-hidden="true" />
            <h3 className="font-display text-xl font-bold text-white">{d.misionTitulo}</h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-mist-300">
            {d.misionDesc}
          </p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-gold-500/20"
        >
          <div className="flex items-center gap-4">
            <Eye className="h-11 w-11 shrink-0 text-gold-400" aria-hidden="true" />
            <h3 className="font-display text-xl font-bold text-white">{d.visionTitulo}</h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-mist-300">
            {d.visionDesc}
          </p>
        </motion.div>
      </ScrollReveal>

      {/* 8. Nuestros Valores */}
      {/* overflow-x-hidden vive en este wrapper (no en el ScrollReveal del
          encabezado) porque revealRight traslada el propio ScrollReveal en
          su estado "hidden" (x: 40) — recortar en el mismo elemento que se
          traslada no sirve. */}
      <div className="flex flex-col gap-6 overflow-x-hidden">
        <ScrollReveal variants={revealRight} once={false} className="flex items-center px-1">
          <h3 className="font-display text-xl font-bold text-white">{d.valoresTitulo}</h3>
        </ScrollReveal>

        <ScrollReveal
          variants={containerVariants}
          once={false}
          className="grid gap-6 sm:grid-cols-2"
        >
          {d.valores.map((valor, indice) => (
            <motion.div
              key={valor.nombre}
              variants={indice % 2 === 0 ? revealSlideLeft : revealSlideRight}
              whileHover={{ scale: 1.01 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.12]"
            >
              <h4 className="font-display text-2xl font-bold text-gradient-gold">{valor.nombre}</h4>
              <p className="mt-3 text-sm leading-relaxed text-mist-300">{valor.descripcion}</p>
            </motion.div>
          ))}
        </ScrollReveal>
      </div>

      {/* 9. Filosofía de Equipo */}
      <ScrollReveal
        variants={revealUp}
        once={false}
        className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 sm:p-10 transition-all duration-300 hover:border-gold-500/25"
      >
        {/* Adorno visual existente */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold-500/5 blur-[50px] -z-10" />

        <Lightbulb
          aria-hidden="true"
          className="absolute right-6 top-6 h-20 w-20 text-gold-500/10"
        />
        <h2 className="relative mt-3.5 font-display text-2xl font-bold text-white">
          {d.filosofiaTitulo}
        </h2>
        <p className="relative mt-3.5 text-base leading-relaxed text-mist-300">
          {d.filosofiaDesc}
        </p>
        <div className="relative mt-5 border-l-2 border-gold-500/60 pl-4">
          <p className="text-base font-semibold text-white">
            {d.filosofiaCita}
          </p>
        </div>
      </ScrollReveal>

      {/* 10. Galería de Equipo */}
      {/* overflow-x-hidden vive en este wrapper (no en el ScrollReveal del
          encabezado) porque revealLeft traslada el propio ScrollReveal en
          su estado "hidden" (x: -40) — recortar en el mismo elemento que se
          traslada no sirve. */}
      <div className="flex flex-col gap-6 overflow-x-hidden">
        <ScrollReveal
          variants={revealLeft}
          once={false}
          className="flex flex-col items-center px-1 text-center"
        >
          <h3 className="font-display text-xl font-bold text-white">{d.galeriaTitulo}</h3>
        </ScrollReveal>

        <ScrollReveal
          variants={containerVariants}
          once={false}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {galeriaEquipo.map((foto, indice) => (
            <motion.div
              key={foto.id}
              variants={indice % 2 === 0 ? revealFromLeftFar : revealFromRightFar}
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ duration: 0.2 }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-ink-900 cursor-pointer shadow-lg"
            >
              <Image
                src={foto.url}
                alt="Foto del equipo NCS Realty Hub"
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </ScrollReveal>
      </div>
    </div>
  );
}
