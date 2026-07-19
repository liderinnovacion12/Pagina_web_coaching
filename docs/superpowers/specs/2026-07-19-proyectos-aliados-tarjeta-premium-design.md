# Proyectos Inmobiliarios Aliados — tarjeta premium con foco de scroll

## Contexto

Feedback tras el ciclo anterior (showcase horizontal de Proyectos): el
precio no se alcanza a ver bien, y en algunas fotos el texto superpuesto
cubre el rostro de las personas en la imagen. El usuario confirmó que le
gusta el deslizamiento horizontal existente, pero pidió explorar algo
más con el scroll para sentirse más premium.

**Diagnóstico del problema actual** (`ProyectoCard.tsx`): el precio se
muestra en un badge con fondo `bg-gold-500/10` (10% de opacidad)
superpuesto sobre la foto — bajo contraste contra fotos con colores
variados. Todo el texto (título, descripción, contacto, WhatsApp) vive
en un bloque `absolute inset-x-0 bottom-0` sobre la imagen con un
degradado — en fotos donde una persona está posicionada hacia la parte
baja del encuadre, el texto puede cubrir su rostro.

## Alcance

- `components/estudiante/proyectos-aliados/ProyectoCard.tsx` — rediseño
  completo del layout interno + nuevo efecto de foco por scroll.
- `components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`
  (nuevo — no existe hoy).
- `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx` —
  solo pasa una nueva prop (`containerRef`) a `ProyectoCard`, sin cambios
  de lógica propia.
- `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`
  — sin cambios de comportamiento esperados (a confirmar en el plan).

## Diseño

### 1. Layout: imagen arriba a brillo completo, panel de texto sólido abajo

Estructura de `ProyectoCard.tsx`:

```tsx
<motion.div className="group relative flex h-[440px] w-[320px] shrink-0 snap-center flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950 sm:w-[380px]">
  {/* Zona de imagen: h-56 fija, sin degradado ni texto encima */}
  <div className="relative h-56 shrink-0 overflow-hidden">
    {proyecto.imagenUrl ? (
      <Image src={...} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
    ) : (
      <div className="absolute inset-0 bg-ink-900" />
    )}
  </div>

  {/* Panel de texto: fondo sólido, nunca se superpone a la imagen */}
  <div className="flex flex-1 flex-col gap-2 p-6">
    <div className="flex items-start justify-between gap-3">
      <h3 className="font-display text-lg font-bold text-white">{proyecto.nombre}</h3>
      {proyecto.precioDesde && (
        <span className="shrink-0 font-mono text-sm font-semibold text-gold-300">
          {proyecto.precioDesde}
        </span>
      )}
    </div>
    <p className="line-clamp-2 text-sm leading-relaxed text-mist-300">{proyecto.descripcion}</p>
    <p className="text-xs text-mist-400">{proyecto.contactoNombre} · {proyecto.contactoTelefono}</p>
    <a href={proyecto.whatsappUrl} ...>Unirse al grupo de WhatsApp ↗</a>
  </div>
</motion.div>
```

Notas:
- La foto ya no lleva `opacity-70` ni degradado — se ve a brillo
  completo siempre.
- El precio deja de ser un badge translúcido sobre la foto: pasa a
  texto plano junto al título, con contraste total contra el fondo
  sólido del panel.
- `line-clamp-3` de la descripción baja a `line-clamp-2` (el panel de
  texto tiene menos alto disponible que antes al no compartir espacio
  con la imagen).
- El hover (`whileHover={{ y: -6 }}`, zoom de la foto) se mantiene.

### 2. Efecto de foco al deslizar (tarjeta centrada se resalta)

`ProyectoCard.tsx` recibe una nueva prop `containerRef:
RefObject<HTMLDivElement>` (referencia al contenedor de scroll de
`ProyectosAliadosGrid.tsx`) y detecta si está centrada usando
`useInView` de framer-motion (ya usado en `ScrollReveal.tsx`) con el
contenedor como `root` y un margen que angosta la zona "visible" al
tercio central:

```tsx
const cardRef = useRef<HTMLDivElement>(null);
const reducedMotion = useReducedMotionSafe();
const enFoco = useInView(cardRef, {
  root: containerRef,
  margin: "0px -35% 0px -35%",
  amount: 0.6,
});

<motion.div
  ref={cardRef}
  animate={
    reducedMotion
      ? { scale: 1, opacity: 1 }
      : { scale: enFoco ? 1.04 : 0.94, opacity: enFoco ? 1 : 0.75 }
  }
  transition={{ duration: 0.3 }}
  ...
>
```

- `root: containerRef` hace que `useInView` mida intersección contra el
  contenedor de scroll horizontal, no contra el viewport de la página.
- `margin: "0px -35% 0px -35%"` angosta esa zona de medición al ~30%
  central del contenedor — solo la tarjeta efectivamente centrada
  cumple el umbral `amount: 0.6`.
- Sin efecto en `prefers-reduced-motion`: todas las tarjetas quedan a
  escala/opacidad normal.

`ProyectosAliadosGrid.tsx` solo necesita pasar la prop:

```tsx
<ProyectoCard key={proyecto.id} proyecto={proyecto} containerRef={scrollRef} />
```

## Accesibilidad

- El efecto de foco es puramente visual (escala/opacidad) — todas las
  tarjetas siguen en el DOM, son igual de accesibles con teclado/lector
  de pantalla sin importar cuál está "en foco" visualmente. No se marca
  ninguna como `inert`.
- El precio en texto plano (en vez de un badge de bajo contraste) mejora
  la legibilidad para todos los usuarios, incluidos quienes tienen baja
  visión.
- `prefers-reduced-motion` desactiva el efecto de foco sin ocultar
  contenido.

## Testing

- `ProyectoCard.test.tsx` (nuevo): verifica que título, precio,
  descripción, contacto y el link de WhatsApp se rendericen
  correctamente en el nuevo layout; mockeando `useInView` (mismo patrón
  que `ScrollReveal.test.tsx`), verifica que el estado "en foco" cambie
  `scale`/`opacity` como se espera.
- `ProyectosAliadosGrid.test.tsx`: se actualiza solo si es necesario
  para que sus tests existentes sigan pasando con la nueva prop
  `containerRef` (a confirmar en el plan — probablemente no necesita
  cambios si `ProyectoCard` maneja el caso `containerRef` sin valor
  inicial sin lanzar error, ya que `useInView` con `root` apuntando a un
  ref que aún no se resolvió simplemente no marca nada "en foco" hasta
  que el DOM esté listo).
- Verificación manual en navegador: confirmar que la tarjeta centrada se
  agranda/resalta en vivo mientras se desliza (mouse, flechas, touch),
  que el precio se lee con contraste total, que ninguna foto queda con
  texto encima, que el efecto de foco se desactiva con
  `prefers-reduced-motion`, y que no hay overflow horizontal a nivel de
  página en ningún viewport.

## Fuera de alcance

- Cambios al modelo de datos (`ProyectoAliado`) o a la página de admin.
- Cambios al master-detalle de Aliados (ciclo anterior, ya cerrado).
- Cualquier otra página de la plataforma.
- Nuevas dependencias.
