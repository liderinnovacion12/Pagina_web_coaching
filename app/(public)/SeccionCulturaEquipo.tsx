"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, Lightbulb, Target } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { TeamLeaderCard } from "@/components/estudiante/dashboard/TeamLeaderCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { revealSlideLeft, revealSlideRight, revealUp } from "@/lib/motion";
import type { MiembroEquipo } from "@/lib/db/equipo";
import type { FotoGaleria } from "@/lib/db/galeria";

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
};

const cardUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } },
};

const revealFromLeft = {
  hidden: { opacity: 0, x: -100, rotate: -3, filter: "blur(8px)" },
  visible: { opacity: 1, x: 0, rotate: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
};

const revealFromRight = {
  hidden: { opacity: 0, x: 100, rotate: 3, filter: "blur(8px)" },
  visible: { opacity: 1, x: 0, rotate: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
};

interface Props {
  miembrosEquipo: MiembroEquipo[];
  galeriaEquipo: FotoGaleria[];
}

export function SeccionCulturaEquipo({ miembrosEquipo, galeriaEquipo }: Props) {
  const { tr } = useLanguage();
  const d = tr.estudiante.dashboard;

  return (
    <section className="relative isolate mx-auto max-w-6xl px-6 py-24 flex flex-col gap-20">

      {/* Glow decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_60%_0%,rgba(0,201,87,0.06),transparent_60%)]"
      />

      {/* ── Encabezado de sección ─────────────────────────────── */}
      <div className="overflow-x-hidden">
        <ScrollReveal variants={revealSlideLeft} once>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500">
            {d.culturaTitulo}
          </span>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {d.culturaTitulo}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-mist-400 leading-relaxed">
            {d.culturaDesc}
          </p>
        </ScrollReveal>
      </div>

      {/* ── Misión & Visión ───────────────────────────────────── */}
      <ScrollReveal variants={container} once className="grid gap-6 sm:grid-cols-2">
        <motion.div
          variants={cardUp}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/[0.07] bg-ink-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-gold-500/25 hover:shadow-[0_0_0_1px_rgb(var(--gold-500)/0.1)]"
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/20">
            <Target className="h-6 w-6 text-gold-400" aria-hidden="true" />
          </div>
          <h3 className="font-display text-xl font-bold text-white">{d.misionTitulo}</h3>
          <p className="mt-3 text-base leading-relaxed text-mist-400">{d.misionDesc}</p>
        </motion.div>

        <motion.div
          variants={cardUp}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/[0.07] bg-ink-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-gold-500/25 hover:shadow-[0_0_0_1px_rgb(var(--gold-500)/0.1)]"
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/20">
            <Eye className="h-6 w-6 text-gold-400" aria-hidden="true" />
          </div>
          <h3 className="font-display text-xl font-bold text-white">{d.visionTitulo}</h3>
          <p className="mt-3 text-base leading-relaxed text-mist-400">{d.visionDesc}</p>
        </motion.div>
      </ScrollReveal>

      {/* ── Nuestros Valores ──────────────────────────────────── */}
      <div className="flex flex-col gap-8">
        <div className="overflow-x-hidden">
          <ScrollReveal variants={revealSlideRight} once>
            <h3 className="font-display text-2xl font-bold text-white">{d.valoresTitulo}</h3>
          </ScrollReveal>
        </div>

        <ScrollReveal variants={container} once className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {d.valores.map((valor, i) => (
            <motion.div
              key={valor.nombre}
              variants={i % 2 === 0 ? revealSlideLeft : revealSlideRight}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-white/[0.07] bg-ink-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.14]"
            >
              <span className="font-display text-lg font-bold text-gradient-gold">{valor.nombre}</span>
              <p className="mt-2.5 text-sm leading-relaxed text-mist-400">{valor.descripcion}</p>
            </motion.div>
          ))}
        </ScrollReveal>
      </div>

      {/* ── Filosofía de Equipo ───────────────────────────────── */}
      <ScrollReveal
        variants={revealUp}
        once
        className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-ink-900/80 to-transparent p-10 sm:p-12 transition-all duration-300 hover:border-gold-500/20"
      >
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-gold-500/5 blur-3xl -z-10" />
        <Lightbulb aria-hidden="true" className="absolute right-8 top-8 h-16 w-16 text-gold-500/8" />

        <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500">
          {d.filosofiaTitulo}
        </span>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-mist-300">{d.filosofiaDesc}</p>
        <blockquote className="mt-6 border-l-2 border-gold-500/60 pl-5">
          <p className="text-base font-semibold text-white">{d.filosofiaCita}</p>
        </blockquote>
      </ScrollReveal>

      {/* ── Team Leaders ──────────────────────────────────────── */}
      {miembrosEquipo.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="overflow-x-hidden">
            <ScrollReveal variants={revealSlideLeft} once>
              <h3 className="font-display text-2xl font-bold text-white">{d.teamLeaders}</h3>
            </ScrollReveal>
          </div>

          <ScrollReveal
            variants={container}
            once
            className="grid gap-6 overflow-x-hidden sm:grid-cols-2 lg:grid-cols-3"
          >
            {miembrosEquipo.map((miembro, i) => (
              <TeamLeaderCard
                key={miembro.id}
                miembro={miembro}
                variants={i % 2 === 0 ? revealFromLeft : revealFromRight}
              />
            ))}
          </ScrollReveal>
        </div>
      )}

      {/* ── Galería del Equipo ────────────────────────────────── */}
      {galeriaEquipo.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="overflow-x-hidden">
            <ScrollReveal variants={revealSlideLeft} once>
              <h3 className="font-display text-2xl font-bold text-white">{d.galeriaTitulo}</h3>
            </ScrollReveal>
          </div>

          <ScrollReveal
            variants={container}
            once
            className="grid grid-cols-2 gap-4 overflow-x-hidden sm:grid-cols-3 lg:grid-cols-4"
          >
            {galeriaEquipo.map((foto, i) => (
              <motion.div
                key={foto.id}
                variants={i % 2 === 0 ? revealFromLeft : revealFromRight}
                whileHover={{ scale: 1.03, y: -3 }}
                transition={{ duration: 0.2 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-ink-900 shadow-lg"
              >
                <Image
                  src={foto.url}
                  alt="Foto del equipo NCS Realty Hub"
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            ))}
          </ScrollReveal>
        </div>
      )}
    </section>
  );
}
