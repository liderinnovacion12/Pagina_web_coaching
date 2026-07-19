# Landing pública — cifras premium, indicador de scroll y catálogo rediseñado

## Contexto

Primer ciclo de trabajo en la landing pública (`/`) desde el
`hero-scroll-parallax` original. El usuario pidió: agrandar las cifras del
Hero con animación de entrada "como aumento" (conteo — ya implementado vía
`AnimatedCounter`), un efecto 3D en las cifras, un catálogo de cursos más
llamativo con movimiento premium, y un indicador que invite a scrollear
para ver los cursos.

**Hallazgo clave (research ya documentado):** el spec cancelado
`docs/superpowers/specs/2026-07-16-dashboard-stats-glow-design.md`
investigó exactamente este tipo de tratamiento para cifras (incluyendo
renderizado real de gleamer.ai vía Playwright) y encontró que **ningún
sitio de referencia usa 3D real (`rotateX`/`perspective`) en sus
secciones de cifras** — logran el look premium con escala tipográfica
dramática, glow ambiental de fondo y separadores "hairline". Se presentó
este hallazgo al usuario, que confirmó adoptar ese lenguaje ya validado en
vez de reabrir la decisión de "sin 3D".

## Alcance

- `app/(public)/HeroContent.tsx`: restyle del grid de estadísticas
  existente (no se crea un componente nuevo) + nuevo indicador de scroll.
- `app/(public)/page.tsx`: encabezado de la sección Catálogo con
  tratamiento dramático + fondo con glow.
- `app/(public)/CatalogoList.tsx` y `app/(public)/CatalogoCursoCard.tsx`:
  grilla a 2 columnas, tarjetas más grandes, entrada lateral alternada.
- `lib/motion.ts` + `app/(estudiante)/dashboard/DashboardContent.tsx`:
  se centralizan `revealSlideLeft`/`revealSlideRight` (hoy locales en
  `DashboardContent.tsx`) para reutilizarlos en la landing sin duplicar
  código ni crear un import circular — mismo refactor ya hecho con
  `revealUp`.

## Diseño

### 1. Cifras del Hero: más grandes, con glow, sin 3D

En `HeroContent.tsx`, el `<motion.dl>` de estadísticas (línea ~119) se
restyla:

- Tamaño de número: `text-3xl` → `text-5xl sm:text-6xl`.
- Separador hairline (`border-t border-white/10 pt-5`) arriba de cada
  cifra — mismo patrón que ya diseñó el spec cancelado de
  `dashboard-stats-glow`.
- Glow radial dorado sutil detrás del bloque completo de estadísticas
  (`radial-gradient(circle_at_30%_20%,rgba(217,169,78,0.10),transparent_60%)`,
  `aria-hidden="true"`, posicionado `absolute` detrás del `<dl>`).
- `AnimatedCounter` (líneas 11-53) no cambia — sigue contando de 0 al
  valor final, con el mismo bypass de `prefers-reduced-motion`.
- Sin `rotateX`/`perspective`/tilt — decisión confirmada con el usuario.

### 2. Indicador de scroll (chevron animado)

Nuevo elemento al final de `HeroContent.tsx`, dentro del mismo
`motion.section` (después del `<motion.dl>` de estadísticas):

```tsx
<motion.a
  href="#cursos"
  variants={animVariant}
  className="mt-14 flex flex-col items-center gap-2 text-mist-500 transition-colors duration-200 hover:text-gold-300"
>
  <span className="font-mono text-xs uppercase tracking-wider">
    Descubrí nuestros cursos
  </span>
  <motion.span
    animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
  >
    <ChevronDown className="h-5 w-5" aria-hidden="true" />
  </motion.span>
</motion.a>
```

- Es un `<a>` real con el texto como nombre accesible — funciona con
  teclado/lector de pantalla, no solo un ícono decorativo.
- El rebote (`animate={{ y: [0, 8, 0] }}`) se omite por completo cuando
  `reducedMotion` es `true` (queda estático, sigue siendo un affordance
  visual válido).
- Entra con el mismo `animVariant` (`blurFadeUp`/`fadeUp` según
  reduced-motion) que el resto del contenido del Hero, dentro del
  `staggerContainer` ya existente — sin lógica de entrada nueva.
- `ChevronDown` se importa de `lucide-react` (dependencia ya instalada).

### 3. Encabezado de Catálogo: escala dramática + fondo con glow

En `app/(public)/page.tsx`, la sección `#cursos` (línea ~36) envuelve su
encabezado en `ScrollReveal` (el componente SSR-safe ya estándar en el
resto del sitio, no `whileInView` directo) y gana un fondo:

```tsx
<section id="cursos" className="relative mx-auto max-w-6xl px-6 py-20">
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_30%_20%,rgba(217,169,78,0.08),transparent_60%)]"
  />
  <ScrollReveal variants={revealUp} once={false} className="border-t border-white/10 pt-10">
    <h2 className="font-display text-4xl font-bold text-gradient-gold sm:text-5xl">
      Catálogo de cursos
    </h2>
    <p className="mt-4 max-w-xl text-mist-400">
      Programas diseñados por coaches ejecutivos con experiencia real.
    </p>
  </ScrollReveal>
  <div className="mt-10">
    <CatalogoList cursos={cursos} />
  </div>
</section>
```

- `revealUp` ya está centralizado en `lib/motion.ts` — se importa ahí,
  sin definir nada nuevo.
- El glow es un div `absolute` fuera del flujo, no traslada nada en X —
  no interactúa con el tema de overflow horizontal de la sección 5.

### 4. Tarjetas de curso: más grandes, entrada lateral alternada

**`CatalogoList.tsx`:**

- Grid: `sm:grid-cols-2 lg:grid-cols-3` → `sm:grid-cols-2` (siempre 2
  columnas).
- El `.map()` pasa el índice para alternar la variante:
  `cursos.map((curso, indice) => <CatalogoCursoCard key={curso.id} curso={curso} variants={indice % 2 === 0 ? revealSlideLeft : revealSlideRight} />)`.
- El `<motion.ul>` contenedor (que solo anima opacidad vía
  `staggerContainer`, nunca se traslada a sí mismo) gana
  `overflow-x-hidden` en su propio className — seguro porque no es el
  elemento que se traslada, mismo patrón ya depurado en Bienvenida.

**`CatalogoCursoCard.tsx`:**

- Acepta un nuevo prop `variants: Variants` (reemplaza el `fadeUp`
  hardcodeado — ya no se importa `fadeUp` acá).
- Padding: `p-5` → `p-8`. Título: sin tamaño explícito hoy (hereda
  default) → `text-xl`.
- El spotlight que sigue al cursor en hover (líneas 26-42, ya existente)
  no cambia — se mantiene tal cual.

### 5. `revealSlideLeft`/`revealSlideRight`: centralización

Mismo refactor que ya se hizo con `revealUp` (commit `04c7254`):

- Se mueven de `DashboardContent.tsx` (líneas 143-161 actuales) a
  `lib/motion.ts`, con el mismo valor exacto (`x: ±130`, `filter:
  "blur(10px)"`, `duration: 0.5`, easing `EASE_OUT` en vez de la
  constante local `EASE` — mismo valor numérico, ya confirmado
  equivalente en el refactor anterior).
- `DashboardContent.tsx` importa ambas desde `@/lib/motion` en vez de
  definirlas localmente — sin cambio de comportamiento.
- `CatalogoCursoCard.tsx`/`CatalogoList.tsx` las importan también desde
  `@/lib/motion`.

## Accesibilidad

- Glows decorativos (Hero, Catálogo) con `aria-hidden="true"`.
- Indicador de scroll es un `<a href="#cursos">` real con texto como
  nombre accesible, no un ícono suelto sin semántica.
- Rebote del chevron y entrada lateral de tarjetas respetan
  `prefers-reduced-motion` (mismo mecanismo ya usado en todo el sitio).
- `overflow-x-hidden` en el contenedor de grilla de `CatalogoList.tsx`
  (que no se traslada a sí mismo) — evita la regresión de overflow
  horizontal ya depurada en el ciclo de Bienvenida.

## Testing

- `lib/motion.test.ts`: nuevos tests para `revealSlideLeft`/
  `revealSlideRight` (mismo patrón que el test ya existente de
  `revealUp`).
- `HeroContent.test.tsx`: se actualiza para cubrir la presencia del link
  de scroll (`getByRole("link", { name: /descubrí nuestros cursos/i })`)
  y que las estadísticas sigan renderizando valor/etiqueta correctamente
  — no se testean tamaños de fuente exactos (implementación, no
  comportamiento).
- `CatalogoCursoCard.test.tsx`: se actualiza para pasar el nuevo prop
  `variants` requerido en el render de test.
- `CatalogoList.test.tsx`: sigue verificando que las tarjetas se
  rendericen; se confirma que cada una recibe la variante alternada
  correcta (por índice).
- Verificación manual en navegador (Playwright, mismo patrón que
  Bienvenida): las cifras se ven grandes con el conteo funcionando, el
  chevron rebota y el link lleva a `#cursos`, las tarjetas entran
  alternando desde los lados sin overflow horizontal en 375/768/1024/1440px,
  y todo cae a estados estáticos correctos con `prefers-reduced-motion`.

## Fuera de alcance

- Cualquier transformación 3D/perspectiva real (`rotateX`, `perspective`,
  tilt de cursor) — decisión confirmada explícitamente con el usuario,
  reutilizando el hallazgo de research ya documentado.
- Contenido/datos nuevos del catálogo (imagen de curso, descripción,
  categoría) — `CursoPublicado` solo expone `id`/`titulo`/`precio` hoy;
  ampliar el modelo de datos es un cambio de alcance mayor, no parte de
  este ciclo.
- Cualquier otra página de la plataforma.
- Nuevas dependencias.
