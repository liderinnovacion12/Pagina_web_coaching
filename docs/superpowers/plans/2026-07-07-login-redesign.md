# Rediseño de Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar `app/(public)/login` como una experiencia dark premium SaaS de dos columnas (branding + formulario), consistente con la landing page, usando Framer Motion y Lucide React; añadir un stub visual de `/recuperar-password`.

**Architecture:** Se mantiene la separación Server Component (`page.tsx`) / Client Component (`LoginForm.tsx`) ya usada en el proyecto. Se añade `LoginBranding.tsx` como Client Component (necesita Framer Motion, que requiere `"use client"`) para el panel izquierdo decorativo. `actions.ts` no cambia — Google OAuth ya funciona; Microsoft/GitHub quedan como botones deshabilitados sin acción de servidor. Se reutilizan los tokens de color existentes (`ink`, `gold`, `mist`) — no se tocan `tailwind.config.ts`.

**Tech Stack:** Next.js 15 (App Router, Server Actions), React 19, Tailwind CSS 3, Vitest + Testing Library, y las nuevas dependencias `framer-motion` + `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-07-07-login-redesign-design.md`

---

### Nota de implementación (ajuste sobre la spec)

La spec original marcaba `LoginBranding.tsx` como Server Component. Framer Motion (`motion.div`) requiere un Client Component porque usa hooks internamente. Este plan lo implementa como Client Component (`"use client"`) sin datos ni fetch — sigue siendo puramente visual, solo cambia el boundary de renderizado.

---

### Task 1: Instalar dependencias

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar framer-motion y lucide-react**

Run: `npm install framer-motion lucide-react`
Expected: el comando termina sin errores y `package.json` queda con ambas entradas en `dependencies`.

- [ ] **Step 2: Verificar la instalación**

Run: `node -e "console.log(require('framer-motion/package.json').version, require('lucide-react/package.json').version)"`
Expected: imprime dos números de versión (no errores de "Cannot find module").

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: agregar framer-motion y lucide-react"
```

---

### Task 2: Crear `LoginBranding.tsx` (panel izquierdo decorativo)

**Files:**
- Create: `app/(public)/login/LoginBranding.tsx`

No lleva test: es un componente puramente presentacional (sin lógica, sin datos), igual que `HeroBackground.tsx` que tampoco tiene test en este proyecto.

- [ ] **Step 1: Crear el componente**

```tsx
"use client";

import { motion } from "framer-motion";

export function LoginBranding() {
  return (
    <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,169,78,0.08),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(217,169,78,0.05),transparent_50%)]"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 800 1200"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <path d="M-100 1100 L900 -100" className="text-mist-500/10" />
          <path d="M-100 1300 L700 -150" className="text-gold-500/25" />
          <path d="M100 1350 L900 200" className="text-mist-500/10" />
        </g>
        <circle cx="180" cy="220" r="3" className="fill-gold-400/70" />
        <circle cx="620" cy="480" r="2" className="fill-gold-400/50" />
        <circle cx="90" cy="820" r="2.5" className="fill-mist-400/40" />
        <circle cx="700" cy="960" r="3" className="fill-gold-400/60" />
      </svg>

      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 font-display text-lg font-bold tracking-tight text-white"
      >
        COACH<span className="text-gold-400">PRO</span>
        <span className="text-gold-400"> •</span>
      </motion.span>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-md"
      >
        <h2 className="font-display text-[42px] font-bold leading-[1.1] text-white">
          El liderazgo se construye,
          <br />
          no se improvisa.
        </h2>
        <p className="mt-6 text-lg text-mist-400">
          CoachPro es la plataforma de coaching ejecutivo para líderes que
          buscan resultados medibles, con acompañamiento real en cada etapa
          del camino.
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 font-mono text-xs uppercase tracking-wider text-mist-500"
      >
        Coaching Executive Platform
      </motion.p>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npm run typecheck`
Expected: sin errores relacionados a `LoginBranding.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/login/LoginBranding.tsx"
git commit -m "feat: agregar panel de branding decorativo para login"
```

---

### Task 3: Actualizar `LoginForm.test.tsx` (tests primero, deben fallar)

**Files:**
- Modify: `app/(public)/login/LoginForm.test.tsx`

- [ ] **Step 1: Reemplazar el archivo de test completo**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import * as actions from "./actions";

vi.mock("./actions", () => ({
  login: vi.fn(),
  loginConGoogle: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.mocked(actions.login).mockReset();
    vi.mocked(actions.loginConGoogle).mockReset();
  });

  it("envía el formulario con email y password válidos", async () => {
    vi.mocked(actions.login).mockResolvedValue({ error: null });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(actions.login).toHaveBeenCalled());
  });

  it("muestra errores de validación y no envía si el correo o la contraseña están vacíos", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(
      screen.getByText("Ingresa tu correo electrónico.")
    ).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu contraseña.")).toBeInTheDocument();
    expect(actions.login).not.toHaveBeenCalled();
  });

  it("muestra error de validación si el correo tiene formato inválido", () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "no-es-un-correo" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(
      screen.getByText("Ingresa un correo electrónico válido.")
    ).toBeInTheDocument();
    expect(actions.login).not.toHaveBeenCalled();
  });

  it("muestra el error devuelto por la acción", async () => {
    vi.mocked(actions.login).mockResolvedValue({
      error: "Correo o contraseña incorrectos.",
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(
      await screen.findByText("Correo o contraseña incorrectos.")
    ).toBeInTheDocument();
  });

  it("llama a loginConGoogle al hacer clic en el botón de Google", () => {
    render(<LoginForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /continuar con google/i })
    );

    expect(actions.loginConGoogle).toHaveBeenCalled();
  });

  it("los botones de Microsoft y GitHub están deshabilitados", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("button", { name: /microsoft/i })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /github/i })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test`
Expected: FAIL — `LoginForm.test.tsx` falla porque `LoginForm.tsx` todavía usa los labels y textos antiguos ("Correo", "Ingresar", sin checkbox ni botones de Microsoft/GitHub).

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/login/LoginForm.test.tsx"
git commit -m "test: actualizar expectativas de LoginForm para el rediseño"
```

---

### Task 4: Reescribir `LoginForm.tsx`

**Files:**
- Modify: `app/(public)/login/LoginForm.tsx`

- [ ] **Step 1: Reemplazar el archivo completo**

```tsx
"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, Github } from "lucide-react";
import { login, loginConGoogle, type LoginState } from "./actions";

const estadoInicial: LoginState = { error: null };

type ErroresCampo = {
  email?: string;
  password?: string;
};

function validar(formData: FormData): ErroresCampo {
  const errores: ErroresCampo = {};
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    errores.email = "Ingresa tu correo electrónico.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errores.email = "Ingresa un correo electrónico válido.";
  }

  if (!password) {
    errores.password = "Ingresa tu contraseña.";
  }

  return errores;
}

const CAMPO_CLASES =
  "h-[52px] w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-4 text-base text-white placeholder:text-mist-500 outline-none transition duration-150 hover:border-white/20 focus:border-gold-500/60 focus:shadow-[0_0_0_4px_rgba(217,169,78,0.12)]";

const CAMPO_CLASES_ERROR = "border-rose-500/60 focus:border-rose-500/60";

export function LoginForm() {
  const [estado, formAction, pendiente] = useActionState(login, estadoInicial);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [erroresCampo, setErroresCampo] = useState<ErroresCampo>({});

  function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    const formData = new FormData(evento.currentTarget);
    const errores = validar(formData);
    setErroresCampo(errores);

    if (errores.email || errores.password) {
      evento.preventDefault();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col gap-8"
    >
      <form
        onSubmit={manejarSubmit}
        action={formAction}
        noValidate
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-mist-300">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              aria-invalid={Boolean(erroresCampo.email)}
              aria-describedby={erroresCampo.email ? "email-error" : undefined}
              className={`${CAMPO_CLASES} ${erroresCampo.email ? CAMPO_CLASES_ERROR : ""}`}
            />
          </div>
          {erroresCampo.email && (
            <p id="email-error" role="alert" className="text-sm text-rose-400">
              {erroresCampo.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-mist-300">
            Contraseña
          </label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
            />
            <input
              id="password"
              name="password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(erroresCampo.password)}
              aria-describedby={
                erroresCampo.password ? "password-error" : undefined
              }
              className={`${CAMPO_CLASES} pr-11 ${
                erroresCampo.password ? CAMPO_CLASES_ERROR : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((valor) => !valor)}
              aria-label={
                mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-4 text-mist-500 transition hover:text-mist-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
            >
              {mostrarPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {erroresCampo.password && (
            <p id="password-error" role="alert" className="text-sm text-rose-400">
              {erroresCampo.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-mist-400">
            <input
              type="checkbox"
              name="recordarme"
              className="h-4 w-4 rounded border-white/20 bg-ink-950 text-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
            />
            Recordarme
          </label>
          <Link
            href="/recuperar-password"
            className="text-sm font-medium text-gold-300 transition duration-150 hover:text-gold-200"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {estado.error && (
          <p role="alert" className="text-sm text-rose-400">
            {estado.error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={pendiente}
          whileHover={pendiente ? undefined : { y: -2 }}
          transition={{ duration: 0.15 }}
          className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendiente && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {pendiente ? "Iniciando sesión..." : "Iniciar sesión"}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 text-xs text-mist-500">
        <span className="h-px flex-1 bg-white/10" />
        o continúa con
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <form action={loginConGoogle}>
          <SocialButton label="Google" icon={<GoogleIcon />} />
        </form>
        <SocialButtonDisabled label="Microsoft" icon={<MicrosoftIcon />} />
        <SocialButtonDisabled
          label="GitHub"
          icon={<Github className="h-4 w-4" />}
        />
      </div>
    </motion.div>
  );
}

function SocialButton({ label, icon }: { label: string; icon: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`Continuar con ${label}`}
      title={`Continuar con ${label}`}
      className="flex h-[52px] w-full items-center justify-center rounded-xl border border-white/10 text-mist-300 transition duration-150 hover:border-gold-500/60 hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
    </button>
  );
}

function SocialButtonDisabled({
  label,
  icon,
}: {
  label: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled
      aria-label={`${label} — próximamente`}
      title={`${label} — próximamente`}
      className="flex h-[52px] w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 text-mist-500 opacity-50"
    >
      {icon}
    </button>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <rect x="1" y="1" width="10" height="10" />
      <rect x="13" y="1" width="10" height="10" />
      <rect x="1" y="13" width="10" height="10" />
      <rect x="13" y="13" width="10" height="10" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.54-5.17 3.54-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-2.98c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.08C3.26 21.3 7.29 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.34c-.24-.72-.38-1.49-.38-2.34s.14-1.62.38-2.34V6.58H1.3A11.98 11.98 0 000 12c0 1.93.46 3.76 1.3 5.42l4.01-3.08z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.29 0 3.26 2.7 1.3 6.58l4.01 3.08c.94-2.82 3.58-4.91 6.69-4.91z"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Ejecutar los tests y verificar que pasan**

Run: `npm test`
Expected: PASS — todos los tests de `LoginForm.test.tsx` en verde.

- [ ] **Step 3: Verificar tipos**

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/login/LoginForm.tsx"
git commit -m "feat: rediseñar LoginForm con Framer Motion, Lucide y validación de campos"
```

---

### Task 5: Reescribir `page.tsx` (layout de dos columnas)

**Files:**
- Modify: `app/(public)/login/page.tsx`

No lleva test nuevo (no existe test previo para este archivo; es un Server Component de solo layout/metadata, igual que el resto de `page.tsx` en el proyecto).

- [ ] **Step 1: Reemplazar el archivo completo**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { LoginBranding } from "./LoginBranding";

export const metadata: Metadata = {
  title: "Iniciar sesión | CoachPro",
  description:
    "Accede a tu cuenta de CoachPro para continuar tu formación en coaching ejecutivo.",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-ink-950 lg:grid-cols-[55fr_45fr]">
      <LoginBranding />

      <div className="flex flex-col items-center justify-center bg-grain px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="flex justify-center rounded-sm font-display text-2xl font-bold tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            COACH<span className="text-gold-400">PRO</span>
            <span className="text-gold-400"> •</span>
          </Link>

          <div className="mt-10 text-center">
            <h1 className="font-display text-[42px] font-bold leading-tight text-white">
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-lg text-mist-400">
              Inicia sesión para continuar tu proceso de aprendizaje.
            </p>
          </div>

          <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
            <LoginForm />
          </div>

          <p className="mt-8 text-center text-sm text-mist-400">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/registro"
              className="rounded-sm font-medium text-gold-300 transition duration-150 hover:text-gold-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verificar tipos y ejecutar la suite completa**

Run: `npm run typecheck && npm test`
Expected: sin errores; todos los tests existentes siguen en verde (nada en `LoginForm.test.tsx` depende de `page.tsx`).

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/login/page.tsx"
git commit -m "feat: layout de dos columnas para la página de login"
```

---

### Task 6: Crear `RecuperarPasswordForm.test.tsx` (tests primero, deben fallar)

**Files:**
- Create: `app/(public)/recuperar-password/RecuperarPasswordForm.test.tsx`

- [ ] **Step 1: Crear el archivo de test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecuperarPasswordForm } from "./RecuperarPasswordForm";

describe("RecuperarPasswordForm", () => {
  it("muestra un error si el correo es inválido", () => {
    render(<RecuperarPasswordForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "no-es-un-correo" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    );

    expect(
      screen.getByText("Ingresa un correo electrónico válido.")
    ).toBeInTheDocument();
  });

  it("muestra el mensaje de confirmación tras enviar un correo válido", () => {
    render(<RecuperarPasswordForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    );

    expect(screen.getByText(/recibirás instrucciones/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test`
Expected: FAIL — `Cannot find module './RecuperarPasswordForm'` (el componente aún no existe).

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/recuperar-password/RecuperarPasswordForm.test.tsx"
git commit -m "test: agregar tests de RecuperarPasswordForm"
```

---

### Task 7: Implementar `RecuperarPasswordForm.tsx`

**Files:**
- Create: `app/(public)/recuperar-password/RecuperarPasswordForm.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";

export function RecuperarPasswordForm() {
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pendiente: conectar con supabase.auth.resetPasswordForEmail en un siguiente alcance.
  function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData(evento.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setError(null);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <p role="status" className="text-center text-mist-300">
        Si el correo existe en nuestro sistema, recibirás instrucciones para
        restablecer tu contraseña.
      </p>
    );
  }

  return (
    <form onSubmit={manejarSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-mist-300">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "email-error" : undefined}
            className="h-[52px] w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-4 text-base text-white placeholder:text-mist-500 outline-none transition duration-150 hover:border-white/20 focus:border-gold-500/60 focus:shadow-[0_0_0_4px_rgba(217,169,78,0.12)]"
          />
        </div>
        {error && (
          <p id="email-error" role="alert" className="text-sm text-rose-400">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="h-[52px] rounded-xl bg-gold-500 font-semibold text-ink-950 transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
      >
        Enviar instrucciones
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Ejecutar los tests y verificar que pasan**

Run: `npm test`
Expected: PASS — `RecuperarPasswordForm.test.tsx` en verde.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/recuperar-password/RecuperarPasswordForm.tsx"
git commit -m "feat: implementar RecuperarPasswordForm"
```

---

### Task 8: Crear la página `/recuperar-password`

**Files:**
- Create: `app/(public)/recuperar-password/page.tsx`

- [ ] **Step 1: Crear el archivo**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { RecuperarPasswordForm } from "./RecuperarPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña | CoachPro",
  description: "Recupera el acceso a tu cuenta de CoachPro.",
};

export default function RecuperarPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 bg-grain px-6 py-16">
      <Link
        href="/"
        className="rounded-sm font-display text-2xl font-bold tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        COACH<span className="text-gold-400">PRO</span>
        <span className="text-gold-400"> •</span>
      </Link>

      <div className="mt-10 w-full max-w-sm">
        <h1 className="text-center font-display text-[42px] font-bold leading-tight text-white">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-center text-lg text-mist-400">
          Te enviaremos instrucciones para restablecer tu contraseña.
        </p>

        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12">
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
```

- [ ] **Step 2: Verificar tipos**

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/recuperar-password/page.tsx"
git commit -m "feat: agregar página de recuperar contraseña"
```

---

### Task 9: Verificación final

**Files:** ninguno (solo validación)

- [ ] **Step 1: Ejecutar la suite completa de tests**

Run: `npm test`
Expected: PASS — todos los tests del proyecto en verde, incluyendo `actions.test.ts`, `LoginForm.test.tsx`, `RecuperarPasswordForm.test.tsx` y el resto de tests existentes.

- [ ] **Step 2: Verificar tipos en todo el proyecto**

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 3: Ejecutar el lint**

Run: `npm run lint`
Expected: sin errores (warnings existentes previos al cambio, si los hay, se pueden ignorar).

- [ ] **Step 4: Build de producción**

Run: `npm run build`
Expected: build exitoso, sin errores de Next.js/TypeScript.

- [ ] **Step 5: Verificación visual manual**

Run: `npm run dev`
Abrir `http://localhost:3000/login` en el navegador y confirmar:
- Desktop (>1024px): layout de dos columnas, panel de branding a la izquierda con líneas/partículas doradas, formulario centrado a la derecha.
- Mobile (<1024px): panel de branding oculto, todo centrado con padding lateral.
- Foco en inputs muestra glow dorado.
- Enviar el formulario vacío muestra errores debajo de cada campo.
- Botones de Microsoft y GitHub aparecen deshabilitados con opacidad reducida.
- Link "¿Olvidaste tu contraseña?" navega a `/recuperar-password` y el formulario stub funciona (mensaje de confirmación tras enviar un correo válido).

No es necesario commitear nada en este paso — es solo verificación.
