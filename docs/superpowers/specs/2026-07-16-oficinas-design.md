# Oficinas — Diseño

**Fecha:** 2026-07-16
**Nav item:** "Oficinas" (`components/estudiante/nav-config.ts`, grupo "Soporte", `href: null` actualmente → `/oficinas`)

## 1. Contexto y alcance

A diferencia de los dos módulos anteriores (Curso de Rentas, CRM — páginas únicas estáticas), este es un **catálogo de 4 oficinas físicas** del equipo en Florida (Miami, Orlando, Tampa, West Palm Beach) — en estructura se parece más a "Aliados Estratégicos"/"Proyectos Inmobiliarios Aliados" (varios ítems con la misma forma) que a Curso de Rentas/CRM.

Decisión explícita del usuario: **sin tabla en base de datos, sin CRUD admin**, a pesar de ser un catálogo — son 4 oficinas fijas que cambian con muy poca frecuencia (abrir/cerrar una oficina es un evento raro), así que no amerita construir tabla+RLS+admin para esto. El contenido (direcciones, horarios, links de Calendly) vive hardcodeado en el componente, igual que Curso de Rentas/CRM.

**Fuera de alcance:** sin tabla, sin RLS, sin `/admin/oficinas`, sin tests de capa de datos, **sin imagen de poster con código QR** (decisión explícita del usuario — la referencia usa un poster con QR y logo de marca ajena "MY REALTY REAL ESTATE GROUP"; se omite por completo en vez de usar esas imágenes o pedir unas nuevas).

## 2. Ruta y estructura de archivos

- Página: `app/(estudiante)/oficinas/page.tsx` — server component, contenido estático.
- Test: `app/(estudiante)/oficinas/page.test.tsx` — render simple con Testing Library.
- No se crean componentes nuevos en `components/` — mismo criterio que Curso de Rentas/CRM: aunque hay 4 ítems repetidos, es contenido fijo de una sola página, no amerita extracción a un componente reutilizable en otro lugar.
- Nav: `components/estudiante/nav-config.ts` cambia `{ label: "Oficinas", href: null }` a `{ label: "Oficinas", href: "/oficinas" }`, con `components/estudiante/nav-config.test.ts` actualizado en el mismo commit. Verificar también (mismo paso de seguridad que en CRM) si `components/estudiante/EstudianteShell.test.tsx` usa "Oficinas" como su ejemplo hardcodeado de ítem deshabilitado — si es así, actualizarlo en el mismo commit.

## 3. Contenido (texto real, verbatim del sitio de referencia)

Cuatro oficinas, cada una con la misma estructura `{ ciudad, direccion, horario, urlCalendly }`:

1. **Miami** — dirección "7791 NW 46 St, Suite 417, Doral, FL 33166" — horario "Lun - Vie: 9:00 AM - 6:00 PM" — `urlCalendly`: `https://calendly.com/myrealtygroupapp/conference-room-miami?month=2026-04`
2. **Orlando** — dirección "8810 Commodity Circle #4, Orlando, FL 32819" — mismo horario — `urlCalendly`: `https://calendly.com/corporaterelations-teammyrealty/30min?month=2025-12`
3. **Tampa** — dirección "2014 Drew Street, Clearwater, FL 33765" — mismo horario — `urlCalendly`: `https://calendly.com/myrealtygroupapp/new-meeting?month=2026-04`
4. **West Palm Beach** — dirección "6685 Forest Hill Blvd, Suite 206, Greenacres, FL 33413" — mismo horario — `urlCalendly`: `https://calendly.com/myrealtygroupapp/new-meeting?month=2026-04`

**Nota sobre los labels "Tampa"/"West Palm Beach":** las direcciones reales están en Clearwater y Greenacres respectivamente (ciudades vecinas). Decisión explícita del usuario: se dejan los labels tal cual aparecen en la referencia — no se renombran a la ciudad exacta de la dirección. La dirección completa (con la ciudad real) se muestra igual, así que no hay información oculta ni incorrecta, solo un label de "área metro".

**Título de página:** "Nuestras Oficinas"
**Subtítulo:** "Ubicaciones del equipo en Florida"

**Tarjeta de reserva (idéntica para las 4 oficinas, solo cambia el link):**
- Texto: "Los agentes del equipo pueden reservar gratuitamente la sala de juntas."
- Botón: "Reservar sala de juntas" → `urlCalendly` de esa oficina, `target="_blank" rel="noopener noreferrer"`.

## 4. Mapa embebido

Decisión explícita del usuario: mapa real embebido (no solo un link "Ver en Google Maps"). Se usa el formato de embed de Google Maps sin API key:

```
https://www.google.com/maps?q=<direccion-url-encoded>&output=embed
```

La dirección se codifica con `encodeURIComponent()` en tiempo de render (no se hardcodea la URL ya codificada) — evita error de encoding manual y mantiene la dirección como única fuente de verdad.

El iframe sigue el mismo patrón ya establecido en `DashboardContent.tsx` para el video de bienvenida embebido de Loom (contenedor `aspect-video` con bordes redondeados, `title` descriptivo en el iframe para accesibilidad y para que los tests puedan ubicarlo vía `getByTitle`), adaptado a mapas: título `Mapa de la oficina de <ciudad>`.

## 5. Diseño visual

Reutiliza los tokens `ink`/`gold`/`mist` y patrones de tarjeta ya establecidos. Grid de 2 columnas (`sm:grid-cols-2`, igual que `AliadosGrid`), una tarjeta por oficina (`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6`, mismo patrón de tarjeta estándar usado en CRM/Aliados).

**Estructura de cada tarjeta, de arriba a abajo:**
1. Encabezado: ícono `MapPin` (`lucide-react`, ya usado en `components/estudiante/calendario/EventCard.tsx` para el mismo propósito — ubicación) + nombre de la ciudad (`<h2>` o `<h3>`, tamaño consistente con encabezados de tarjeta de otros módulos).
2. Mapa embebido (ver sección 4).
3. Dirección: ícono `MapPin` pequeño + texto de la dirección completa.
4. Horario: ícono `Clock` (`lucide-react`) + texto del horario.
5. Sub-tarjeta "Reserva de Sala de Juntas": ícono `Calendar` (`lucide-react`), texto descriptivo, botón "Reservar sala de juntas" (mismo tratamiento de botón primario dorado que Curso de Rentas/CRM).

**Encabezado de página:** `<h1>` "Nuestras Oficinas" + subtítulo "Ubicaciones del equipo en Florida", mismo patrón tipográfico que los módulos anteriores.

## 6. Testing

Un solo archivo de test, `app/(estudiante)/oficinas/page.test.tsx`, con Testing Library, verificando:
- El título "Nuestras Oficinas" y el subtítulo están presentes.
- Las 4 ciudades (Miami, Orlando, Tampa, West Palm Beach) están presentes.
- Las 4 direcciones completas están presentes.
- Los 4 iframes de mapa están presentes, cada uno con el `src` correcto (`https://www.google.com/maps?q=<direccion-encoded>&output=embed`) y su `title` distintivo por ciudad.
- Los 4 botones "Reservar sala de juntas" tienen el `href` de Calendly correcto para su oficina, y `target="_blank"`/`rel="noopener noreferrer"`.

No hay lógica condicional, estado, ni props — contenido estático, mismo nivel de cobertura que Curso de Rentas/CRM, con la variante de que hay 4 repeticiones de la misma estructura en vez de una sola.

## 7. Fuera de alcance / decisiones explícitas

- Sin tabla en base de datos, sin RLS, sin admin CRUD (decisión explícita del usuario).
- Sin imagen de poster con código QR (decisión explícita del usuario — se omite en vez de usar el poster de marca ajena o pedir imágenes nuevas).
- Labels "Tampa"/"West Palm Beach" se mantienen tal cual, aunque la dirección real esté en una ciudad vecina (decisión explícita del usuario).
- Mapa real embebido vía iframe de Google Maps (formato sin API key), no solo un link externo.
