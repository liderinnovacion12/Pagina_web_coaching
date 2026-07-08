import type { Metadata } from "next";
import Link from "next/link";
import { ActualizarPasswordForm } from "./ActualizarPasswordForm";

export const metadata: Metadata = {
  title: "Actualizar contraseña | Team 100% Real Estate",
  description: "Establece una nueva contraseña para tu cuenta de Team 100% Real Estate.",
};

export default function ActualizarPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 bg-grain px-6 py-16">
      <Link
        href="/"
        className="rounded-sm font-display text-2xl font-bold tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        TEAM 100%<span className="text-gold-400"> REAL ESTATE</span>
        <span className="text-gold-400"> •</span>
      </Link>

      <div className="mt-10 w-full max-w-sm">
        <h1 className="text-center font-display text-[42px] font-bold leading-tight text-white">
          Nueva contraseña
        </h1>
        <p className="mt-2 text-center text-lg text-mist-400">
          Elige una contraseña nueva para tu cuenta.
        </p>

        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12">
          <ActualizarPasswordForm />
        </div>
      </div>
    </main>
  );
}
