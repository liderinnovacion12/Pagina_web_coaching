# Bienvenida — nueva página en `/dashboard`

> Reemplaza el dashboard actual de estudiante ("Bienvenido de nuevo", stats de XP/insignias/cursos/membresía) por una página de bienvenida/onboarding única para todos los usuarios del rol `estudiante`, inspirada en la plataforma de referencia `teamwilmarsosa.samueloropeza.com` (ver `docs/descripcion-paginas.md`). No aplica a `coach`/`admin` en esta fase — esos roles no tienen shell de navegación propio todavía.

## 1. Alcance

Archivos nuevos o modificados:

| Archivo | Cambio |
|---|---|
| `app/(estudiante)/dashboard/page.tsx` | Reescritura completa: nuevo contenido de bienvenida, sin queries a base de datos |
| `app/(estudiante)/dashboard/page.test.tsx` | Reescritura completa para el nuevo contenido |
| `lib/db/dashboard.ts` | Eliminado (solo lo usaba el dashboard viejo) |
| `lib/db/dashboard.test.ts` | Eliminado |
| `app/(estudiante)/herramientas/page.tsx` | Nuevo — stub "en construcción" |
| `app/(estudiante)/calendario/page.tsx` | Nuevo — stub "en construcción" |
| `app/(estudiante)/marketing/page.tsx` | Nuevo — stub "en construcción" |
| `app/(estudiante)/soporte/page.tsx` | Nuevo — stub "en construcción" |
| `components/estudiante/nav-config.ts` | Actualiza `href: null → ruta real` en Calendario, Herramientas, Marketing, Soporte |
| `tailwind.config.ts` | Añade token de color `whatsapp` |
| `docs/design-system.md` | Documenta la excepción del verde WhatsApp |

Confirmado con el usuario: el contenido de stats/XP se **reemplaza por completo**, no convive con el nuevo contenido.

## 2. Contenido de `/dashboard`

Server component (sin `"use client"`, sin queries — contenido estático). La ruta ya está protegida por `requireRol("estudiante")` en `app/(estudiante)/layout.tsx`; no se agrega personalización por nombre de usuario en esta fase.

Orden de secciones, de arriba a abajo:

### 2.1 Encabezado
```tsx
<h1 className="font-display text-[42px] font-bold leading-tight text-white">
  Bienvenido a Team 100% Real Estate
</h1>
<p className="mt-2 text-lg text-mist-400">by Wilmar Sosa y Samuel Oropeza</p>
```

### 2.2 Video de bienvenida
Tarjeta **blanca** (`bg-white`, `rounded-[20px]`, `p-4` o `p-6`) — excepción intencional y documentada al fondo oscuro estándar, porque envuelve un iframe con chrome propio (miniatura de Loom) que no se ve bien sobre `ink-950`.

```tsx
<div className="rounded-[20px] bg-white p-4 sm:p-6">
  <div className="flex items-center justify-between px-1 pb-3">
    <p className="font-mono text-xs uppercase tracking-wider text-ink-950/60">
      Video de bienvenida
    </p>
    <span className="text-xs font-medium text-ink-950/60">4 min</span>
  </div>
  <div className="aspect-video overflow-hidden rounded-xl">
    <iframe
      src="https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1"
      title="Video de bienvenida — Team 100% Real Estate"
      allow="fullscreen"
      allowFullScreen
      className="h-full w-full"
    />
  </div>
</div>
```

### 2.3 "Conéctate con el equipo"
Tarjeta oscura estándar (`rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-8`):

- Kicker: `font-mono text-xs uppercase tracking-wider text-mist-500` → "Conéctate con el equipo".
- Texto invitando a unirse a los grupos y comunidades de WhatsApp (copy breve, tono cercano-profesional, 1-2 frases).
- Botón verde:
```tsx
<Link
  href="/herramientas"
  className="mt-5 inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 font-semibold text-white transition hover:bg-whatsapp-dark"
>
  <MessageCircle className="h-4 w-4" aria-hidden="true" />
  Únete a los Grupos y Comunidades de WhatsApp
</Link>
```
El botón navega internamente a `/herramientas` (decisión del usuario) — no es un enlace externo `wa.me` ni un link firmado; no existe ese mecanismo en el repo y no se construye en esta fase.

### 2.4 Grid de 2 columnas: "Cómo Usar la Plataforma" + "Accesos Rápidos"

`<div className="grid gap-4 sm:grid-cols-2">`, cada una con el patrón `rounded-xl border border-white/[0.08] bg-white/[0.03] p-6`.

**Cómo Usar la Plataforma** — lista numerada de 4 pasos (círculo `bg-gold-500/10 text-gold-300` con el número, texto `text-mist-300`):
1. Usa el menú lateral para navegar entre módulos.
2. Revisa el calendario de clases y eventos.
3. Descarga los recursos disponibles.
4. Contacta a soporte si tienes dudas.

**Accesos Rápidos** — 4 filas, cada una `Link` con label + ícono `ArrowRight` (lucide) alineado a la derecha, `hover:border-gold-500/40` en el contenedor si se agrupan en su propia tarjeta, o simplemente `hover:text-gold-300` en el texto:

| Label | href |
|---|---|
| Grupos de WhatsApp | `/herramientas` |
| Calendario de Clases | `/calendario` |
| Recursos de Ventas | `/marketing` |
| Soporte | `/soporte` |

## 3. Páginas stub nuevas

Mismo patrón que `app/(coach)/coach/page.tsx` (`<h1>Panel de coach (en construcción)</h1>`), heredando el layout de `app/(estudiante)/layout.tsx` (ya incluye `EstudianteShell`). Cada una:

```tsx
export default function HerramientasPage() {
  return (
    <div>
      <h1 className="font-display text-[42px] font-bold leading-tight text-white">
        Herramientas y Comunicación
      </h1>
      <p className="mt-2 text-lg text-mist-400">
        Directorio de grupos y comunidades — en construcción.
      </p>
    </div>
  );
}
```

Títulos por página: "Herramientas y Comunicación" (`/herramientas`), "Calendario de Clases" (`/calendario`), "Recursos de Ventas y Marketing" (`/marketing`), "Soporte, Ayuda y Contactos" (`/soporte`). Sin tests — mismo criterio que el stub de coach, que tampoco tiene test.

## 4. `nav-config.ts`

Cambiar de `href: null` a la ruta real en estos 4 ítems (quedan navegables, dejan de mostrar el badge "Próximamente"):

- Grupo "Comunidad" → `Calendario`: `href: "/calendario"`
- Grupo "Comunidad" → `Herramientas`: `href: "/herramientas"`
- Grupo "Negocio" → `Marketing`: `href: "/marketing"`
- Grupo "Soporte" → `Soporte`: `href: "/soporte"`

El resto de ítems (`Curso de Rentas`, `Acelerador Pro/Starter`, `Proyectos Inmobiliarios Aliados`, `Aliados Estratégicos`, `Transacciones`, `CRM`, `Eventos`, `Construcción de Equipo`, `Oficinas`) quedan sin cambios (`href: null`, "Próximamente").

## 5. Token de color `whatsapp`

`docs/design-system.md` es explícito: "No crear colores nuevos — reutilizar estas escalas." El botón de WhatsApp es una excepción deliberada (reconocimiento de marca de un canal externo, no parte de la identidad visual del producto), así que se documenta en vez de improvisarse inline:

- `tailwind.config.ts`: añadir `whatsapp: { DEFAULT: "#25D366", dark: "#1EBE5D" }` a `theme.extend.colors`.
- `docs/design-system.md`, sección 2 (paleta): agregar una fila a la tabla marcada explícitamente como "excepción — solo botón de WhatsApp en `/dashboard`", para que futuras ediciones no lo confundan con un color de marca general ni lo reutilicen en otro contexto.

## 6. Testing

`app/(estudiante)/dashboard/page.test.tsx` (reescrito, sin mocks de sesión/DB ya que la página es estática):

- Renderiza el H1 "Bienvenido a Team 100% Real Estate" y el subtítulo "by Wilmar Sosa y Samuel Oropeza".
- El iframe de Loom tiene el `src` esperado.
- El botón verde de WhatsApp es un link con `href="/herramientas"`.
- Los 4 accesos rápidos apuntan a `/herramientas`, `/calendario`, `/marketing`, `/soporte`.
- La guía "Cómo Usar la Plataforma" muestra los 4 pasos.

No se agregan tests para los 4 stubs nuevos ni para el cambio de `nav-config.ts` (dato estático, sin lógica) — consistente con el resto del código base.

## 7. Fuera de alcance (explícito)

- Cualquier mecanismo de enlace firmado/token de sesión hacia WhatsApp — no existe en el repo y no se construye aquí; el botón enlaza a la ruta interna `/herramientas`.
- Contenido real de las 4 páginas stub (directorio de grupos, calendario real, recursos de marketing, soporte) — quedan como "en construcción", su implementación es trabajo futuro.
- Aplicar esta página o un shell equivalente a los roles `coach`/`admin` — piden shell de navegación propio, que no existe hoy y es un proyecto aparte.
- Personalización de la bienvenida por nombre de usuario o rol.
