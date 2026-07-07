# Rediseño de Login — Dark Premium SaaS

## Objetivo

Rediseñar `app/(public)/login` para que se sienta como una continuación natural de la landing page (dark premium, minimalista, corporativo), compitiendo visualmente con Linear/Vercel/Stripe/Clerk. Layout de dos columnas en desktop (branding + formulario), una sola columna en móvil.

## Decisiones confirmadas

- **Dependencias nuevas:** instalar `framer-motion` y `lucide-react`.
- **Paleta:** reutilizar los tokens Tailwind existentes (`ink`, `gold`, `mist` en `tailwind.config.ts`), no crear tokens nuevos. Los hex pedidos por el usuario son casi idénticos a los existentes.
- **Social login:** Google funcional (ya implementado en `actions.ts` vía `loginConGoogle`). Microsoft y GitHub se muestran como botones deshabilitados con badge "Próximamente" — no están configurados como providers en Supabase.
- **Recordarme / recuperar contraseña:** solo alcance visual por ahora.
  - "Recordarme": checkbox controlado por `useState` local, sin efecto en la persistencia real de sesión.
  - "¿Olvidaste tu contraseña?": enlaza a una página nueva `/recuperar-password` con un formulario simple (email + mensaje de confirmación estático), sin lógica de reseteo (`resetPasswordForEmail`) todavía.

## Arquitectura de archivos

```
app/(public)/login/
  page.tsx              (modificado) — layout de dos columnas
  LoginBranding.tsx      (nuevo) — panel izquierdo, Server Component, solo visual
  LoginForm.tsx          (reescrito) — formulario con Framer Motion + Lucide
  actions.ts             (sin cambios)

app/(public)/recuperar-password/
  page.tsx               (nuevo)
  RecuperarPasswordForm.tsx (nuevo)

tailwind.config.ts        (sin cambios de color)
package.json              (+ framer-motion, + lucide-react)
```

## `LoginBranding.tsx` (panel izquierdo, 55%)

- Server Component, sin interactividad.
- Fondo `ink-950` con SVG decorativo propio (líneas diagonales sutiles + partículas doradas), en el mismo lenguaje visual que `HeroBackground.tsx` pero compuesto verticalmente para un panel angosto.
- Degradado radial oscuro superpuesto para dar profundidad sin distraer.
- Contenido:
  - Logo/wordmark "COACHPRO •" (reutilizando el estilo del logo de la landing).
  - Mensaje inspirador sobre liderazgo (headline grande, `font-display`).
  - Descripción breve del producto (1-2 líneas, `text-mist-400`).
- Oculto en móvil (`hidden lg:flex`).
- No debe parecer ilustración infantil — solo geometría/líneas/partículas, tono ejecutivo.

## `LoginForm.tsx` (panel derecho, 45%)

### Estructura

1. Logo (arriba del card, con espacio generoso).
2. Encabezado: "Bienvenido de nuevo" (título) / "Inicia sesión para continuar tu proceso de aprendizaje." (subtítulo).
3. Card (`bg-white/[0.03]`, `border-white/10`, `rounded-2xl`, padding generoso) conteniendo:
   - Input Correo electrónico (icono `Mail` de lucide-react).
   - Input Contraseña (icono `Lock`, botón mostrar/ocultar con `Eye`/`EyeOff`).
   - Fila: checkbox "Recordarme" + link "¿Olvidaste tu contraseña?" → `/recuperar-password`.
   - Botón principal "Iniciar sesión" (estado loading: `Loader2` girando + "Iniciando sesión...", disabled).
   - Separador "──────── o continúa con ────────".
   - Fila de 3 botones sociales: Google (funcional), Microsoft (disabled + badge), GitHub (disabled + badge).
4. Texto inferior: "¿No tienes una cuenta? Crear cuenta" → `/registro`.

### Validación y estados de error

- Validación en cliente (campo requerido, formato de email) — error se muestra debajo del input correspondiente, con `aria-invalid` y `aria-describedby` apuntando al mensaje.
- Error de servidor (credenciales inválidas, viene de `LoginState.error`) se muestra como mensaje general sobre el botón de submit — sin indicar cuál campo falló específicamente (buena práctica de seguridad), con `role="alert"`.
- Nunca usar `alert()` nativo.

### Interacción y animación (Framer Motion)

- Fade-in inicial del card y del panel de branding al montar.
- Inputs: glow de foco (`ring` dorado) con transición 150–300ms.
- Botón principal: `whileHover={{ y: -2 }}` + sombra sutil; estado loading deshabilita el botón.
- Links: transición de color suave en hover.
- Respeta `prefers-reduced-motion` (ya manejado globalmente en `globals.css`).

### Accesibilidad

- Labels visibles para todos los campos.
- Navegación completa por teclado, foco visible (`focus-visible:ring-2 ring-gold-500/60`).
- Contraste AA con la paleta existente (ya validado en el resto del sitio).
- Mensajes de error asociados a su input vía `aria-describedby`.

## `/recuperar-password` (nuevo, stub)

- Misma identidad visual que login (card centrado, sin dos columnas — no es prioritario tener branding panel aquí).
- Formulario: input de email + botón "Enviar instrucciones".
- Al enviar (client-side, sin acción de servidor real todavía): muestra mensaje de confirmación genérico ("Si el correo existe, enviaremos instrucciones.").
- Nota en el código (comentario corto) indicando que la integración real con `supabase.auth.resetPasswordForEmail` queda pendiente para un siguiente alcance.

## Fuera de alcance

- OAuth real de Microsoft/GitHub (requiere configurar providers en Supabase).
- Lógica funcional de "recordarme" sobre persistencia de sesión de Supabase.
- Lógica real de envío de correo de recuperación de contraseña.
- Cambios de paleta/tokens en `tailwind.config.ts`.

## Testing

- Actualizar `LoginForm.test.tsx` para cubrir: render de nuevos campos (checkbox, link recuperar), validación de cliente (email vacío/formato inválido, password vacío), estado disabled/loading del botón durante submit, botones sociales deshabilitados no disparan acción.
- Nuevo test básico para `RecuperarPasswordForm` (render + mensaje de confirmación tras submit).
