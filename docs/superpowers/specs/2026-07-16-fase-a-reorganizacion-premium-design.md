# Fase A — Reorganización y lenguaje de diseño premium

## Contexto

Rediseño total de las páginas de cara al estudiante, motivado por research de
sitios con estética "3D premium". Este spec es la **Fase A** de un proceso en
dos fases explícitamente acordado con el usuario:

- **Fase A (este documento):** establecer qué se reorganiza (fusiona/separa)
  y cuál es el lenguaje de diseño premium a aplicar — sin tocar código.
- **Fase B (specs futuros, uno por página o grupo de páginas):**
  reconstrucción sección por sección, cada una con su propio ciclo de
  brainstorming → spec → plan → implementación, preguntando en cada paso.

### Research realizado

Se investigaron 7 sitios (fetch de HTML estático + renderizado real con
Playwright donde hizo falta): andrewcunliffe.ai, vibemeai.net, alkares.com,
b150.ai, scheer-imc.com, **gleamer.ai** y **coach-128.webflow.io** (ver specs
previos `2026-07-14-hero-scroll-parallax-design.md` y
`2026-07-16-dashboard-stats-glow-design.md` para el detalle sitio por sitio).

**Hallazgo central, confirmado en los 7 casos:** ninguno usa 3D/WebGL real en
sus elementos "premium" salvo cuando ilustra literalmente el producto de la
empresa (alkares.com con su simulación de fluido de epoxy — caso no
transferible a una plataforma de coaching). Lo que sí se repite y es
transferible:

1. Tipografía a escala dramática (números y titulares mucho más grandes de lo
   habitual).
2. Iluminación por gradiente/glow ambiental como sustituto de profundidad 3D
   real (gleamer.ai).
3. Separadores "hairline" minimalistas y mucho espacio negativo.
4. Scroll con sensación de profundidad por capas (parallax) — ya implementado
   en el hero de la landing (`docs/superpowers/specs/2026-07-14-hero-scroll-parallax-design.md`).
5. Movimiento consistente y deliberado en toda la navegación, no esporádico
   página por página (patrón observado en los sitios de referencia, y
   contraste directo con el estado actual de este proyecto — ver más abajo).
6. Banda de texto en scroll infinito ("marquee") como separador de sección
   editorial (coach-128.webflow.io) — técnica disponible, no obligatoria.

**Decisión de dependencias (confirmada con el usuario):** no se agregan
GSAP, Lenis, Three.js ni ninguna otra librería de animación/3D. El research
mostró que el efecto "premium" de los sitios de referencia viene de
tipografía/iluminación/ritmo, no de la librería usada; sumar una segunda
librería de animación además contradice la regla ya existente en
`docs/design-system.md §10` ("No usar otra librería de animación"). Todo el
trabajo de Fase B se hace con Framer Motion (ya instalado) y CSS.

## Alcance

### Dentro del alcance (15 páginas)

| Ruta | Página |
|---|---|
| `/` | Landing pública |
| `/dashboard` | Bienvenida |
| `/sistema-100` | Sistema 100+ |
| `/clases` | Clases |
| `/curso-de-rentas` | Curso de Rentas |
| `/cursos/[cursoId]` | Detalle de curso |
| `/cursos/[cursoId]/lecciones/[leccionId]` | Reproductor de lección |
| `/crm` | CRM |
| `/aliados` | Aliados Estratégicos |
| `/proyectos-inmobiliarios-aliados` | Proyectos Inmobiliarios Aliados |
| `/calendario` | Calendario |
| `/eventos` | Eventos |
| `/herramientas` | Herramientas |
| `/soporte` | Soporte |
| `/oficinas` | Oficinas |

### Fuera de alcance (decisión explícita del usuario)

- **`/cronograma`** — es un reporte interno de avance de proyecto (tablas,
  Gantt, riesgos), no contenido de coaching. Se deja tal cual.
- **`/marketing`** — hoy es un stub ("en construcción") sin contenido real.
  Se retoma en un ciclo futuro cuando haya contenido definido.
- **Paneles `(admin)` y `(coach)`** — herramientas internas tipo CRUD, sin la
  carga de marca/marketing de las páginas de estudiante. No reciben el
  tratamiento visual premium en este proceso.
- **`/login`, `/registro`, `/recuperar-password`, `/actualizar-password`** —
  ya tienen un rediseño premium reciente (dark/gold, `ParticleField`, ver
  `docs/design-system.md`), no se tocan en este proceso.

## Decisiones de reorganización

### Taxonomía de navegación: sin cambios

Los 5 grupos de `components/estudiante/nav-config.ts` (Inicio, Formación,
Negocio, Comunidad, Soporte) quedan fijos. El trabajo de Fase B es visual y
de patrones dentro de cada página, no una reestructuración de la
información.

### CRM y Curso de Rentas: independientes, sin plantilla forzada

Ambas páginas son estructuralmente el mismo tipo de contenido (promoción de
un producto pago externo — CRM GoHighLevel y "Maestría en Rentas"
respectivamente), pero el usuario decidió explícitamente **no** unificarlas
bajo un componente de página compartido. Cada una se rediseña por separado
en su propio ciclo de Fase B, con libertad de tener personalidad visual
propia.

### Nuevo componente compartido: `HeroCard`

Hoy el patrón "card hero con icono en badge dorado + heading + body + CTA"
está reimplementado de forma independiente (código duplicado, no compartido)
en tres lugares:
- `/crm` (icono `Database`/`Sparkles`)
- `/soporte` (sección "My Assistant")
- `/herramientas` (hero de `HerramientasHub`)

Se extrae a un componente compartido (nombre de trabajo: `HeroCard`,
ubicación exacta a definir en el plan de la página que lo introduzca
primero — probablemente `components/estudiante/HeroCard.tsx` por ser
transversal a varias páginas de `(estudiante)`). Las 3 páginas migran a
usarlo en sus respectivos ciclos de Fase B. No fuerza contenido ni copy,
solo comparte la envoltura visual (badge de icono, estructura de heading/
body/CTA, espaciado).

### Movimiento: estándar obligatorio en las 15 páginas

Estado actual: 6 de 15 páginas usan animación (`/`, `/dashboard`, `/aliados`,
`/proyectos-inmobiliarios-aliados`, `/calendario`, `/herramientas`), todas
con el mismo patrón base de `lib/motion.ts`: `staggerContainer` +
`blurFadeUp` (entrada escalonada, opacidad + `y` + `blur`). Las 9 restantes
(`/sistema-100`, `/clases`, `/curso-de-rentas`, `/cursos/[cursoId]`,
`/cursos/[cursoId]/lecciones/[leccionId]`, `/crm`, `/eventos`, `/soporte`,
`/oficinas`) son hoy completamente estáticas.

**Decisión:** ese mismo patrón (`staggerContainer` + `blurFadeUp` de
`lib/motion.ts`, ya existente, sin modificar) se vuelve el estándar
obligatorio de entrada para las 15 páginas del alcance. Cada ciclo de Fase B
debe aplicarlo como mínimo — es la base no-negociable del "lenguaje de
movimiento" del sitio. Encima de esa base, cada página puede sumar (si el
contenido lo justifica) las técnicas del toolkit de abajo.

## Toolkit de técnicas visuales premium (disponibles, no obligatorias)

A aplicar donde el contenido de cada página lo justifique — decisión caso a
caso en cada ciclo de Fase B, nunca por defecto en todas las páginas:

- **Escala tipográfica dramática**: números/titulares notablemente más
  grandes que el resto del sitio, para momentos que lo ameriten (cifras,
  titulares de sección).
- **Glow/gradiente ambiental**: `radial-gradient` sutil en tonos `gold-*`
  como sustituto de profundidad 3D — ya usado en `HeroBackground.tsx` y
  `ParticleField.tsx`, extensible a cards/secciones puntuales.
- **Separadores "hairline"**: `border-t border-white/10` u opacidades
  equivalentes, en vez de separadores gruesos o iconografía.
- **Scroll parallax de profundidad**: el patrón de
  `HeroScrollLayer`/`useScroll`+`useTransform` ya implementado en el hero de
  la landing, reutilizable donde una página tenga una sección de fondo/
  protagonista que amerite ese tratamiento.
- **Marquee/ticker**: banda de texto en scroll horizontal infinito como
  separador de sección editorial (visto en coach-128.webflow.io) — técnica
  nueva para este proyecto, a evaluar puntualmente si alguna página la pide.

**Principio de contenido (agregado tras feedback del usuario en el ciclo de
Bienvenida):** evitar badges/pills decorativos con metadata de bajo valor
(duración, contadores sin función, etiquetas que no ayudan a decidir nada).
Reservar ese tipo de elemento para datos accionables (ej. el badge
"Completado" de `CursoCard`, que sí le dice algo útil al estudiante).

## Explícitamente fuera de este proceso

- Cualquier librería nueva (GSAP, Lenis, Three.js, Spline, etc.).
- Transformaciones 3D literales (`rotateX`/`rotateY`/`perspective`, tilt de
  cursor) forzadas por defecto — solo si un ciclo de Fase B específico las
  justifica y el usuario las aprueba explícitamente (mismo criterio ya usado
  al descartarlas para la sección de cifras del dashboard).
- Reestructuración de los grupos de navegación.
- `/cronograma`, `/marketing`, paneles `(admin)`/`(coach)`, páginas de auth.

## Próximos pasos

1. Usuario revisa y aprueba este spec.
2. Fase B arranca con la página que el usuario elija primero — brainstorming
   dedicado por página (o grupo pequeño de páginas relacionadas), spec
   propio, plan propio, implementación con revisión.
3. Una vez validado el lenguaje de diseño en 1-2 páginas reales de Fase B, se
   escribe la skill detallada de "premium sin WebGL forzado" que el usuario
   pidió — documentando el toolkit de arriba con ejemplos reales ya
   construidos en este proyecto, no solo teoría.
