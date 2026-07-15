# Curso de Rentas — Diseño

**Fecha:** 2026-07-15
**Nav item:** "Curso de Rentas" (`components/estudiante/nav-config.ts`, grupo "Formación", `href: null` actualmente → `/curso-de-rentas`)

## 1. Contexto y alcance

A diferencia de los módulos anteriores ("Proyectos Inmobiliarios Aliados", "Aliados Estratégicos" — ambos catálogos de múltiples ítems con tabla en base de datos y CRUD admin), este módulo es una **única página promocional estática** para un curso externo ("Maestría en Rentas", de Wilmar), con un beneficio exclusivo (50% de descuento con código) para agentes del Team 100% Real Estate, y un botón que redirige a la plataforma externa de inscripción.

Decisión explícita del usuario: **sin tabla en base de datos, sin CRUD admin**. El contenido (texto, imagen, link, código de descuento) vive hardcodeado en el componente. Si en el futuro cambia el descuento o el link, se edita el código — no vale la pena construir infraestructura de edición para un solo curso externo con contenido que cambia con poca frecuencia.

**Fuera de alcance:** no hay tabla, no hay RLS, no hay página `/admin/curso-de-rentas`, no hay tests de capa de datos (no existe capa de datos).

## 2. Ruta y estructura de archivos

- Página: `app/(estudiante)/curso-de-rentas/page.tsx` — server component, contenido estático (no necesita `async`, no consulta Supabase).
- Test: `app/(estudiante)/curso-de-rentas/page.test.tsx` — render simple con Testing Library.
- No se crean componentes nuevos en `components/` — es contenido fijo, no una lista repetible, así que no amerita extraer sub-componentes.

Nav: `components/estudiante/nav-config.ts` cambia `{ label: "Curso de Rentas", href: null }` a `{ label: "Curso de Rentas", href: "/curso-de-rentas" }`, y `components/estudiante/nav-config.test.ts` se actualiza en el mismo commit (mismo cuidado que en el módulo anterior, para no repetir la regresión de un `href` activado sin actualizar su test).

## 3. Contenido (texto real, verbatim del sitio de referencia)

- **Título:** "Maestría en Rentas"
- **Subtítulo:** "Domina el arte de las rentas inmobiliarias con nuestro programa completo"
- **Caja de beneficio:**
  - "Beneficio exclusivo para los agentes que hacen parte de este Team 100% Real Estate:"
  - "Disfruta de un **50% de descuento** en tu inscripción."
  - "Dirígete al enlace, realiza tu inscripción y no olvides ingresar el código **TEAM100REAL** antes de pagar."
- **Imagen banner:** `https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/rentas/maestria-rentas-banner-CPOeJvYN.png` (imagen estática ya subida a Supabase Storage — no es un video embebido real, es una miniatura con apariencia de reproductor).
- **Párrafo descriptivo:** "Aprende a generar ingresos con propiedades de renta. Con estrategias probadas para el mercado inmobiliario, acceso a material exclusivo y una guía paso a paso desde cero hasta tu primera renta."
- **Tarjeta "¿Qué incluye la Maestría en Rentas?"**
  - Copy introductorio: "Todo lo que necesitas para dominar las rentas y construir un ingreso constante como agente inmobiliario."
  - 6 ítems (lead-in en negrita + detalle, tal como en la referencia, sin ✅):
    1. **Módulos en video:** Clases paso a paso disponibles 24/7.
    2. **Guiones y plantillas:** Scripts de llamadas, emails y tableros de gestión.
    3. **Sesiones de reuniones en vivo grupales.** (también encuentras las grabaciones en caso de no poder asistir.)
    4. **Comunidad privada de WhatsApp:** Soporte y networking con otros agentes.
    5. **Bonus** de charlas con Expertos.
    6. **Plan de 30 días:** Guía clara para activar tu "salario inmobiliario".
  - Línea de cierre en negrita (sin 🚀): "Todo esto en una sola plataforma y podrás disfrutar el curso de por vida."
- **CTA final:** botón "Inscríbete ahora" (sin ícono de gorro), `href="https://www.aprendeconwilmar.com/maestriaenrentas/pdp"`, `target="_blank" rel="noopener noreferrer"`.

**Regla de "sin iconos":** ningún `lucide-react` ni emoji en ningún punto de la página (ni en el checklist, ni en el CTA, ni en el cierre). La referencia usa ✅/📅/🎓/🚀 — todos se omiten. La jerarquía visual se logra con tipografía (negrita, tamaño, color gold) y con el patrón ya existente en `DashboardContent.tsx` de un borde izquierdo dorado (`border-l-2 border-gold-500/60`) para destacar bloques, en vez de un ícono de checkmark por ítem.

## 4. Diseño visual

Reutiliza tokens y patrones ya establecidos en `docs/design-system.md` y `DashboardContent.tsx` — paleta `ink`/`gold`/`mist`, tarjetas `rounded-[24px]` con degradado sutil y glow de fondo, botón CTA grande con el mismo tratamiento del botón de WhatsApp (`h-[54px]`, `rounded-xl`, hover con `scale`+`shadow`) pero en dorado (`bg-gold-500` / `hover:bg-gold-400`) en vez de verde WhatsApp.

Estructura de arriba a abajo:

1. **Encabezado:** `<h1>` + subtítulo, mismo patrón tipográfico que `AliadosGrid`/páginas de catálogo (`font-display text-[42px] font-bold` + `text-lg text-mist-400`).
2. **Caja de beneficio:** tarjeta con fondo `bg-gold-500/10` y borde `border-gold-500/20`, texto del 50% de descuento en `text-gold-300` grande, y el código `TEAM100REAL` en un `<code>`/badge con fondo `bg-ink-950` y borde, para que destaque como algo "para copiar" sin ser un botón.
3. **Imagen banner:** `next/image` a ancho completo dentro de un contenedor `rounded-[24px] border border-white/[0.06] overflow-hidden` (mismo tratamiento de esquinas que las demás tarjetas grandes de la app). Como es una imagen con proporción fija (banner tipo video), se usa `width`/`height` explícitos acordes al aspect ratio real del archivo, no `fill`.
4. **Párrafo descriptivo:** texto simple `text-mist-300`, debajo del banner.
5. **Tarjeta de checklist:** `rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8` (mismo patrón que las tarjetas de "Cómo Usar la Plataforma" en `DashboardContent.tsx`), con cada ítem del checklist como un bloque `border-l-2 border-gold-500/60 pl-4` en vez de un ícono, y la línea de cierre en negrita al final de la tarjeta.
6. **CTA final:** botón grande `inline-flex` (no ancho completo), mismo tratamiento visual y de tamaño que el botón de WhatsApp de `DashboardContent.tsx` mencionado arriba (`h-[54px]`, `rounded-xl`, `inline-flex items-center justify-center gap-2.5`), dentro de su propia tarjeta o al final de la tarjeta de checklist.

No lleva animaciones de entrada tipo `staggerContainer` (a diferencia de los catálogos) — es una sola página de contenido fijo, no una lista que se beneficie de animación escalonada. Puede usar una animación de entrada simple (`blurFadeUp` en el contenedor general) si se ve bien, pero no es un requisito.

## 5. Testing

Un solo archivo de test, `app/(estudiante)/curso-de-rentas/page.test.tsx`, con Testing Library, verificando:
- El título "Maestría en Rentas" está presente.
- El mensaje del 50% de descuento y el código `TEAM100REAL` están presentes.
- Los 6 ítems del checklist están presentes (por su lead-in en negrita).
- El link del CTA (`role="link"`, nombre accesible "Inscríbete ahora") tiene `href="https://www.aprendeconwilmar.com/maestriaenrentas/pdp"` y `target="_blank"`.

No hay lógica condicional, estado, ni props — es contenido estático, así que no hace falta más cobertura que confirmar que el contenido correcto se renderiza.

## 6. Fuera de alcance / decisiones explícitas

- Sin tabla en base de datos, sin RLS, sin admin CRUD (decisión explícita del usuario).
- Sin iconos ni emojis en ningún punto de la página (decisión explícita del usuario).
- Sin video real embebido — la imagen banner ya viene con apariencia de reproductor, se trata como una imagen estática.
- Un solo botón CTA real (la caja de beneficio menciona el link en texto pero no es un botón — evita duplicar el punto de acción).
