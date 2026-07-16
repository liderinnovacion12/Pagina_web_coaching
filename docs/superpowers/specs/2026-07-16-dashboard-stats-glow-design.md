# Cifras premium en la página de bienvenida — diseño

## Contexto

Continuación del research de sitios "3D premium" (ver
`docs/superpowers/specs/2026-07-14-hero-scroll-parallax-design.md` para el
research original de andrewcunliffe.ai/alkares.com/b150.ai/vibemeai.net/
scheer-imc.com). En esta iteración se investigó además **gleamer.ai**
(renderizado real con Playwright, no solo HTML estático) para identificar
patrones aplicables a: la página de bienvenida del estudiante, la animación de
cifras, y (en iteraciones futuras, fuera de este spec) Curso de Rentas y
Aliados.

**Hallazgo clave:** ninguno de los sitios investigados usa 3D real (WebGL) en
sus secciones de cifras/estadísticas. Gleamer logra un look "premium" con:
números en escala tipográfica muy grande, un degradado/glow ambiental de
fondo (luz, no geometría), separadores "hairline" (línea de 1px muy sutil) y
mucho espacio negativo. Ese es el lenguaje que se adopta acá — explícitamente
**sin** transformaciones 3D (`rotateX`/`perspective`) en los números, porque
ni las referencias las usan realmente ni encajan con la regla existente del
proyecto de "nunca escalados/rebotes agresivos" (`docs/design-system.md §7`).

## Alcance (confirmado con el usuario)

- Solo la **página de bienvenida del estudiante**
  (`app/(estudiante)/dashboard/`). Curso de Rentas y Aliados quedan para
  specs separados posteriores — este es el primero de 4 sub-proyectos
  independientes identificados en la conversación.
- **Contenido de las cifras:** se reutilizan los mismos 3 valores que ya
  existen en la landing pública (`ESTADISTICAS` en `app/(public)/page.tsx`):
  `2,000+ Líderes`, `40+ Países`, `95% Satisfacción`. No se inventan métricas
  nuevas del dashboard.
- **Ubicación:** nueva sección insertada entre la Cabecera (sección 1) y el
  Video de inducción (sección 2) actuales de `DashboardContent.tsx`.
- **Sin nuevas dependencias**: Framer Motion únicamente (ya instalado). Sin
  WebGL, sin GSAP, sin Three.js — consistente con la decisión tomada en el
  spec del hero-scroll-parallax.
- **Sin transformaciones 3D** (`rotateX`, `perspective`, tilt de cursor) en
  los números — decisión explícita para no forzar un efecto que ni las
  referencias usan de verdad ni encaja con el tono de restraint del proyecto.

## Diseño

### 1. Extraer `AnimatedCounter` a un componente compartido

Hoy `AnimatedCounter` vive privado dentro de
`app/(public)/HeroContent.tsx:11-53`. Se extrae a
`components/motion/AnimatedCounter.tsx` (mismo comportamiento exacto: cuenta
desde 0 hasta el valor numérico extraído del string, preserva sufijos como
`+`/`%`, respeta comas de miles, usa `useReducedMotionSafe` para mostrar el
valor final sin animar si el usuario prefiere reduced motion, `duration: 1.8`
con el mismo ease-out premium `[0.16, 1, 0.3, 1]`). `HeroContent.tsx` pasa a
importarlo desde la nueva ubicación — sin cambios de comportamiento visible
en la landing.

### 2. Nuevo componente `EstadisticasGlow`

Archivo: `components/estudiante/dashboard/EstadisticasGlow.tsx` (client
component, vive junto a `DashboardContent.tsx` ya que es específico de esa
página, no un primitivo genérico de `components/motion/`).

Recibe la misma forma de datos que ya usa `HeroContent`
(`{ valor: string; etiqueta: string }[]`) — se define una constante local
`ESTADISTICAS_EQUIPO` con los mismos 3 valores de la landing (duplicados
intencionalmente, no importados desde `app/(public)/page.tsx`, para no crear
un acoplamiento entre la landing pública y el dashboard autenticado — son
árboles de rutas independientes).

Estructura visual:

```
<div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] p-8 sm:p-12">
  {/* Glow de fondo: radial-gradient dorado sutil, mismo patrón que ya usa
      HeroBackground.tsx pero contenido dentro de esta card en vez de a
      pantalla completa */}
  <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,169,78,0.10),transparent_60%)]" />

  <dl className="relative grid gap-8 sm:grid-cols-3 sm:gap-12">
    {ESTADISTICAS_EQUIPO.map((stat) => (
      <div key={stat.etiqueta} className="border-t border-white/10 pt-5">
        <dt className="sr-only">{stat.etiqueta}</dt>
        <dd className="font-mono text-5xl font-bold text-gold-400 sm:text-6xl">
          <AnimatedCounter value={stat.valor} />
        </dd>
        <p className="mt-2 text-sm text-mist-400">{stat.etiqueta}</p>
      </div>
    ))}
  </dl>
</div>
```

Notas de diseño:
- El glow (`radial-gradient` dorado, opacidad 0.10) es deliberadamente más
  sutil que el de Gleamer (que usa azul intenso a pantalla completa) porque
  acá vive dentro de una card entre otras secciones, no como fondo de hero.
- Los separadores `border-t border-white/10` reproducen el patrón "hairline"
  de Gleamer arriba de cada número.
- Tamaño de número (`text-5xl`/`text-6xl`) es mayor que cualquier texto
  existente en el dashboard — es intencional, es lo que da la sensación
  "premium" según el research (escala tipográfica dramática).
- Reutiliza tokens existentes exclusivamente: `gold-400`, `mist-400`,
  `white/[0.06]`, `white/10` — ninguna clase Tailwind sin token, respetando
  `docs/design-system.md §10`.

### 3. Integración en `DashboardContent.tsx`

Se inserta como nueva sección entre la Cabecera (línea ~101) y el Video de
inducción (línea ~104 actual), envuelta en `motion.div variants={cardVariants}`
igual que el resto de secciones de la página — se anima en el mismo stagger
de entrada al cargar, sin lógica de scroll-trigger nueva (consistente con
cómo ya se comporta toda la página).

### Accesibilidad

- `AnimatedCounter` ya maneja `prefers-reduced-motion` (muestra el valor
  final sin animar el conteo) — se hereda gratis al reutilizar el componente.
- `<dt className="sr-only">` + `<dd>` visible sigue el mismo patrón accesible
  que ya usa `HeroContent.tsx` para las estadísticas.
- El glow decorativo lleva `aria-hidden="true"`.

### Testing

- `components/motion/AnimatedCounter.test.tsx` (nuevo): mueve/adapta los
  casos de test relevantes que hoy están implícitos en
  `app/(public)/HeroContent.test.tsx` para el conteo — test directo del
  componente extraído (values con `+`, `%`, comas de miles, reduced motion).
- `app/(public)/HeroContent.test.tsx`: se actualiza el import de
  `AnimatedCounter` si el test lo referenciaba directamente (a confirmar en
  el plan — probablemente no necesita cambios si solo testea el render de
  `HeroContent`, no el counter en aislamiento).
- `components/estudiante/dashboard/EstadisticasGlow.test.tsx` (nuevo): sigue
  el patrón de `HeroBackground.test.tsx`/`HeroScrollLayer.test.tsx` — mock de
  `useReducedMotionSafe`, verifica que las 3 estadísticas se rendericen con
  sus valores y etiquetas.
- `app/(estudiante)/dashboard/page.test.tsx` (existente): puede necesitar
  ajuste si hace snapshot/orden de secciones — a confirmar en el plan.
- Verificación manual en navegador: confirmar que el conteo anima al cargar
  `/dashboard`, que el glow se ve sutil (no compite con el resto de la
  página), y que la landing pública (`/`) sigue funcionando idéntico tras la
  extracción de `AnimatedCounter`.

## Fuera de alcance

- Curso de Rentas, Aliados Estratégicos, Proyectos Inmobiliarios Aliados —
  sub-proyectos separados, specs futuros.
- Cualquier transformación 3D/perspectiva en los números.
- Nuevas métricas específicas del dashboard (se reutilizan las de la landing).
- Cambios al comportamiento o contenido de `HeroContent.tsx` más allá de
  actualizar el import de `AnimatedCounter`.
