import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 bg-grain px-6 py-16">
      <Link
        href="/"
        className="font-display text-2xl font-bold tracking-tight text-white"
      >
        COACH<span className="text-gold-400">PRO</span>
        <span className="text-gold-400"> •</span>
      </Link>

      <div className="mt-10 w-full max-w-sm rounded-2xl border border-white/10 bg-ink-900 p-8">
        <h1 className="font-display text-2xl font-bold text-white">
          Bienvenido de vuelta
        </h1>
        <p className="mt-1 text-sm text-mist-400">Ingresa a tu cuenta</p>

        <div className="mt-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-mist-400">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-gold-300 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>

      <Link href="/" className="mt-8 text-sm text-mist-500 hover:text-mist-300">
        ← Volver al inicio
      </Link>
    </main>
  );
}
