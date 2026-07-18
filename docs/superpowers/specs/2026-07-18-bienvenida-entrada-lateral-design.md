# Bienvenida — entrada lateral pronunciada y limpieza de detalles

## Contexto

Tercera iteración sobre la página de Bienvenida, sobre lo ya construido en
`docs/superpowers/specs/2026-07-18-bienvenida-choreografia-design.md`
(4 variantes de entrada/salida, encabezados con números/íconos
reposicionados, video sin marco). Feedback del usuario tras ver el
resultado:

1. Quitar los números de índice tenues (01, 02, 03).
2. Quitar la etiqueta "Video de inducción" (con el punto pulsante) por
   completo.
3. Las animaciones de entrada/salida de las secciones con múltiples
   tarjetas deben ser mucho más marcadas — inspirado en una sección de
   alkares.com donde las tarjetas entran deslizando desde fuera de la
   pantalla (no solo unos px), alternando lado, dando sensación de que el
   contenido "se construye" progresivamente con el scroll.
4. Las fotos de Team Leaders deben ser más altas, y la sección crece en
   consecuencia.

Research adicional: se revisaron más capturas de alkares.com
(`alkares-scroll-03.png` a `alkares-scroll-05.png`, ya guardadas de research
previo) mostrando una grilla de 6 tarjetas que se arma mientras el usuario
scrollea — las tarjetas entran desde el borde derecho de la pantalla y se
acomodan en su posición final, con un titular gigante atenuado de fondo.

## Alcance

Solo `app/(estudiante)/dashboard/DashboardContent.tsx` y
`components/estudiante/dashboard/TeamLeaderCard.tsx`. Ninguna otra página.

## Diseño

### 1. Quitar los números de índice

Los `<span aria-hidden="true">01/02/03</span>` de los encabezados de
Cultura y Equipo, Nuestros Valores y Galería del Equipo se eliminan. Cada
encabezado conserva su dirección de entrada asignada (`revealLeft`,
`revealRight`, `revealLeft` respectivamente) — solo se quita el número, no
la animación ni la alineación. El ícono grande y tenue de Team Leaders
(`Users`) y Filosofía de Equipo (`Lightbulb`) **no se tocan** — el pedido
fue sobre los números, no sobre los íconos reposicionados.

### 2. Quitar la etiqueta "Video de inducción"

Se elimina por completo el bloque
`<div className="flex items-center gap-2 px-1 pb-4"><span class="... animate-pulse" />...</div>`
que hoy antecede al video. El `ScrollReveal` de esa sección pasa a envolver
directamente el `<div className="relative aspect-video ...">` del
reproductor, sin ningún texto ni punto pulsante arriba.

### 3. Team Leaders: fotos más altas

`components/estudiante/dashboard/TeamLeaderCard.tsx` cambia su altura fija
de `h-[440px]` a `h-[560px]` — la sección de Team Leaders en
`DashboardContent.tsx` no necesita cambios propios, su altura ya depende
del contenido de las tarjetas (`grid gap-6 sm:grid-cols-2` sin altura
fija), así que crece automáticamente. El rango del parallax de la foto
(`useTransform(scrollYProgress, [0, 1], [-16, 16])`) no cambia — no fue
parte del pedido.

### 4. Entrada lateral pronunciada en las 4 secciones de múltiples tarjetas

Nuevas variantes en `DashboardContent.tsx` (junto a `revealUp`/
`revealLeft`/`revealRight`/`revealScale` ya existentes):

```tsx
const revealFromLeftFar: Variants = {
  hidden: { opacity: 0, x: -130, rotate: -4, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const revealFromRightFar: Variants = {
  hidden: { opacity: 0, x: 130, rotate: 4, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};
```

Distancia (~130px) y rotación (±4°) mucho más notorias que las
`revealLeft`/`revealRight` actuales (±40px, sin rotación) — sin necesidad
de medir el viewport real (evita complejidad/dependencias nuevas), pero
con suficiente recorrido para sentirse como "entra desde el lateral", no
un simple desplazamiento.

Se aplican, alternando por índice, a los hijos de estas 4 secciones (sus
`ScrollReveal` contenedores de grilla no cambian — siguen usando
`containerVariants` para el stagger — solo cambian los `variants` de cada
hijo individual):

- **Dos Columnas** (2 tarjetas): "Cómo Usar" → `revealFromLeftFar`,
  "Accesos Rápidos" → `revealFromRightFar`.
- **Team Leaders** (2 tarjetas, vía `TeamLeaderCard`): la primera →
  `revealFromLeftFar`, la segunda → `revealFromRightFar`. Reemplaza a
  `teamLeaderCardVariants` (que se elimina — Team Leaders pasa a usar
  exclusivamente el nuevo tratamiento lateral como su "protagonismo",
  reemplazando el anterior énfasis de solo mayor recorrido vertical).
- **Nuestros Valores** (4 tarjetas, grilla 2x2): índices pares (0, 2) →
  `revealFromLeftFar`, índices impares (1, 3) → `revealFromRightFar`
  (alterna por columna).
- **Galería del Equipo** (hasta 8 fotos): mismo patrón, alternando por
  índice.

**Misión & Visión NO se toca** — confirmado explícitamente con el usuario,
mantiene `cardVariants` (fade + arriba) sin cambios.

`TeamLeaderCard.tsx` necesita aceptar `variants: Variants` igual que hoy
(ya lo hace — el prop ya es genérico), simplemente el valor que le pasa
`DashboardContent.tsx` cambia de `teamLeaderCardVariants` a
`revealFromLeftFar`/`revealFromRightFar` según el índice del `.map()`.

### Accesibilidad

- Sin cambios de mecanismo: mismo `ScrollReveal` (con `once={false}`,
  `inert` y bypass de `prefers-reduced-motion` ya implementados), solo
  cambian los valores de las variantes de los hijos dentro de las grillas.
- La rotación (`rotate: ±4deg`) es puramente visual/decorativa sobre
  contenido ya existente — no afecta la lectura ni la navegación.

### Testing

- Ningún test existente debería verse afectado — los tests de
  `DashboardContent`/`TeamLeaderCard`/`ScrollReveal` verifican contenido y
  props, no valores exactos de animación.
- `TeamLeaderCard.test.tsx`: no requiere cambios (no testea la altura en
  px).
- Verificación manual en navegador: confirmar que los números 01/02/03
  desaparecieron, que la etiqueta "Video de inducción" ya no aparece, que
  las tarjetas de Dos Columnas/Team Leaders/Valores/Galería entran
  claramente desde los lados alternando (no solo un leve desplazamiento),
  y que las fotos de Team Leaders se ven notablemente más altas.

## Corrección encontrada durante la revisión: overflow horizontal

No prevista en la redacción original de este spec. El recorrido de
`revealFromLeftFar`/`revealFromRightFar` (±130px) ensancha el área de
scroll de la página mientras una tarjeta está en su estado "hidden" (sigue
ocupando espacio en el layout aunque `opacity: 0`), y lo mismo aplica en
menor medida a `revealLeft`/`revealRight` (±40px) en los encabezados.
Verificado empíricamente con Playwright, esto causaba scroll horizontal
real en anchos de viewport comunes (768px, 1024px) — no solo en un caso
límite.

Se iteró en 3 commits hasta encontrar el arreglo correcto:

1. **Primer intento (revertido):** `overflow-x-hidden` en el contenedor
   raíz de la página. Arregló el scroll, pero recortó por completo dos
   elementos decorativos preexistentes que viven pegados al borde
   izquierdo sin padding de por medio (la barra dorada junto al título
   "Bienvenido a..." y el ícono grande de `Users` detrás de "Team
   Leaders") — ambos quedaron invisibles/recortados.
2. **Segundo intento (parcial):** se movió `overflow-x-hidden` a las 4
   grillas de tarjetas en vez de la raíz. Arregló la regresión de los
   elementos decorativos, pero dejó un overflow más chico (~16-17px)
   causado por los 3 encabezados que usan `revealLeft`/`revealRight`
   (Cultura y Equipo, Nuestros Valores, Galería del Equipo), que no
   tenían ningún `overflow-x-hidden` en su cadena de ancestros.
3. **Arreglo final (correcto):** la regla que faltaba —
   **`overflow-x-hidden` debe vivir en un ancestro que NO sea el mismo
   elemento que se traslada**, porque el área de recorte de un elemento
   se mueve junto con su propio `transform` y por lo tanto no puede
   recortar su propia traslación. Se aplicó en dos niveles: directamente
   en los contenedores de grilla que solo animan opacidad
   (`containerVariants`, seguro porque nunca se trasladan a sí mismos), y
   en un `<div>` estático envolvente (no animado) alrededor de cada uno de
   los 3 encabezados que sí se trasladan.

**Para futuras secciones con entrada lateral:** no alcanza con razonar en
el código — hay que verificar empíricamente
(`document.documentElement.scrollWidth` vs `clientWidth` en varios anchos
de viewport, más `getBoundingClientRect()`/`elementFromPoint()` en
cualquier elemento decorativo pegado al borde) porque este tipo de bug
puede parecer resuelto en un ancho de viewport y seguir roto en otro, o
resuelto para el scroll pero rompiendo silenciosamente otro elemento
visual.

## Fuera de alcance

- Cualquier otra página.
- Cambios al rango de parallax de `TeamLeaderCard`.
- Misión & Visión.
- Nuevas dependencias.
