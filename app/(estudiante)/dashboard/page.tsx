import type { Metadata } from "next";
import { getMiembrosEquipo } from "@/lib/db/equipo";
import { getGaleriaEquipo } from "@/lib/db/galeria";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | Team 100% Real Estate",
  description: "Bienvenido al área de estudio de Team 100% Real Estate. Revisa el contenido, recursos y novedades.",
};

export default async function DashboardPage() {
  // Fetch data on the server side
  const [miembrosEquipo, galeriaEquipo] = await Promise.all([
    getMiembrosEquipo(),
    getGaleriaEquipo(),
  ]);

  return (
    <DashboardContent
      miembrosEquipo={miembrosEquipo}
      galeriaEquipo={galeriaEquipo}
    />
  );
}
