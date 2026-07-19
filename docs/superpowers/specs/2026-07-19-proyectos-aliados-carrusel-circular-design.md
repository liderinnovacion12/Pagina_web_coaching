# Proyectos Inmobiliarios Aliados — carrusel circular con foco progresivo

## Contexto

Ciclo anterior: se rediseñó `ProyectoCard.tsx` (imagen a brillo completo +
panel de texto sólido) y se agregó un efecto de foco binario (la tarjeta
centrada se agranda/resalta, el resto queda uniformemente atenuado).

Feedback de este ciclo (con boceto de referencia): el usuario quiere un
estilo "carrusel circular" — la tarjeta central mucho más grande, las de
los lados cada vez más tenues según su distancia al centro (no un
apagado uniforme), y que las flechas de navegación permitan dar la
vuelta (de la última tarjeta a la primera y viceversa).

Decisiones confirmadas durante el brainstorming:
- El loop circular aplica **solo a los botones** `‹ ›`. El scroll/swipe
  manual sigue siendo lineal (se detiene en los extremos).
- El efecto de foco pasa de binario a **progresivo por distancia**
  (tipo Coverflow).
- La animación es **continua durante el scroll**, no solo al asentarse
  en un snap.

## Alcance

- `components/estudiante/proyectos-aliados/ProyectoCard.tsx` — cambia
  la prop `enFoco: boolean` por `intensidad: number` (0 a 1).
- `components/estudiante/proyectos-aliados/ProyectoCard.test.tsx` —
  actualiza los tests para la nueva prop.
- `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx` —
  reemplaza el cálculo de `enFocoId` (boolean) por un mapa de
  intensidades continuas; reemplaza `desplazar()` (scroll por píxeles
  fijos) por navegación circular basada en índice.
- `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`
  — sin cambios de comportamiento esperados en sus 5 tests actuales
  (contenido/links); se agregan tests nuevos para el loop.

## Diseño

### 1. Intensidad continua de foco (reemplaza el booleano `enFoco`)

`ProyectosAliadosGrid.tsx` ya recalcula en cada evento de scroll (y en
resize) cuál es la tarjeta más cercana al centro visible del
contenedor. En vez de quedarse solo con el id de la más cercana, ahora
calcula, para **cada** tarjeta, qué tan cerca está del centro como un
valor entre 0 (lejos) y 1 (perfectamente centrada):

```tsx
const FALLOFF_FACTOR = 1.5;

const actualizarIntensidad = useCallback(() => {
  const container = scrollRef.current;
  if (!container) return;

  const entradas = proyectos
    .map((p) => cardRefs.current.get(p.id))
    .filter((el): el is HTMLDivElement => !!el);
  if (entradas.length === 0) return;

  const centros = entradas.map((el) => el.offsetLeft + el.offsetWidth / 2);
  // Espaciado real entre tarjetas contiguas (se adapta a 320px/380px sin numeros fijos)
  const espaciado =
    centros.length > 1 ? centros[1] - centros[0] : container.clientWidth;
  const distanciaCaida = espaciado * FALLOFF_FACTOR;

  const centroContenedor = container.scrollLeft + container.clientWidth / 2;
  const nuevaIntensidad = new Map<string, number>();

  proyectos.forEach((proyecto, i) => {
    const centroTarjeta = centros[i];
    if (centroTarjeta === undefined) return;
    const distancia = Math.abs(centroTarjeta - centroContenedor);
    const normalizada = Math.min(distancia / distanciaCaida, 1);
    nuevaIntensidad.set(proyecto.id, 1 - normalizada);
  });

  setIntensidad(nuevaIntensidad);
}, [proyectos]);
```

- `distanciaCaida` se deriva del espaciado real medido entre los
  centros de dos tarjetas contiguas (no un pixel fijo), multiplicado
  por `FALLOFF_FACTOR = 1.5`. Así la tarjeta vecina inmediata queda a
  ~33% de intensidad y una tarjeta a 2 espacios de distancia ya toca el
  piso (intensidad 0), sin depender del breakpoint (320px vs 380px).
- Se sigue llamando desde el mismo `onScroll` del contenedor y desde el
  mismo `useEffect` de montaje/resize que ya existen — no se agrega
  ningún listener nuevo.

`ProyectoCard.tsx` recibe `intensidad: number` en vez de `enFoco:
boolean` e interpola escala/opacidad:

```tsx
const SCALE_LEJANA = 0.82;
const SCALE_CENTRO = 1.12;
const OPACITY_LEJANA = 0.45;
const OPACITY_CENTRO = 1;

function interpolar(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

export const ProyectoCard = forwardRef<
  HTMLDivElement,
  { proyecto: ProyectoAliado; intensidad: number }
>(function ProyectoCard({ proyecto, intensidad }, ref) {
  const reducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      ref={ref}
      animate={
        reducedMotion
          ? { scale: 1, opacity: 1 }
          : {
              scale: interpolar(SCALE_LEJANA, SCALE_CENTRO, intensidad),
              opacity: interpolar(OPACITY_LEJANA, OPACITY_CENTRO, intensidad),
            }
      }
      transition={{ duration: 0.1 }}
      whileHover={{ y: -6 }}
      className="..." // sin cambios
    >
      {/* resto del layout sin cambios */}
    </motion.div>
  );
});
```

- `transition={{ duration: 0.1 }}` (antes `0.3`) para que la tarjeta
  "siga" de cerca la posición del scroll en vez de sentirse rezagada,
  ya que ahora el valor objetivo cambia en cada evento de scroll en vez
  de una sola vez al asentarse.
- Con `prefers-reduced-motion`, todas las tarjetas quedan a escala 1 /
  opacidad 1 sin importar `intensidad`.

### 2. Navegación circular por botones

`ProyectosAliadosGrid.tsx` reemplaza el `desplazar()` actual (que hace
`scrollBy` con una cantidad fija de píxeles) por una versión que
calcula el índice de la tarjeta centrada, aplica el salto circular, y
centra esa tarjeta exactamente:

```tsx
function indiceCentrado(): number {
  let mejorIndice = 0;
  let mejorIntensidad = -Infinity;
  proyectos.forEach((proyecto, i) => {
    const valor = intensidad.get(proyecto.id) ?? 0;
    if (valor > mejorIntensidad) {
      mejorIntensidad = valor;
      mejorIndice = i;
    }
  });
  return mejorIndice;
}

function desplazar(direccion: 1 | -1) {
  const container = scrollRef.current;
  if (!container || proyectos.length === 0) return;

  const actual = indiceCentrado();
  const siguiente = (actual + direccion + proyectos.length) % proyectos.length;
  const proyectoSiguiente = proyectos[siguiente];
  const card = cardRefs.current.get(proyectoSiguiente.id);
  if (!card) return;

  const centroTarjeta = card.offsetLeft + card.offsetWidth / 2;
  const scrollObjetivo = centroTarjeta - container.clientWidth / 2;

  container.scrollTo({
    left: scrollObjetivo,
    behavior: reducedMotion ? "auto" : "smooth",
  });
}
```

- `indiceCentrado()` toma la tarjeta con mayor intensidad actual (en
  vez de comparar contra un `enFocoId` guardado aparte), evitando
  mantener dos fuentes de verdad.
- El salto circular es aritmética de módulo estándar:
  `(actual + direccion + total) % total`. Con `direccion = -1` en la
  primera tarjeta (`actual = 0`), da `(0 - 1 + total) % total =
  total - 1` — la última tarjeta. Con `direccion = 1` en la última
  tarjeta, da `(total-1 + 1) % total = 0` — la primera.
- El scroll centra la tarjeta objetivo con precisión (en vez de
  adivinar con `scrollBy(400px)`), calculando su centro real y
  restando la mitad del ancho visible del contenedor.
- `SCROLL_AMOUNT_PX` deja de usarse y se elimina.

## Accesibilidad

- El efecto de intensidad es puramente visual — todas las tarjetas
  permanecen en el DOM, accesibles por teclado/lector de pantalla sin
  importar su intensidad visual. Ninguna se marca `inert`.
- `prefers-reduced-motion` desactiva tanto la interpolación continua de
  escala/opacidad (todas quedan en 1/1) como el scroll suave del botón
  (usa `behavior: "auto"`).
- El scroll/swipe manual (fuera del alcance del loop) sigue
  comportándose de forma predecible: se detiene en los extremos, sin
  saltos inesperados.

## Testing

- `ProyectoCard.test.tsx`: se actualiza para pasar `intensidad` en vez
  de `enFoco`. Se verifica que a `intensidad={0}`, `intensidad={0.5}` y
  `intensidad={1}` el `animate` recibido por `motion.div` interpole
  correctamente entre los extremos definidos (siguiendo el patrón ya
  usado de aserciones sobre valores/argumentos en vez de estilos
  computados animados).
- `ProyectosAliadosGrid.test.tsx`: sus 5 tests actuales (contenido,
  precio, WhatsApp, comisiones, aria-labels de botones) no deberían
  requerir cambios. Se agregan tests nuevos para el loop: mockeando
  `Element.prototype.scrollTo` y las propiedades de layout
  (`offsetLeft`/`offsetWidth`/`clientWidth`) que jsdom no calcula
  realmente, se verifica que hacer clic en `‹` estando en la primera
  tarjeta solicite centrar la última, y que `›` estando en la última
  solicite centrar la primera.
- Verificación manual en navegador (obligatoria, incluyendo
  `npm run build`): confirmar que el efecto de escala/opacidad se
  siente continuo (no a saltos) mientras se desliza con mouse/touch,
  que las flechas dan la vuelta correctamente en ambos extremos, que
  `prefers-reduced-motion` desactiva el efecto y el scroll suave, y que
  no hay overflow horizontal a nivel de página en ningún viewport
  (incluyendo los anchos móvil/tablet que antes rompían el cálculo de
  `useInView`).

## Fuera de alcance

- Loop circular para scroll/swipe manual (confirmado explícitamente
  fuera de alcance por el usuario).
- Cambios al modelo de datos (`ProyectoAliado`) o a la página de admin.
- Cualquier otra página de la plataforma.
- Nuevas dependencias.
