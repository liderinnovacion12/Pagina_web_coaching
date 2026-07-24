import type { Metadata } from "next";
import Link from "next/link";
import { RecuperarPasswordForm } from "./RecuperarPasswordForm";
import { LogoNCS } from "@/components/ui/LogoNCS";

export const metadata: Metadata = {
  title: "Recuperar contraseña | NCS Realty Hub",
  description: "Recupera el acceso a tu cuenta de NCS Realty Hub.",
};

export default function RecuperarPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 bg-grain px-6 py-16">
      <Link
        href="/"
        aria-label="NCS Realty Hub – Inicio"
        className="rounded-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        <LogoNCS height={88} />
      </Link>

      <div className="mt-10 w-full max-w-sm">
        <h1 className="text-center font-display text-[42px] font-bold leading-tight text-white">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-center text-lg text-mist-400">
          Te enviaremos instrucciones para restablecer tu contraseña.
        </p>

        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12 transition duration-300 hover:border-gold-500/35 hover:shadow-[0_0_0_1px_rgba(0,201,87,0.14),0_0_32px_-4px_rgba(0,201,87,0.22)]">
          <RecuperarPasswordForm />
        </div>

        <p className="mt-8 text-center text-sm text-mist-400">
          <Link
            href="/login"
            className="rounded-sm font-medium text-gold-300 transition duration-150 hover:text-gold-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            ← Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
