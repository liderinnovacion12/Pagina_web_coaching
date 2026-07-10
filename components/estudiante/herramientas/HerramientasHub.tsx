"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";
import { staggerContainer, blurFadeUp } from "@/lib/motion";
import { GrupoPrincipalCard } from "./GrupoPrincipalCard";
import { IndicadoresPanel } from "./IndicadoresPanel";
import { HerramientasToolbar, type OrdenGrupos, type VistaGrupos } from "./HerramientasToolbar";
import { CategoriaChips, type FiltroCategoria } from "./CategoriaChips";
import { GrupoCard } from "./GrupoCard";
import { Paginacion } from "./Paginacion";

const POR_PAGINA = 12;

const BENEFICIOS = [
  "Conecta directo con otros agentes del equipo.",
  "Resuelve dudas de proyectos en tiempo real.",
  "Entérate primero de nuevas clases y anuncios.",
];

export function HerramientasHub({ grupos }: { grupos: GrupoComunidad[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<FiltroCategoria>("todos");
  const [orden, setOrden] = useState<OrdenGrupos>("nombre");
  const [vista, setVista] = useState<VistaGrupos>("grid");
  const [pagina, setPagina] = useState(1);

  const grupoPrincipal = useMemo(
    () => grupos.find((grupo) => grupo.categoria === "grupo_principal"),
    [grupos]
  );

  const gruposDeProyecto = useMemo(
    () => grupos.filter((grupo) => grupo.categoria !== "grupo_principal"),
    [grupos]
  );

  const conteos = useMemo(() => {
    const base: Record<FiltroCategoria, number> = {
      todos: gruposDeProyecto.length,
      grupo_principal: 0,
      miami: 0,
      orlando_centro_florida: 0,
      venta_renta: 0,
      otros: 0,
    };
    for (const grupo of gruposDeProyecto) {
      base[grupo.categoria] += 1;
    }
    return base;
  }, [gruposDeProyecto]);

  const gruposFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const filtrados = gruposDeProyecto.filter((grupo) => {
      const coincideTexto =
        grupo.nombre.toLowerCase().includes(texto) ||
        (grupo.detalle ?? "").toLowerCase().includes(texto);
      const coincideCategoria = filtroCategoria === "todos" || grupo.categoria === filtroCategoria;
      return coincideTexto && coincideCategoria;
    });

    return [...filtrados].sort((a, b) => {
      if (orden === "nombre") {
        return a.nombre.localeCompare(b.nombre);
      }
      return (b.creadoEn ?? "").localeCompare(a.creadoEn ?? "");
    });
  }, [gruposDeProyecto, busqueda, filtroCategoria, orden]);

  const totalPaginas = Math.max(1, Math.ceil(gruposFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const gruposPagina = gruposFiltrados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA
  );

  function conFiltroNuevo(aplicar: () => void) {
    aplicar();
    setPagina(1);
  }

  return (
    <div className="flex flex-col gap-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.1)}
        className="grid gap-8 rounded-[24px] border border-white/[0.06] bg-gradient-to-r from-whatsapp/10 via-transparent to-transparent p-8 sm:grid-cols-[1.4fr_1fr] sm:p-10"
      >
        <motion.div variants={blurFadeUp}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-whatsapp/20 bg-whatsapp/10 text-whatsapp">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-whatsapp">
            Prioridad #1 para nuevos agentes
          </p>
          <h1 className="mt-2 font-display text-[42px] font-bold leading-tight text-white">
            Herramientas y Comunicación
          </h1>
          <p className="mt-3 max-w-xl text-lg text-mist-400">
            Directorio de grupos y comunidades del equipo. Conectarte es uno de los primeros
            pasos para operar dentro de Team 100% Real Estate.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio} className="flex items-start gap-2.5 text-sm text-mist-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                {beneficio}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          variants={blurFadeUp}
          aria-hidden="true"
          className="hidden items-center justify-center sm:flex"
        >
          <div className="h-40 w-40 rounded-full bg-whatsapp/10 blur-2xl" />
        </motion.div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2">
        <GrupoPrincipalCard grupo={grupoPrincipal} />
        <IndicadoresPanel totalGrupos={gruposDeProyecto.length} />
      </div>

      <HerramientasToolbar
        busqueda={busqueda}
        onBusquedaChange={(valor) => conFiltroNuevo(() => setBusqueda(valor))}
        orden={orden}
        onOrdenChange={setOrden}
        vista={vista}
        onVistaChange={setVista}
      />

      <CategoriaChips
        conteos={conteos}
        filtro={filtroCategoria}
        onFiltroChange={(valor) => conFiltroNuevo(() => setFiltroCategoria(valor))}
      />

      {gruposFiltrados.length === 0 ? (
        <p className="text-mist-400">No encontramos grupos con ese nombre.</p>
      ) : (
        <motion.div
          key={`${vista}-${paginaSegura}`}
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.04)}
          className={vista === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}
        >
          {gruposPagina.map((grupo) => (
            <GrupoCard key={grupo.id} grupo={grupo} vista={vista} />
          ))}
        </motion.div>
      )}

      <Paginacion
        pagina={paginaSegura}
        totalPaginas={totalPaginas}
        totalItems={gruposFiltrados.length}
        porPagina={POR_PAGINA}
        onPaginaChange={setPagina}
      />
    </div>
  );
}
