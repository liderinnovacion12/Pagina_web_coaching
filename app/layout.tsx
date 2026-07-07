import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coachpro",
  description: "Plataforma de cursos online",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
