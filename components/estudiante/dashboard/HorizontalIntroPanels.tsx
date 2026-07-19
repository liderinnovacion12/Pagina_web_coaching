"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import {
  EASE_OUT,
  revealUp,
  useIsDesktop,
  useReducedMotionSafe,
} from "@/lib/motion";

const VIDEO_SRC = "https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1";
const VIDEO_TITLE = "Video de bienvenida — Team 100% Real Estate";

function VerticalFallback() {
  return (
    <>
      <ScrollReveal variants={revealUp} once={false} className="relative">
        <h1 className="font-display text-[46px] font-bold leading-tight tracking-tight text-white sm:text-[54px]">
          Bienvenido a{" "}
          <span className="text-gradient-gold">Team 100% Real Estate</span>
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          by Wilmar Sosa y Samuel Oropeza
        </p>
        <div className="absolute -left-4 top-1/2 h-16 w-1 -translate-y-1/2 rounded-r-md bg-gold-500/80" />
      </ScrollReveal>

      <ScrollReveal variants={revealUp} once={false}>
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <iframe
            src={VIDEO_SRC}
            title={VIDEO_TITLE}
            allow="fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </ScrollReveal>
    </>
  );
}

function HorizontalPanels() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const [videoInert, setVideoInert] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);

  // El panel pineado no debe cubrir el header sticky del sitio (sus
  // controles de navegación quedarían invisibles pero seguirían siendo
  // enfocables por teclado). En vez de taparlo, el panel se ancla debajo
  // de su altura real medida en runtime.
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.getBoundingClientRect().height);
    }
  }, []);

  // El progreso debe llegar a 0 justo cuando el panel se fija (top:
  // headerHeight), no cuando el runway toca el borde absoluto del
  // viewport (y=0) — si no, hay una ventana de scroll puramente
  // vertical antes de que arranque el movimiento lateral.
  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: [`start ${headerHeight}px`, "end end"],
  });

  // El progreso crudo del scroll queda pegado 1:1 al mouse/trackpad, lo
  // que se siente mecánico y a los tirones (cada "tick" de rueda mueve el
  // panel de golpe). Un valor suavizado con resorte hace que el paneo
  // horizontal "persiga" al scroll con inercia, sintiéndose fluido en vez
  // de instantáneo. Los efectos visuales (trackX, titleX, glow, zoom del
  // video) usan este valor suavizado; el gate de accesibilidad (inert)
  // sigue atado al progreso crudo para no demorar ese estado.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 28,
    mass: 0.5,
  });

  const trackX = useTransform(smoothProgress, [0, 1], ["0%", "-50%"]);
  const titleX = useTransform(smoothProgress, [0, 0.5], [0, -40]);
  const glowOpacity = useTransform(smoothProgress, [0, 0.5], [0, 1]);
  const glowScale = useTransform(smoothProgress, [0, 0.5], [0.8, 1.15]);
  const videoScale = useTransform(smoothProgress, [0.5, 0.75], [0.94, 1]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setVideoInert(value < 0.5);
  });

  useEffect(() => {
    setVideoInert(scrollYProgress.get() < 0.5);
  }, [scrollYProgress]);

  return (
    <div
      ref={runwayRef}
      data-testid="horizontal-intro-runway"
      className="relative h-[200vh] w-screen ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]"
    >
      <div
        className="sticky overflow-hidden bg-ink-950"
        style={{
          top: headerHeight,
          height: `calc(100vh - ${headerHeight}px)`,
        }}
      >
        <motion.div style={{ x: trackX }} className="flex h-full w-[200vw]">
          {/* Panel 1: Cabecera */}
          <div className="relative flex h-full w-screen shrink-0 flex-col justify-center px-6 sm:px-10">
            <motion.div
              aria-hidden="true"
              style={{ opacity: glowOpacity, scale: glowScale }}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[60vh] bg-[radial-gradient(circle_at_50%_100%,rgba(217,167,74,0.12),transparent_60%)]"
            />
            <motion.div style={{ x: titleX }} className="relative">
              {/* Entrada al montar la página (no depende del scroll) — sin
                  esto el título aparecía de golpe a opacidad completa en
                  cuanto cargaba la pantalla, ya que titleX vale 0 en
                  progreso=0. */}
              <motion.div
                initial={{ opacity: 0, y: 25, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              >
                <h1 className="font-display text-[64px] font-bold leading-[0.95] tracking-tight text-white sm:text-[90px] lg:text-[140px]">
                  Bienvenido a{" "}
                  <span className="text-gradient-gold">
                    Team 100% Real Estate
                  </span>
                </h1>
                <p className="mt-4 text-xl text-mist-400">
                  by Wilmar Sosa y Samuel Oropeza
                </p>
                <div className="absolute -left-6 top-1/2 h-20 w-1 -translate-y-1/2 rounded-r-md bg-gold-500/80" />
              </motion.div>
            </motion.div>
          </div>

          {/* Panel 2: Video */}
          <div
            data-testid="horizontal-intro-video-panel"
            className="flex h-full w-screen shrink-0 flex-col justify-center px-6 sm:px-10"
            inert={videoInert}
          >
            <motion.div
              style={{ scale: videoScale }}
              className="relative aspect-video w-full overflow-hidden rounded-xl"
            >
              <iframe
                src={VIDEO_SRC}
                title={VIDEO_TITLE}
                allow="fullscreen"
                allowFullScreen
                className="h-full w-full"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function HorizontalIntroPanels() {
  const isDesktop = useIsDesktop();
  const reducedMotion = useReducedMotionSafe();

  if (!isDesktop || reducedMotion) {
    return <VerticalFallback />;
  }

  return <HorizontalPanels />;
}
