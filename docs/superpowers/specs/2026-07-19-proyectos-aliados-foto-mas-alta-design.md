# Proyectos Inmobiliarios Aliados — foto aún más alta

## Contexto

Tras el ciclo anterior (fotos ancladas arriba + tarjeta agrandada a
504px para mostrar los logos), el usuario pidió agrandar la foto un
poco más.

## Alcance

- `components/estudiante/proyectos-aliados/ProyectoCard.tsx` — únicos
  cambios: alto de la tarjeta y alto de la zona de foto.

## Diseño

Mismo patrón del ciclo anterior: la tarjeta completa y la zona de foto
crecen exactamente el mismo incremento (+64px), así el panel de texto
de abajo conserva su espacio disponible actual (216px) sin riesgo de
recorte de título/descripción/contacto.

- Tarjeta: `h-[504px]` → `h-[568px]`.
- Zona de foto: `h-72` (288px) → `h-[352px]`.

Todo lo demás (`object-cover object-top`, panel de texto, prop
`inert`, `calcularEstiloFoco`) sin cambios.

`ProyectosAliadosGrid.tsx` no requiere cambios — su lógica de
posicionamiento/loop mide geometría real (`offsetLeft`/`offsetWidth`)
en tiempo de ejecución, no depende de la altura de la tarjeta.

## Testing

- Tests existentes de `ProyectoCard.test.tsx` no verifican clases de
  altura (no se rompen). Verificación manual en navegador (según
  disponibilidad de herramienta de navegador en la sesión que
  ejecute el plan) + `npm run build` obligatorio.

## Fuera de alcance

- Cualquier cambio a `ProyectosAliadosGrid.tsx` o a la lógica de loop.
- Nuevas dependencias.
