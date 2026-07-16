# CRM para Agentes Inmobiliarios — Diseño

**Fecha:** 2026-07-16
**Nav item:** "CRM" (`components/estudiante/nav-config.ts`, grupo "Negocio", `href: null` actualmente → `/crm`)

## 1. Contexto y alcance

Igual que "Curso de Rentas" (módulo anterior, ver `docs/superpowers/specs/2026-07-15-curso-de-rentas-design.md`), esta es una **única página promocional estática** — esta vez para el CRM externo "GoHighLevel", al que los agentes del Team Wilmar & Samuel tienen acceso mediante una alianza estratégica con precio preferencial.

Decisión explícita del usuario: **sin tabla en base de datos, sin CRUD admin** (mismo motivo que Curso de Rentas — contenido de un solo servicio externo, cambia con poca frecuencia). A diferencia de Curso de Rentas, esta página **sí usa íconos de `lucide-react`** (decisión explícita del usuario esta vez — el "sin iconos" de Curso de Rentas fue una decisión puntual para esa página, no una regla general del proyecto).

**Fuera de alcance:** sin tabla, sin RLS, sin `/admin/crm`, sin tests de capa de datos.

## 2. Ruta y estructura de archivos

- Página: `app/(estudiante)/crm/page.tsx` — server component, contenido estático.
- Test: `app/(estudiante)/crm/page.test.tsx` — render simple con Testing Library.
- No se crean componentes nuevos en `components/` — mismo criterio que Curso de Rentas: contenido fijo, no amerita extracción.
- Nav: `components/estudiante/nav-config.ts` cambia `{ label: "CRM", href: null }` a `{ label: "CRM", href: "/crm" }`, con `components/estudiante/nav-config.test.ts` actualizado en el mismo commit. **Atención adicional:** el módulo anterior (Curso de Rentas) reveló que además de `nav-config.test.ts`, `components/estudiante/EstudianteShell.test.tsx` también hardcodea el label de un ítem `href: null` como ejemplo de "ítem deshabilitado" — hay que verificar si ese test usa "CRM" como su ejemplo actual y, si es así, actualizarlo también en el mismo commit que activa el nav (ver Task correspondiente en el plan).

## 3. Contenido (texto real, verbatim del sitio de referencia)

- **Título:** "CRM para Agentes Inmobiliarios"
- **Subtítulo:** "GoHighLevel – Domina el sistema para gestionar tus leads"
- **Tarjeta principal "Entrenamiento CRM – GoHighLevel":**
  - "Como agentes del Team Wilmar & Samuel, tenemos acceso al CRM GoHighLevel, gracias a una alianza estratégica diseñada para apoyar el crecimiento del equipo."
  - **Caja anidada "Conoce la plataforma GoHighLevel":** "Antes de abrir tu cuenta, recorre la plataforma y descubre todas las funcionalidades, automatizaciones y herramientas que GoHighLevel ofrece para los agentes del equipo." — botón secundario "Ver recorrido de la plataforma", `href="https://gohighlevel.samueloropeza.com/"`.
  - **Botón primario "Abrir mi cuenta de CRM"**, `href="https://gohighlevelscrm.com/crm"`.
  - Ambos enlaces abren en pestaña nueva (`target="_blank" rel="noopener noreferrer"`).
- **Tarjeta "Beneficios"** (5 ítems, cada uno con ícono `Check`):
  1. CRM con plantillas preconfiguradas
  2. Automatizaciones listas para usar
  3. Flujos diseñados para agentes inmobiliarios
  4. Grabaciones y entrenamientos semanales
  5. Soporte y acompañamiento
- **Tarjeta "Precio Exclusivo":**
  - Precio regular: "$97/mes" (tachado) + badge "Precio regular"
  - Destacado: "Precio Team Wilmar & Samuel: $77/mes"

## 4. Diseño visual

Reutiliza los mismos tokens y patrones ya establecidos (`ink`/`gold`/`mist`, tarjetas `rounded-[24px]`/`rounded-2xl` con los mismos bordes/fondos que Curso de Rentas y `DashboardContent.tsx`). A diferencia de Curso de Rentas, aquí **sí se usan íconos `lucide-react`**, todos ya presentes en el proyecto (no se introduce ninguna dependencia nueva):

- `Database` — badge de la tarjeta "Entrenamiento CRM – GoHighLevel" (mismo patrón de badge circular/cuadrado dorado que otros íconos de sección en `DashboardContent.tsx`, ej. `Lightbulb`).
- `Sparkles` — badge de la caja anidada "Conoce la plataforma" y de la tarjeta "Beneficios".
- `DollarSign` — badge de la tarjeta "Precio Exclusivo".
- `Check` — junto a cada uno de los 5 ítems de "Beneficios" (reemplaza el bullet).
- `ExternalLink` — junto al texto del botón secundario "Ver recorrido de la plataforma" (indica que abre una página externa).

**Estructura de arriba a abajo:**

1. Encabezado: `<h1>` + subtítulo, mismo patrón tipográfico que Curso de Rentas.
2. Tarjeta principal oscura (`rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 sm:p-10`, mismo patrón que la tarjeta de "Filosofía de Equipo" en `DashboardContent.tsx`), con badge `Database` + título + párrafo.
   - Caja anidada "Conoce la plataforma" con fondo ligeramente distinto (`bg-white/[0.03]` o similar, para diferenciarla visualmente del fondo de la tarjeta padre) conteniendo su propio badge `Sparkles`, texto, y el botón secundario tipo *outline* (borde blanco/gold sutil, fondo transparente, `inline-flex` con el ícono `ExternalLink`).
   - Debajo, el botón primario grande "Abrir mi cuenta de CRM" — mismo tratamiento visual que el CTA de Curso de Rentas (`h-[54px]`, `rounded-xl`, `bg-gold-500`, hover con scale+shadow).
3. Grid de dos columnas (`sm:grid-cols-2`) con las tarjetas "Beneficios" y "Precio Exclusivo", ambas en el estilo dark/gold estándar de tarjeta (`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8`, igual que las tarjetas "Cómo Usar"/"Accesos Rápidos" de `DashboardContent.tsx`) — **no** las tarjetas claras/blancas de la referencia, para mantener consistencia con el resto de la app.
   - "Beneficios": lista de 5 ítems, cada uno con ícono `Check` (tamaño pequeño, color gold) + texto.
   - "Precio Exclusivo": precio regular tachado (`line-through text-mist-400`) + badge pequeño "Precio regular" (`rounded-full border border-white/10 px-2 py-0.5 text-xs`), y debajo una caja destacada (`rounded-xl border border-gold-500/20 bg-gold-500/10 p-4`) con "Precio Team Wilmar & Samuel" + "$77/mes" en grande y dorado.

## 5. Jerarquía de los dos CTAs

A diferencia de Curso de Rentas (un solo CTA), esta página tiene dos acciones reales distintas:
- **"Ver recorrido de la plataforma"** — botón secundario/outline, invita a explorar antes de comprometerse.
- **"Abrir mi cuenta de CRM"** — botón primario grande en dorado, la acción principal de la página.

Esta jerarquía visual (secundario → primario) refleja el flujo natural: conocer la plataforma primero, luego abrir la cuenta.

## 6. Testing

Un solo archivo de test, `app/(estudiante)/crm/page.test.tsx`, con Testing Library, verificando:
- El título "CRM para Agentes Inmobiliarios" y el subtítulo están presentes.
- El párrafo de la alianza estratégica está presente.
- Los 5 ítems de "Beneficios" están presentes.
- El precio regular "$97/mes" y el precio preferencial "$77/mes" están presentes.
- El link "Ver recorrido de la plataforma" tiene `href="https://gohighlevel.samueloropeza.com/"`, `target="_blank"` y `rel="noopener noreferrer"`.
- El link "Abrir mi cuenta de CRM" tiene `href="https://gohighlevelscrm.com/crm"`, `target="_blank"` y `rel="noopener noreferrer"`.

No hay lógica condicional, estado, ni props — contenido estático, misma cobertura mínima que Curso de Rentas.

## 7. Fuera de alcance / decisiones explícitas

- Sin tabla en base de datos, sin RLS, sin admin CRUD (decisión explícita del usuario, mismo motivo que Curso de Rentas).
- Sí se usan íconos `lucide-react` (decisión explícita del usuario, a diferencia de Curso de Rentas).
- Las tarjetas "Beneficios"/"Precio Exclusivo" se implementan en el estilo dark/gold estándar de la app, no en el estilo claro de la referencia.
- Dos CTAs con jerarquía visual distinta (secundario + primario), no del mismo peso.
