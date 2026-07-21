"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Star, Play, TrendingUp, Award } from "lucide-react";
import { motion, animate } from "framer-motion";
import { blurFadeUp, fadeUp, staggerContainer, useReducedMotionSafe } from "@/lib/motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function AnimatedCounter({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (typeof process !== "undefined" && process.env.NODE_ENV === "test") return value;
    return "0";
  });
  const reducedMotion = useReducedMotionSafe();

  useEffect(() => {
    if (reducedMotion) { setDisplayValue(value); return; }
    const numericPart = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericPart)) { setDisplayValue(value); return; }
    const suffix = value.replace(/[0-9,]/g, "");
    const hasCommas = value.includes(",");
    const controls = animate(0, numericPart, {
      duration: 2.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        const rounded = Math.floor(latest);
        const formatted = hasCommas ? rounded.toLocaleString("en-US") : rounded.toString();
        setDisplayValue(`${formatted}${suffix}`);
      },
    });
    return () => controls.stop();
  }, [value, reducedMotion]);

  return <>{displayValue}</>;
}

function FloatingCourseCard() {
  const [progress, setProgress] = useState(0);
  const { tr } = useLanguage();
  const h = tr.hero;

  useEffect(() => {
    const timer = setTimeout(() => {
      const controls = animate(0, 68, {
        duration: 2.4,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setProgress(Math.floor(v)),
      });
      return () => controls.stop();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-sm"
      style={{ perspective: 1000 }}
    >
      <div
        aria-hidden="true"
        className="absolute -inset-4 rounded-3xl blur-2xl opacity-30"
        style={{ background: "radial-gradient(circle, rgba(217,169,78,0.4) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-2xl border border-white/10 bg-ink-900/80 p-5 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="relative h-40 w-full rounded-xl overflow-hidden mb-4"
          style={{ background: "linear-gradient(135deg, #1b1b2b 0%, #282840 50%, #1b1b2b 100%)" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div whileHover={{ scale: 1.1 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/20 border border-gold-500/40 backdrop-blur-sm cursor-pointer"
            >
              <Play className="h-6 w-6 text-gold-400 ml-0.5" fill="currentColor" />
            </motion.div>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-green-500/20 border border-green-500/40 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[10px] text-green-400">{h.liveLabel}</span>
          </div>
          <div className="absolute inset-0 opacity-10"
            style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(217,169,78,0.1) 10px, rgba(217,169,78,0.1) 11px)" }}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-gold-500/15 border border-gold-500/30 px-2 py-0.5 font-mono text-[10px] text-gold-400 uppercase tracking-wider">
              {h.levelLabels.liderazgo}
            </span>
            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-mist-400 uppercase tracking-wider">
              {h.levelLabels.avanzado}
            </span>
          </div>
          <h3 className="font-display text-sm font-semibold text-white leading-tight mb-3">
            {h.courseTitle}
          </h3>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-mono text-[10px] text-mist-500">{h.progressLabel}</span>
              <span className="font-mono text-[10px] text-gold-400">{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #d9a94e, #e8c168)",
                  boxShadow: "0 0 8px rgba(217,169,78,0.6)",
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {["bg-gold-500", "bg-blue-500", "bg-purple-500", "bg-green-500"].map((color, i) => (
                <div key={i} className={`h-6 w-6 rounded-full border-2 border-ink-900 ${color} flex items-center justify-center`}>
                  <span className="text-[8px] text-white font-bold">{String.fromCharCode(65 + i)}</span>
                </div>
              ))}
              <div className="h-6 w-6 rounded-full border-2 border-ink-900 bg-ink-700 flex items-center justify-center">
                <span className="text-[8px] text-mist-400">+24</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
              <span className="font-mono text-[10px] text-gold-400">4.9</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-12 top-1/3 hidden lg:flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/90 backdrop-blur-xl p-3 shadow-xl"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/20">
          <TrendingUp className="h-4 w-4 text-gold-400" />
        </div>
        <div>
          <p className="font-mono text-[9px] text-mist-500">Crecimiento</p>
          <p className="font-display text-xs font-bold text-white">+127%</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -right-8 bottom-16 hidden lg:flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/90 backdrop-blur-xl p-3 shadow-xl"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
          <Award className="h-4 w-4 text-green-400" />
        </div>
        <div>
          <p className="font-mono text-[9px] text-mist-500">Certificados</p>
          <p className="font-display text-xs font-bold text-white">1,200+</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HeroContent() {
  const reducedMotion = useReducedMotionSafe();
  const animVariant = reducedMotion ? fadeUp : blurFadeUp;
  const { tr } = useLanguage();
  const h = tr.hero;

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-12 sm:pt-24">
      <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.08, 0.1)}
          className="flex-1 text-left"
        >
          <motion.div variants={animVariant} className="mb-6 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 font-mono text-xs text-gold-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
              {h.badge}
            </span>
          </motion.div>

          <motion.h1
            variants={animVariant}
            className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl"
          >
            {h.h1Line1}
            <br />
            <span className="text-gradient-gold">{h.h1Line2}</span>
            <br />
            <span className="text-white">{h.h1Line3}</span>
          </motion.h1>

          <motion.p variants={animVariant} className="mt-6 max-w-lg text-lg text-mist-400 leading-relaxed">
            {h.desc}
          </motion.p>

          <motion.div variants={animVariant} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/registro"
                className="group relative overflow-hidden inline-flex h-13 items-center justify-center rounded-xl bg-gold-500 px-8 py-3.5 font-semibold text-ink-950 shadow-[0_0_32px_rgba(217,169,78,0.25)] transition-all duration-300 hover:bg-gold-400 hover:shadow-[0_0_48px_rgba(217,169,78,0.4)] text-base"
              >
                <span className="relative z-10">{h.cta1}</span>
                <span className="absolute inset-0 z-0 w-[200%] translate-x-[-100%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="#cursos"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-white/15 px-8 py-3.5 font-semibold text-white transition-all duration-300 hover:border-gold-500/40 hover:bg-white/5 text-base"
              >
                <Play className="h-4 w-4 fill-current" />
                {h.cta2}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={animVariant} className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["bg-gold-500", "bg-blue-400", "bg-purple-500", "bg-pink-500", "bg-green-500"].map((color, i) => (
                <div key={i} className={`h-8 w-8 rounded-full border-2 border-ink-950 ${color}`} />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-gold-400 text-gold-400" />)}
              </div>
              <p className="font-mono text-xs text-mist-400">
                <span className="text-white font-semibold">2,000+</span> {h.socialProof}
              </p>
            </div>
          </motion.div>

          <motion.dl variants={animVariant} className="mt-12 grid grid-cols-3 gap-8">
            {h.stats.map((stat) => (
              <div key={stat.etiqueta} className="border-t border-white/10 pt-4">
                <dd className="font-display text-3xl font-extrabold text-gold-400 [text-shadow:0_0_30px_rgba(217,169,78,0.4)] sm:text-4xl">
                  <AnimatedCounter value={stat.valor} />
                </dd>
                <p className="mt-1 font-mono text-xs text-mist-500 uppercase tracking-wider">{stat.etiqueta}</p>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <div className="flex-1 flex justify-center lg:justify-end">
          <FloatingCourseCard />
        </div>
      </div>

      <motion.a
        href="#cursos"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-16 flex flex-col items-center gap-2 text-mist-500 transition-colors duration-200 hover:text-gold-300"
      >
        <span className="font-mono text-xs uppercase tracking-wider">{h.scrollLabel}</span>
        <motion.span
          animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </motion.span>
      </motion.a>
    </section>
  );
}
