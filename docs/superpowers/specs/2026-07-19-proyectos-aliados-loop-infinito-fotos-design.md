# Proyectos Inmobiliarios Aliados — loop infinito + fotos más altas

## Contexto

Feedback tras el ciclo anterior (carrusel circular con foco progresivo):
(1) el loop circular solo funcionaba en los botones `‹ ›` — al deslizar
manualmente (touch/trackpad/rueda) y llegar a la última tarjeta, el
scroll simplemente se detenía, sin poder seguir; (2) las fotos de los
proyectos tienen logos pegados al borde superior que quedan recortados
por la altura fija de la zona de imagen.

Decisiones confirmadas durante el brainstorming:
- El loop debe funcionar también con scroll/swipe manual, en **ambas
  direcciones** (no solo al llegar al final — también al deslizar hacia
  atrás antes de la primera tarjeta).
- El loop debe ser **invisible** (técnica de tarjetas duplicadas +
  reposicionamiento silencioso de scroll), no un salto visible. El
  usuario aceptó explícitamente que esto no se puede verificar en un
  navegador real en esta sesión (sin herramienta de navegador
  disponible) — riesgo conocido y aceptado.
- Las fotos se agrandan agrandando la tarjeta completa (no achicando el
  panel de texto), y se ancla el recorte hacia arriba para garantizar
  que los logos queden visibles.

## Alcance

- `components/estudiante/proyectos-aliados/ProyectoCard.tsx` — ajuste
  de alturas (tarjeta y zona de foto) + `object-top`; nueva prop
  opcional `inert` para las copias clonadas.
- `components/estudiante/proyectos-aliados/ProyectoCard.test.tsx` —
  tests para las nuevas alturas/`object-top`/`inert`.
- `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx` —
  renderizado triplicado (clon-antes + reales + clon-después),
  intensidad por instancia, reposicionamiento silencioso al cruzar los
  límites, posición inicial de scroll.
- `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`
  — tests nuevos para el reposicionamiento; los tests existentes
  (contenido, precio, WhatsApp, comisiones, aria-labels, loop de
  botones) no deberían cambiar de comportamiento.

## Diseño

### 1. Fotos más altas + recorte anclado arriba

- La tarjeta completa crece de `h-[440px]` a `h-[504px]` (+64px).
- La zona de foto crece de `h-56` (224px) a `h-72` (288px) — el mismo
  +64px, así el panel de texto de abajo conserva exactamente el mismo
  espacio disponible que tiene hoy (mismo presupuesto ya validado con
  `line-clamp-1`/`truncate` en el ciclo anterior).
- La imagen agrega `object-top` (además de `object-cover`), así
  cualquier recorte restante se toma desde abajo, no desde arriba —
  garantiza que el logo pegado al borde superior de la foto quede
  dentro del encuadre visible.

### 2. Loop invisible en scroll/swipe manual

**Renderizado triplicado.** En vez de renderizar `proyectos` una sola
vez, `ProyectosAliadosGrid` renderiza tres copias consecutivas dentro
del contenedor de scroll: una copia "antes" (clon), la copia "real"
(la única accesible por teclado/lector de pantalla), y una copia
"después" (clon):

```tsx
type Segmento = "antes" | "real" | "despues";
const SEGMENTOS: Segmento[] = ["antes", "real", "despues"];

const tarjetas = SEGMENTOS.flatMap((segmento) =>
  proyectos.map((proyecto) => ({
    clave: `${segmento}:${proyecto.id}`,
    segmento,
    proyecto,
  }))
);
```

Cada tarjeta clon es un `ProyectoCard` idéntico al real (mismo
componente, misma foto/texto/link), pero recibe `inert` para quedar
fuera del árbol de accesibilidad y del orden de tabulación — el mismo
patrón que ya usa `ScrollReveal.tsx` para contenido fuera de vista.
`cardRefs` e `intensidad` pasan de estar indexados por `proyecto.id` a
estar indexados por `clave` (`"segmento:id"`), porque ahora el mismo
`proyecto.id` aparece 3 veces en el DOM.

**Posición inicial.** Al montar, el scroll arranca en la copia "real"
(no en el clon "antes", que queda a la izquierda fuera de vista, listo
para cuando el usuario deslice hacia atrás). Esto se hace con
`useLayoutEffect` (no `useEffect`) para que ocurra antes del primer
paint y no haya un parpadeo visual arrancando en el clon.

**Efecto de intensidad sobre las 3 copias.** El cálculo de distancia
al centro (ya existente) se aplica a las 3×N tarjetas renderizadas, no
solo a las N reales — así los clones que asoman por los bordes durante
el swipe también tienen el mismo efecto de escala/opacidad, sin que se
note un cambio de estilo al cruzar de una copia a otra.

**Reposicionamiento silencioso.** Después de calcular qué tarjeta está
centrada, si esa tarjeta pertenece al segmento "antes" o "después" (el
usuario deslizó más allá de un límite), se ajusta `scrollLeft`
instantáneamente (sin animación, asignación directa a la propiedad, no
`scrollTo` con `behavior: "smooth"`) exactamente un "ancho de
segmento" hacia la copia real — como el contenido es idéntico pixel
por pixel entre copias, el salto no se percibe. El ancho de segmento
se mide directamente del DOM (no un número fijo): la diferencia entre
el `offsetLeft` de la tarjeta real y su clon correspondiente en
"antes" para el mismo `proyecto.id` centrado:

```tsx
const proyectoCentrado = /* el proyecto de la tarjeta centrada */;
const centroReal = cardRefs.current.get(`real:${proyectoCentrado.id}`)?.offsetLeft;
const centroAntes = cardRefs.current.get(`antes:${proyectoCentrado.id}`)?.offsetLeft;
const anchoSegmento = (centroReal ?? 0) - (centroAntes ?? 0);
```

Si la tarjeta centrada está en "antes": `container.scrollLeft +=
anchoSegmento`. Si está en "después": `container.scrollLeft -=
anchoSegmento`. Tras el ajuste, se vuelve a calcular la intensidad una
vez más contra la posición ya corregida (mismo ciclo de cálculo, una
segunda pasada) para que el estado que se guarda ya refleje la tarjeta
real centrada, sin un frame intermedio "equivocado".

**Los botones `‹ ›` no cambian de comportamiento.** `indiceCentrado()`
y `desplazar()` (agregados en el ciclo anterior) siguen operando
exclusivamente sobre las claves `real:${proyecto.id}` — su lógica de
módulo ya resuelve el loop correctamente sin necesidad de tocar los
clones, porque siempre apuntan directo a una tarjeta real vía
`scrollTo` (nunca cruzan hacia un clon).

**Nota de escala:** esta técnica asume una cantidad pequeña de
proyectos aliados (la lista completa se triplica en el DOM). Si la
lista creciera a varias decenas de proyectos, convendría clonar solo
un puñado de tarjetas en cada borde en vez de la lista completa — fuera
de alcance de este ciclo.

## Accesibilidad

- Los clones ("antes"/"después") quedan `inert`: no reciben foco de
  teclado, no son anunciados por lectores de pantalla, y no aparecen
  duplicados en la navegación por tab. Solo la copia "real" es
  interactiva — el comportamiento de accesibilidad no cambia respecto
  a hoy desde la perspectiva de un lector de pantalla o navegación por
  teclado.
- El reposicionamiento de scroll es puramente visual/posicional, no
  afecta el foco de teclado ni dispara anuncios de lector de pantalla.
- `prefers-reduced-motion` sigue desactivando el efecto de intensidad
  (todas las tarjetas, incluidos los clones, a escala/opacidad
  neutras) y forzando scroll instantáneo en los botones, sin cambios
  respecto al ciclo anterior.

## Testing

- `ProyectoCard.test.tsx`: agrega verificación de que la nueva prop
  `inert` se refleje en el elemento raíz cuando se pasa `true` (mismo
  patrón que el test de `inert` en `ScrollReveal.test.tsx`).
- `ProyectosAliadosGrid.test.tsx`: los 7 tests existentes (5 de
  contenido + 2 de loop por botones) no deberían requerir cambios de
  comportamiento — se agregan tests nuevos que mockean geometría para
  las 3 copias (usando un getter/setter en `scrollLeft` en vez de un
  valor estático, para poder capturar qué valor termina escribiendo el
  componente) y verifican que, al simular que la tarjeta centrada cae
  en el clon "después", `scrollLeft` se corrige exactamente por el
  ancho de segmento medido, y que la tarjeta real correspondiente
  queda con la intensidad más alta después del ajuste.
- Verificación manual en navegador (obligatoria, incluyendo
  `npm run build`): confirmar que las fotos muestran los logos
  completos, que deslizar manualmente más allá del último proyecto
  continúa sin corte visible hacia el primero (y viceversa hacia
  atrás), que los botones `‹ ›` se siguen comportando igual que antes,
  que `prefers-reduced-motion` sigue desactivando el efecto, y que
  tabular con teclado nunca llega a una tarjeta clon (queda solo entre
  las tarjetas reales). **Nota:** esta sesión no cuenta con herramienta
  de navegador — esta verificación deberá hacerla el usuario
  manualmente, con foco especial en confirmar que el salto de scroll
  realmente no se nota.

## Fuera de alcance

- Clonado parcial (solo algunas tarjetas en los bordes) para listas
  grandes — la lista completa se triplica.
- Cambios al modelo de datos (`ProyectoAliado`) o a la página de admin.
- Cualquier otra página de la plataforma.
- Nuevas dependencias.
