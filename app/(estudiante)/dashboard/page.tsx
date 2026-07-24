import type { Metadata } from "next";
import { getMiembrosEquipo } from "@/lib/db/equipo";
import { getGaleriaEquipo } from "@/lib/db/galeria";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | NCS Realty Hub",
  description: "Bienvenido al área de estudio de NCS Realty Hub. Revisa el contenido, recursos y novedades.",
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
