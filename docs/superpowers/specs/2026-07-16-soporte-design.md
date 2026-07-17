# Soporte — Diseño

**Fecha:** 2026-07-16
**Ruta:** `/soporte` — **ya existe y ya tiene href activo** en `components/estudiante/nav-config.ts` (grupo "Soporte"). Este módulo reemplaza el contenido placeholder de `app/(estudiante)/soporte/page.tsx` ("Directorio de contactos y ayuda — en construcción.") por contenido real. **No hay task de activación de nav** — a diferencia de todos los módulos anteriores, esta es la única diferencia estructural real.

## 1. Contexto y alcance

La página tiene dos secciones independientes:

1. **"My Assistant"** — una única tarjeta promocional estática (sin tabla en base de datos) para un asistente de IA (GPT personalizado de ChatGPT) que el equipo usa para dudas operativas.
2. **"Contactos del Equipo"** — un catálogo de 9 contactos del equipo corporativo de My Realty (CEO, directores, coordinadores), con tabla en base de datos y CRUD admin.

## 2. Decisión de arquitectura: tabla nueva, no reutilizar `miembros_equipo`

Decisión explícita del usuario, tras evaluar la alternativa: el esquema de estos 9 contactos coincide casi exactamente con la tabla ya existente `miembros_equipo` (migración 005: `nombre`, `cargo`, `descripcion_cargo`, `telefono`, `correo`, `foto_url`, `orden`, `creado_en`), cuyo comentario original incluso anticipaba "a futuro, otros roles del equipo". Sin embargo, `miembros_equipo` hoy alimenta específicamente la sección "Team Leaders" del dashboard del estudiante (Wilmar y Samuel) — agregar estos 9 "Corporate Allies" ahí los mezclaría con ese contexto distinto, sin un campo que los distinga, y requeriría tocar la consulta del dashboard que ya está en producción.

Se crea una tabla nueva y dedicada, `contactos_soporte` — mismo patrón que cada módulo anterior de esta serie (Aliados, Eventos, Proyectos Aliados): una tabla por catálogo/feature, sin mezclar conceptos.

## 3. Modelo de datos

### Tabla `contactos_soporte`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `nombre` | text | |
| `cargo` | text | título del rol, estilo mayúsculas en inglés tal como en la referencia, ej. "DIRECTOR – EDUCATION & MENTORSHIP" o "CEO" |
| `descripcion_cargo` | text | descripción corta en español, ej. "Director ejecutivo de la empresa" |
| `telefono` | text | |
| `correo` | text | |
| `foto_url` | text | nullable — sembrado completo, las 9 fotos ya están subidas a Supabase Storage |
| `orden` | int | orden de aparición en el catálogo |
| `activo` | boolean | default true |
| `creado_en` | timestamptz | |

RLS: mismo patrón que el resto del catálogo — `select using (true)` (lectura pública), `for all using (is_admin())` (escritura solo admin).

### Contenido real (datos semilla, 9 contactos, en este orden)

1. **John Díaz** — CEO — "Director ejecutivo de la empresa" — +1 (305) 593-6361 — jdiaz@teammyrealty.com — foto: `contact-john-diaz-BpGGZ1rN.jpeg`
2. **Luis Pinto** — DIRECTOR – EDUCATION & MENTORSHIP — "Responsable de educación y mentoría para agentes" — +1 (407) 697-5905 — luisbroker@teammyrealty.com — foto: `contact-luis-pinto-BVHz9DqY.jpeg`
3. **Gabriela Guerrero** — DIRECTOR – OPERATIONS & ACCOUNTING — "Directora de operaciones y contabilidad" — +1 (786) 650-0037 — support@teammyrealty.com — foto: `contact-gabriela-guerrero-B9CDv6-Z.jpeg`
4. **Jeimmy Lema** — COMPLIANCE COORDINATOR — "Coordinadora de cumplimiento normativo" — +1 (788) 847-0332 — compliance@teammyrealty.com — foto: `contact-jeimmy-lema-DcvEASeQ.jpeg`
5. **Marcos Urbina** — DIRECTOR – EXPANSION & GROWTH — "Director de expansión y crecimiento del equipo" — +1 (321) 388-3150 — marcos@marcosurbina.com — foto: `contact-marcos-urbina-CzOhg6fK.jpeg`
6. **Pablo Correa** — DIRECTOR – TECHNOLOGY — "Director de tecnología y sistemas" — +1 (786) 433-8768 — pablocorrea@teammyrealty.com — foto: `contact-pablo-correa-Cdz7x_R2.jpeg`
7. **Andrés Díaz** — DIRECTOR – MARKETING — "Director de marketing y comunicaciones" — +1 (305) 593-6376 — marketing@teammyrealty.com — foto: `contact-andres-diaz-BxLhqRwR.jpeg`
8. **María Ramírez** — ONBOARDING COORDINATOR — "Coordinadora de integración de nuevos agentes" — +1 (305) 851-2353 — onboarding@teammyrealty.com — foto: `contact-maria-ramirez-Dtx8luz2.jpeg`
9. **Julie Meneses** — MENTORA — "Mentora del equipo" — +1 (788) 356-3277 — julieturealtor@gmail.com — foto: `contact-julie-meneses-B3vj4Qim.jpeg`

Todas las fotos están en `https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/<archivo>` (URLs completas, ya subidas).

**Sección "My Assistant"** (contenido estático, sin tabla):
- Título: "My Assistant"
- Subtítulo: "Asistente de IA de My Realty"
- Descripción: "Asistente virtual 24/7 para formatos, procesos, dudas e información operativa."
- Botón: "Empieza a usar My Assistant hoy" → `https://chatgpt.com/g/g-688ad2df1708819186005deae59fc948-myassistant`, `target="_blank" rel="noopener noreferrer"`.
- **Sin imagen de banner** (decisión explícita del usuario — se omite, no se pide una imagen nueva).

**Encabezado de página:** "Soporte, Ayuda y Contactos" / "Estamos aquí para ayudarte - Encuentra toda la información de contacto del equipo".

## 4. Diseño visual

Decisión explícita del usuario: **sin íconos** en toda la página (ni en la tarjeta de "My Assistant" ni en las tarjetas de contacto) — a diferencia de Aliados/CRM/Oficinas, sigue el mismo lenguaje minimalista de Curso de Rentas.

- **Tarjeta "My Assistant"**: mismo tratamiento de tarjeta oscura destacada que otras secciones "hero" de la app (`rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 sm:p-10`), título+subtítulo+descripción, y el botón primario dorado (mismo tratamiento que los CTAs de Curso de Rentas/CRM/Eventos) — sin ícono en el botón.
- **`ContactoSoporteCard`**: mismo lenguaje visual que `AliadoCard.tsx` (avatar circular `h-14 w-14 rounded-full`, tarjeta `rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6`) pero con dos diferencias:
  1. **Sin íconos** de teléfono/correo — los links `tel:`/`mailto:` se muestran como texto dorado clickeable simple, sin el ícono `Phone`/`Mail` que sí tiene `AliadoCard`.
  2. **Campo `cargo` nuevo**: se muestra en dorado, en mayúsculas, justo debajo del nombre (ej. "DIRECTOR – EDUCATION & MENTORSHIP"), y `descripcion_cargo` en texto normal debajo de eso, antes de los datos de contacto.
  3. Solo un contacto por tarjeta (a diferencia de Aliados, no hay caso de múltiples personas en una tarjeta) — no hace falta ninguna lógica de parseo de contactos múltiples.
- Grid de 3 columnas en pantallas grandes (`sm:grid-cols-2 lg:grid-cols-3`, dado que son 9 tarjetas — se ve mejor en 3 columnas que en 2) para las tarjetas de contacto.

## 5. Admin

`/admin/soporte` — mismo patrón de CRUD que `/admin/aliados`: lista de contactos con edición inline (toggle) y eliminación, más formulario de creación. Campos del formulario: nombre, cargo, descripción del cargo, teléfono, correo, URL de foto (opcional), orden, activo.

## 6. Testing

- `lib/db/contactos-soporte.ts`: mismo patrón de mocks de Supabase que `lib/db/aliados.ts` (get activos/todos, crear, actualizar, eliminar).
- `ContactoSoporteCard`: con foto y sin foto (fallback), presencia de `cargo`/`descripcion_cargo`, links `tel:`/`mailto:` correctos, ausencia de cualquier ícono/SVG (test explícito, mismo patrón que Curso de Rentas).
- Sección "My Assistant": título/subtítulo/descripción presentes, link del botón con `href`/`target`/`rel` correctos, ausencia de ícono/imagen.
- Página `/soporte`: integra ambas secciones con datos reales.
- Admin: CRUD de contactos, mismo patrón de tests que Aliados.

## 7. Fuera de alcance / decisiones explícitas

- Tabla nueva `contactos_soporte`, no se reutiliza `miembros_equipo` (decisión explícita del usuario, evita mezclar con el dashboard de Team Leaders).
- Con panel de administración completo (decisión explícita del usuario).
- Sin imagen de banner para "My Assistant" (decisión explícita del usuario).
- Sin íconos en toda la página (decisión explícita del usuario).
- No hay task de activación de nav — `/soporte` ya está activo, solo se reemplaza el contenido de la página.
