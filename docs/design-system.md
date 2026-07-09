# CoachPro — Guía de estilo (Dark Premium SaaS)

> Extraída del rediseño de `/login` y `/recuperar-password` (2026-07-07). Úsala como referencia para llevar el mismo lenguaje visual a otras páginas (ej. `/registro`, dashboard, admin).

## 1. Esencia

CoachPro se presenta como una plataforma de coaching ejecutivo seria y premium, no como una app SaaS genérica. El tono visual busca:

- **Oscuridad con propósito**: fondo casi negro (`ink-950`), no gris. Transmite exclusividad, no "modo oscuro por defecto".
- **Dorado como acento, no como color base**: el dorado (`gold-*`) se reserva para acciones primarias, énfasis tipográfico y detalles decorativos — nunca para fondos grandes.
- **Calma y precisión**: animaciones sutiles (fade + slide de ~12px, nunca rebotes ni escalados agresivos), tipografía grande y espaciada, mucho aire entre elementos.
- **Copy en español, cercano pero profesional**: "Bienvenido de nuevo", "El liderazgo se construye, no se improvisa." — frases cortas, aspiracionales, sin tecnicismos.

## 2. Paleta de colores

Definida en `tailwind.config.ts`. **No crear colores nuevos** — reutilizar estas escalas.

| Token | Hex | Uso |
|---|---|---|
| `ink-950` | `#07070b` | Fondo principal de la app (casi negro) |
| `ink-900` | `#0b0b12` | Fondos secundarios, offset de focus rings |
| `ink-800` | `#121220` | Superficies elevadas sutiles |
| `ink-700` | `#1b1b2b` | — |
| `ink-600` | `#282840` | — |
| `gold-200` | `#f6e2ae` | Texto dorado más claro (hover de links) |
| `gold-300` | `#f0d38a` | Links dorados por defecto (ej. "Crear cuenta") |
| `gold-400` | `#e8c168` | Acentos de marca ("CoachPRO"), hover de botón primario |
| `gold-500` | `#d9a94e` | Color base de botones primarios, focus rings |
| `gold-600` | `#b98a36` | — |
| `mist-300` | `#aab1c4` | Labels, texto secundario más visible |
| `mist-400` | `#8b93a7` | Párrafos secundarios, subtítulos |
| `mist-500` | `#6b7385` | Placeholders, íconos inactivos, texto terciario |
| `rose-400` / `rose-500` (Tailwind default) | — | Errores de validación exclusivamente |
| `whatsapp` / `whatsapp-dark` | `#25D366` / `#1EBE5D` | **Excepción documentada** — solo el botón "Únete a los Grupos y Comunidades de WhatsApp" en `/dashboard`. No reutilizar en otro contexto. |

Reglas de aplicación:
- Fondos: siempre `ink-950` (o `ink-900` en overlays). Nunca blanco/gris claro.
- Texto de cuerpo: `text-white` para títulos, `text-mist-300`/`text-mist-400` para el resto. Nunca `text-black`.
- Bordes: `border-white/10` (10% opacidad) como default, `hover:border-white/20`, `focus:border-gold-500/60`.
- Superficies "card": `bg-white/[0.03]` sobre `border-white/[0.08]` — nunca un color sólido plano.
- Errores: **solo** `rose-400`/`rose-500`. El dorado nunca se usa para indicar error.

## 3. Tipografía

```ts
fontFamily: {
  display: ["var(--font-display)", "sans-serif"], // títulos y marca
  sans: ["var(--font-display)", "sans-serif"],
  mono: ["var(--font-mono)", "monospace"],          // detalles tipo "kicker"
}
```

- **Marca / logo**: `font-display font-bold tracking-tight` → `COACH<span class="text-gold-400">PRO</span><span class="text-gold-400"> •</span>`. Este patrón se repite igual en cada página (login, recuperar-password) — no improvisar variantes.
- **H1 de página**: `font-display text-[42px] font-bold leading-tight text-white`.
- **Subtítulo bajo H1**: `text-lg text-mist-400`.
- **Labels de formulario**: `text-sm font-medium text-mist-300`.
- **Texto de apoyo / footer de card**: `text-sm text-mist-400`.
- **Kicker/etiqueta pequeña**: `font-mono text-xs uppercase tracking-wider text-mist-500` (ej. "Coaching Executive Platform").

## 4. Espaciado, radios y superficies

- Radio estándar de inputs y botones: `rounded-xl`.
- Radio de tarjetas grandes (contenedor del formulario): `rounded-[20px]`.
- Altura estándar de inputs/botones interactivos: `h-[52px]`.
- Tarjeta de formulario: `border border-white/[0.08] bg-white/[0.03] p-12`, opcionalmente `shadow-[0_0_40px_rgba(0,0,0,0.25)]` en páginas con más protagonismo (login) — se puede omitir en páginas más ligeras (recuperar-password).
- Ancho de columna de contenido: `w-full max-w-sm`.
- Separación vertical entre bloques de una página: `mt-10` entre logo → heading → card → link de footer.

## 5. Interacción y estados

- **Focus** (accesible, siempre visible): `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950` (o `ink-900` si el elemento vive sobre una superficie ink-900).
- **Focus de inputs de texto** (no ring, sino glow + borde): `focus:border-gold-500/60 focus:shadow-[0_0_0_4px_rgba(217,169,78,0.12)]`.
- **Hover de bordes**: `hover:border-white/20`.
- **Botón primario**: fondo `bg-gold-500`, texto `text-ink-950`, `font-semibold`, `shadow-[0_8px_24px_rgba(217,169,78,0.25)]`, `hover:bg-gold-400`. Estado disabled: `disabled:cursor-not-allowed disabled:opacity-60`.
- **Botón secundario / social**: `border border-white/10 text-mist-300`, `hover:border-gold-500/60 hover:bg-gold-500/10`.
- **Botón deshabilitado permanente** (ej. "próximamente"): `border-white/10 text-mist-500 opacity-50 cursor-not-allowed`, con `aria-label`/`title` explicando el motivo.
- **Loading**: ícono `Loader2` de `lucide-react` con `animate-spin`, reemplaza el ícono/texto normal — nunca overlay ni spinner separado.
- **Errores de campo**: texto `role="alert"` en `text-sm text-rose-400` justo debajo del input, más `aria-invalid` + `aria-describedby` en el input.

## 6. Iconografía

- Librería única: **`lucide-react`** (íconos de línea, `h-4 w-4`, color heredado vía `currentColor`/clases de texto).
- Íconos dentro de inputs: posicionados con `absolute left-4 top-1/2 -translate-y-1/2`, color `text-mist-500`, siempre `aria-hidden="true"` (el label ya da el nombre accesible).
- Íconos de marca de terceros (Google, Microsoft, GitHub) van como SVG locales a medida (no como imagen externa), `h-4 w-4`, dentro de botones cuadrados de `h-[52px]`.
- Si `lucide-react` no exporta el ícono que necesitas (ej. `Github` no existe en la versión instalada), crear un componente SVG local siguiendo el patrón de `MicrosoftIcon`/`GithubIcon` en `LoginForm.tsx` — no agregar otra librería de íconos.

## 7. Movimiento (Framer Motion)

Patrón único de entrada, reutilizado en todos los bloques de contenido:

```tsx
initial={{ opacity: 0, y: 12 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
```

- Delay escalonado entre bloques hermanos: `+0.1s`, `+0.2s` (no más de 3 elementos escalonados).
- Micro-interacción de botón primario al hover: `whileHover={{ y: -2 }}`, `transition={{ duration: 0.15 }}` — un levantamiento sutil, nunca escalado (`scale`).
- Cualquier componente que use `motion.*` debe ser Client Component (`"use client"`), aunque no tenga estado ni fetch — esto es una excepción documentada frente a componentes puramente de layout.
- Respeta `prefers-reduced-motion` (ya manejado globalmente en `app/globals.css`, no hace falta duplicarlo por componente).

## 8. Fondo decorativo (paneles de marca)

Patrón usado en `LoginBranding.tsx` para paneles hero/laterales oscuros:

- Radial gradients dorados muy sutiles como overlay: `bg-[radial-gradient(circle_at_20%_20%,rgba(217,169,78,0.08),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(217,169,78,0.05),transparent_50%)]`.
- Líneas diagonales + partículas en SVG (`stroke`/`circle`) con opacidades muy bajas (`/10`, `/25`, `/40`, `/50`, `/60`, `/70`) — el efecto debe notarse solo de cerca, nunca competir con el contenido.
- Textura de grano (`bg-grain`, definida en `globals.css` como pseudo-elemento con `feTurbulence` SVG + `mix-blend-mode: overlay`) se aplica a superficies grandes de fondo (ej. la columna del formulario), no a las tarjetas.
- Todo elemento puramente decorativo lleva `aria-hidden="true"` y `pointer-events-none`.

## 9. Estructura de página tipo

Ambas páginas nuevas siguen el mismo esqueleto:

1. `<main>` con `min-h-screen`, fondo `bg-ink-950` (+ `bg-grain` si aplica).
2. Logo/marca arriba, como `<Link href="/">` (nunca texto plano).
3. `<h1>` + subtítulo centrado o alineado según el layout.
4. Una única tarjeta (`rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12`) que envuelve el formulario — el formulario en sí no tiene fondo propio, es siempre la tarjeta quien lo da.
5. Link secundario de footer (crear cuenta / volver a login) en `text-sm text-mist-400` con el destino en `text-gold-300 hover:text-gold-200 hover:underline`.

Layout de dos columnas (ej. `/login`) solo cuando la página lo justifica (flujo principal de entrada): `grid lg:grid-cols-[55fr_45fr]` con el panel de marca (`LoginBranding`) oculto en mobile (`hidden lg:flex`) y el formulario siempre centrado y visible.

## 10. Qué NO hacer

- No usar clases genéricas de Tailwind sin tokens (`border`, `bg-slate-900`, `text-red-600`, `rounded` a secas) — esto es exactamente lo que dejó a `/registro` visualmente desalineado del resto del sitio.
- No introducir nuevos colores fuera de `ink`/`gold`/`mist` (+ `rose` solo para errores) sin actualizar `tailwind.config.ts` de forma centralizada.
- No usar otra librería de animación o de íconos.
- No aplicar sombras/bordes/radios "a ojo" — reutilizar los valores exactos de esta guía para que los componentes se vean parte del mismo sistema.
- No omitir estados de foco visibles ni `aria-*` en errores — la estética premium no debe sacrificar accesibilidad.

## 11. Archivos de referencia

- `tailwind.config.ts` — tokens de color, fuentes, animaciones.
- `app/globals.css` — reset base, `bg-grain`, `text-gradient-gold`, soporte `prefers-reduced-motion`.
- `app/(public)/login/LoginBranding.tsx` — patrón de panel decorativo con Framer Motion.
- `app/(public)/login/LoginForm.tsx` — patrón completo de formulario (inputs con ícono, validación, botones sociales, estados de carga).
- `app/(public)/login/page.tsx` — layout de dos columnas.
- `app/(public)/recuperar-password/page.tsx` y `RecuperarPasswordForm.tsx` — layout de una columna, versión más ligera de la tarjeta de formulario.
