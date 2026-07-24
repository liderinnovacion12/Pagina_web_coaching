import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SoporteWidget } from "@/components/soporte/SoporteWidget";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NCS Realty Hub | Transforma tu Liderazgo",
  description: "Plataforma de coaching ejecutivo para líderes que buscan impacto real.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${mono.variable}`}>
      <head>
        {/* Anti-flash: aplica el tema antes del primer paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <SoporteWidget />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
