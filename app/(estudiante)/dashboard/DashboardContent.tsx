"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
import type { MiembroEquipo } from "@/lib/db/equipo";
import type { FotoGaleria } from "@/lib/db/galeria";

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

// Contenedor principal con stagger para los hijos
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
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

interface DashboardContentProps {
  miembrosEquipo: MiembroEquipo[];
  galeriaEquipo: FotoGaleria[];
}

export function DashboardContent({
  miembrosEquipo,
  galeriaEquipo,
}: DashboardContentProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-12"
    >
      {/* 1. Cabecera Principal */}
      <motion.div variants={cardVariants} className="relative">
        <h1 className="font-display text-[46px] font-bold leading-tight tracking-tight text-white sm:text-[54px]">
          Bienvenido a <span className="text-gradient-gold">Team 100% Real Estate</span>
        </h1>
        <p className="mt-2 text-lg text-mist-400">by Wilmar Sosa y Samuel Oropeza</p>
        <div className="absolute -left-4 top-1/2 h-16 w-1 -translate-y-1/2 rounded-r-md bg-gold-500/80" />
      </motion.div>

      {/* 2. Video de Bienvenida */}
      <motion.div
        variants={cardVariants}
        className="group relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-5 sm:p-7 transition-all duration-300 hover:border-gold-500/20 hover:shadow-[0_0_50px_rgba(217,169,78,0.05)]"
      >
        <div className="flex items-center justify-between px-1 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-wider text-mist-400">
              Video de inducción
            </p>
          </div>
          <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-gold-300 border border-white/5">
            4 min
          </span>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950 shadow-2xl">
          <iframe
            src="https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1"
            title="Video de bienvenida — Team 100% Real Estate"
            allow="fullscreen"
            allowFullScreen
            className="h-full w-full opacity-90 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>
      </motion.div>

      {/* 3. Banner de Comunidad WhatsApp */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-r from-whatsapp/10 via-transparent to-transparent p-8 sm:p-10 transition-all duration-300 hover:border-whatsapp/30 hover:shadow-[0_0_40px_rgba(37,211,102,0.05)]"
      >
        {/* Glow de fondo */}
        <div className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-whatsapp/5 blur-[80px]" />
        
        <p className="font-mono text-xs uppercase tracking-wider text-whatsapp">
          Comunidad activa
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          Únete a la comunidad de Team 100% Real Estate
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mist-300">
          Súmate a los grupos y comunidades de WhatsApp para conectar con otros
          agentes, resolver dudas y enterarte de las próximas clases en vivo de inmediato.
        </p>
        <Link
          href="/herramientas"
          className="mt-6 inline-flex h-[54px] items-center justify-center gap-2.5 rounded-xl bg-whatsapp px-8 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-whatsapp-dark hover:shadow-[0_0_24px_rgba(37,211,102,0.25)] active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Únete a los Grupos y Comunidades de WhatsApp
        </Link>
      </motion.div>

      {/* 4. Dos Columnas: Inducción & Accesos */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Cómo Usar */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03]"
        >
          <h3 className="font-display text-lg font-bold text-white">
            Cómo Usar la Plataforma
          </h3>
          <ol className="mt-6 flex flex-col gap-5">
            {PASOS_USO.map((paso, indice) => (
              <motion.li
                key={paso}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 group"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 font-mono text-xs font-bold text-gold-300 border border-gold-500/20 group-hover:bg-gold-500/20 transition-all duration-200">
                  {indice + 1}
                </span>
                <span className="text-sm leading-relaxed text-mist-300 group-hover:text-white transition-colors duration-200">
                  {paso}
                </span>
              </motion.li>
            ))}
          </ol>
        </motion.div>

        {/* Accesos Rápidos */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03]"
        >
          <h3 className="font-display text-lg font-bold text-white">
            Enlaces de Interés
          </h3>
          <ul className="mt-5 flex flex-col gap-1.5">
            {ACCESOS_RAPIDOS.map((acceso) => (
              <li key={acceso.href}>
                <Link
                  href={acceso.href}
                  className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3.5 text-sm text-mist-300 transition-all duration-200 hover:border-white/5 hover:bg-white/[0.02] hover:text-gold-300"
                >
                  <span className="font-medium">{acceso.label}</span>
                  <ArrowRight className="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1 text-mist-500 group-hover:text-gold-300" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Separador de Sección */}
      <motion.div variants={cardVariants} className="my-2 border-t border-white/[0.06]" />

      {/* 5. Cabecera Cultura */}
      <motion.div variants={cardVariants}>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Cultura y Equipo
        </h2>
        <p className="mt-2.5 text-lg text-mist-400">
          Conoce a los líderes y los principios que nos guían.
        </p>
      </motion.div>

      {/* 6. Team Leaders */}
      <div className="flex flex-col gap-6">
        <motion.div variants={cardVariants} className="flex items-center gap-2.5 px-1">
          <Users className="h-5 w-5 text-gold-400" aria-hidden="true" />
          <h3 className="font-display text-xl font-bold text-white">Team Leaders</h3>
        </motion.div>
        
        <div className="grid gap-6 sm:grid-cols-2">
          {miembrosEquipo.map((miembro) => (
            <motion.div
              key={miembro.id}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="group relative h-[440px] overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950"
            >
              {miembro.fotoUrl ? (
                <Image
                  src={miembro.fotoUrl}
                  alt={miembro.nombre}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top opacity-70 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90"
                />
              ) : (
                <div className="absolute inset-0 bg-ink-900" aria-hidden="true" />
              )}
              {/* Degradado premium para que no se pierda el texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent transition-opacity duration-300 group-hover:via-ink-950/50" />
              
              <div className="absolute inset-x-0 bottom-0 p-8">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold-400">
                  {miembro.cargo}
                </span>
                <h3 className="mt-1.5 font-display text-2xl font-bold text-white">
                  {miembro.nombre}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-mist-300">
                  {miembro.descripcionCargo}
                </p>
                <a
                  href={`tel:${miembro.telefono}`}
                  className="mt-4.5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition duration-200 hover:text-gold-200"
                >
                  <span className="underline decoration-gold-500/40 hover:decoration-gold-400">
                    {miembro.telefono}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 7. Misión & Visión */}
      <div className="grid gap-6 sm:grid-cols-2">
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-gold-500/20"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300">
            <Target className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="mt-4.5 font-display text-xl font-bold text-white">Nuestra Misión</h3>
          <p className="mt-3 text-sm leading-relaxed text-mist-300">
            Empoderar a cada agente para que alcance su máximo potencial, brindándole las
            herramientas, el acompañamiento y el entorno correcto para crecer de manera
            profesional y personal.
          </p>
        </motion.div>
        
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-gold-500/20"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300">
            <Eye className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="mt-4.5 font-display text-xl font-bold text-white">Nuestra Visión</h3>
          <p className="mt-3 text-sm leading-relaxed text-mist-300">
            Construir un equipo sólido, colaborativo y en constante crecimiento, donde cada
            agente opere su negocio con claridad, estructura y mentalidad de liderazgo.
          </p>
        </motion.div>
      </div>

      {/* 8. Nuestros Valores */}
      <div className="flex flex-col gap-6">
        <motion.div variants={cardVariants} className="flex items-center gap-2.5 px-1">
          <Heart className="h-5 w-5 text-gold-400" aria-hidden="true" />
          <h3 className="font-display text-xl font-bold text-white">Nuestros Valores</h3>
        </motion.div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {VALORES.map((valor) => (
            <motion.div
              key={valor.nombre}
              variants={cardVariants}
              whileHover={{ scale: 1.01 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/20">
                <Check className="h-4.5 w-4.5 text-gold-300" aria-hidden="true" />
              </div>
              <h4 className="mt-3 font-display font-bold text-white">{valor.nombre}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-mist-300">{valor.descripcion}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 9. Filosofía de Equipo */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 sm:p-10 transition-all duration-300 hover:border-gold-500/25"
      >
        {/* Adorno visual */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold-500/5 blur-[50px] -z-10" />
        
        <Lightbulb className="h-6 w-6 text-gold-400" aria-hidden="true" />
        <h2 className="mt-3.5 font-display text-2xl font-bold text-white">
          Filosofía de Equipo
        </h2>
        <p className="mt-3.5 text-base leading-relaxed text-mist-300">
          Creemos firmemente en el trabajo en equipo, la transformación continua y la dedicación
          diaria. Somos una comunidad colaborativa donde nos apoyamos unos a otros, compartimos
          conocimiento y buscamos crecer juntos.
        </p>
        <div className="mt-5 border-l-2 border-gold-500/60 pl-4">
          <p className="text-base font-semibold text-white">
            Aquí no estamos solo para recibir información. Estamos para dar, aportar y sumar valor al equipo.
          </p>
        </div>
      </motion.div>

      {/* 10. Galería de Equipo */}
      <div className="flex flex-col gap-6">
        <motion.div variants={cardVariants} className="flex items-center gap-2.5 px-1">
          <ImageIcon className="h-5 w-5 text-gold-400" aria-hidden="true" />
          <h3 className="font-display text-xl font-bold text-white">Galería del Equipo</h3>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {galeriaEquipo.map((foto) => (
            <motion.div
              key={foto.id}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ duration: 0.2 }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-ink-900 cursor-pointer shadow-lg"
            >
              <Image
                src={foto.url}
                alt="Foto del equipo Team 100% Real Estate"
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
