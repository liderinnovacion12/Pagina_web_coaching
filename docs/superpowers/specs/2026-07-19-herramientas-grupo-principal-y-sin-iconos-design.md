# Herramientas — tarjeta de grupo principal renovada + tarjetas sin icono

## Contexto

Feedback tras el ciclo anterior (acento por canal + revelado por
scroll en Herramientas): quitar los iconos de las tarjetas de grupo,
renovar la tarjeta del grupo principal del equipo (hoy usa el mismo
patrón genérico que el resto), y eliminar el panel de estadísticas que
está al lado de esa tarjeta.

## Alcance

- `components/estudiante/herramientas/GrupoCard.tsx` — quita el icono,
  el acento de color por canal pasa a una franja lateral izquierda.
- `components/estudiante/herramientas/GrupoCard.test.tsx` — tests
  actualizados para la franja lateral en vez del icono con badge.
- `components/estudiante/herramientas/GrupoPrincipalCard.tsx` —
  rediseño completo: ancho completo, banda con degradado verde
  WhatsApp, tipografía más grande, badges "Oficial"/"100% Privado",
  botón sólido en vez de link de texto.
- `components/estudiante/herramientas/GrupoPrincipalCard.test.tsx`
  (nuevo — no existe hoy).
- `components/estudiante/herramientas/IndicadoresPanel.tsx` — se
  elimina (sin otros usos en el proyecto, confirmado por búsqueda en
  todo el repositorio).
- `components/estudiante/herramientas/HerramientasHub.tsx` — deja de
  importar/renderizar `IndicadoresPanel`; la fila que antes tenía
  `grid-cols-2` (tarjeta principal + panel) pasa a que la tarjeta
  principal ocupe todo el ancho.
- `components/estudiante/herramientas/HerramientasHub.test.tsx` — se
  agrega un test de regresión confirmando que el panel de estadísticas
  ya no aparece.

## Diseño

### 1. `GrupoCard.tsx`: sin icono, acento en franja lateral

Se quita `Icono`/`<Icono .../>` y el `<span>` que lo envolvía (la
"insignia") en ambas vistas. El acento de color por canal (verde
WhatsApp / dorado Dropbox), que hoy vive en esa insignia, pasa a un
borde izquierdo grueso en la tarjeta completa:

```tsx
const ACENTO_CANAL: Record<
  GrupoComunidad["tipoCanal"],
  { franja: string; hoverBorde: string; link: string; glow: string }
> = {
  whatsapp: {
    franja: "border-l-4 border-l-whatsapp",
    hoverBorde: "hover:border-whatsapp/40",
    link: "text-whatsapp hover:text-whatsapp-dark",
    glow: "bg-whatsapp/20",
  },
  dropbox: {
    franja: "border-l-4 border-l-gold-500",
    hoverBorde: "hover:border-gold-500/40",
    link: "text-gold-300 hover:text-gold-200",
    glow: "bg-gold-500/20",
  },
};
```

- `acento.franja` se agrega al `className` del contenedor de la
  tarjeta en ambas vistas (junto a `acento.hoverBorde`, que sigue
  aplicando solo en hover como hoy).
- El resplandor en hover (vista grid, `acento.glow`) no depende del
  icono — se mantiene sin cambios.
- Vista lista: al no haber icono, el wrapper `<div className="flex
  min-w-0 items-center gap-3">` que envolvía insignia+texto deja de
  ser necesario — el bloque de texto (nombre + categoría) pasa a ser
  hijo directo del contenedor de la fila.
- Vista grid: el `<h3>` del nombre pierde el `mt-4` que existía para
  dejar espacio bajo el icono (ya no hace falta, es el primer
  elemento).

### 2. `GrupoPrincipalCard.tsx`: banda destacada, ancho completo

Deja de compartir fila con `IndicadoresPanel` (ver sección 3) — ocupa
todo el ancho disponible. Rediseño completo:

```tsx
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";

const BADGES = ["Oficial", "100% Privado"];

export function GrupoPrincipalCard({ grupo }: { grupo: GrupoComunidad | undefined }) {
  if (!grupo) {
    return null;
  }

  const tieneEnlace = Boolean(grupo.enlaceUrl);

  return (
    <div className="flex flex-col gap-6 rounded-[24px] border border-whatsapp/20 bg-gradient-to-r from-whatsapp/15 via-whatsapp/5 to-transparent p-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-whatsapp/30 bg-whatsapp/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-whatsapp"
            >
              {badge}
            </span>
          ))}
        </div>
        <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          {grupo.nombre}
        </h3>
        <p className="mt-1.5 text-sm text-mist-300">
          Canal maestro de comunicación general del equipo.
        </p>
      </div>
      {tieneEnlace ? (
        <a
          href={grupo.enlaceUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-3.5 font-semibold text-ink-950 transition hover:scale-[1.02] hover:bg-whatsapp-dark active:scale-[0.98]"
        >
          Unirse al grupo ↗
        </a>
      ) : (
        <span
          title="Este grupo todavía no tiene enlace cargado"
          className="shrink-0 text-sm font-medium text-mist-500 opacity-50 cursor-not-allowed"
        >
          Enlace pendiente
        </span>
      )}
    </div>
  );
}
```

Notas:
- Los datos "Oficial" y "100% Privado" que hoy vive en
  `IndicadoresPanel` se conservan como badges dentro de esta tarjeta
  (confirmado explícitamente en el brainstorming) — no se pierde la
  información al eliminar el panel.
- El botón "Unirse al grupo ↗" es sólido (`bg-whatsapp`), a diferencia
  del link de texto sutil que usa `GrupoCard` — refuerza que es una
  invitación prioritaria, no una tarjeta más de la lista.
- El componente sigue sin necesitar `"use client"` (no usa hooks ni
  manejadores de evento propios, igual que la versión actual).
- Caso sin enlace (`enlaceUrl` null): ya no se envuelve toda la
  tarjeta en `aria-disabled`/`title` como hoy — al dejar de ser toda
  la tarjeta un único link clickeable (ahora el botón es un elemento
  aparte dentro de una tarjeta informativa), ese estado "pendiente"
  vive directamente en el `<span title="..." ...>Enlace pendiente</span>`
  final, que ya comunica el motivo por su propio `title`.

### 3. `IndicadoresPanel.tsx`: eliminado

Sin otros usos en el proyecto (confirmado por búsqueda en todo el
repositorio) — se elimina el archivo por completo, no solo se deja de
importar. `HerramientasHub.tsx` cambia:

```tsx
// Antes:
<div className="grid gap-6 sm:grid-cols-2">
  <GrupoPrincipalCard grupo={grupoPrincipal} />
  <IndicadoresPanel totalGrupos={gruposDeProyecto.length} />
</div>

// Después:
<GrupoPrincipalCard grupo={grupoPrincipal} />
```

El conteo total de grupos que mostraba `IndicadoresPanel` ("Grupos")
no se pierde — el banner superior ya muestra ese mismo dato
("Grupos activos"), agregado en el ciclo anterior.

## Accesibilidad

- La franja lateral de color (`GrupoCard`) es puramente visual/
  decorativa — el tipo de canal ya es identificable por el texto del
  link de acción ("Unirse"/"Abrir carpeta"), así que no se pierde
  información al quitar el icono (que ya era `aria-hidden` de todas
  formas).
- Los badges "Oficial"/"100% Privado" en `GrupoPrincipalCard` son
  texto plano, accesibles sin configuración adicional.
- El botón "Unirse al grupo ↗" es un `<a>` real con `target="_blank"`
  y `rel="noopener noreferrer"`, igual que el resto de los links de
  la página.

## Testing

- `GrupoCard.test.tsx`: los 4 tests existentes se reescriben para
  verificar la clase de la franja lateral (`border-l-whatsapp` /
  `border-l-gold-500`) en el contenedor raíz de la tarjeta en vez del
  icono con badge. Se agrega un test nuevo confirmando que no se
  renderiza ningún `<svg>` (sin iconos).
- `GrupoPrincipalCard.test.tsx` (nuevo): verifica que se muestre el
  nombre del grupo, los badges "Oficial" y "100% Privado", el botón
  "Unirse al grupo" con el `href` correcto cuando hay enlace, y el
  texto "Enlace pendiente" cuando no lo hay. También verifica que
  `grupo === undefined` no renderiza nada (comportamiento ya existente,
  sin cambios).
- `HerramientasHub.test.tsx`: se agrega un test confirmando que el
  panel de estadísticas ya no aparece (ej. que el texto "Privado" no
  esté presente, ya que ahora solo viviría ahí si `IndicadoresPanel`
  siguiera montado).
- Verificación manual en navegador (según disponibilidad de
  herramienta de navegador en la sesión que ejecute el plan) +
  `npm run build` obligatorio: confirmar que la tarjeta del grupo
  principal ocupa todo el ancho y se ve claramente distinta al resto,
  que las tarjetas de grupo no tienen icono pero sí franja de color,
  y que no queda espacio vacío ni saltos de layout donde estaba el
  panel de estadísticas.

## Fuera de alcance

- Cambios al banner superior, la barra de herramientas, los chips de
  categoría, o la paginación.
- Cambios al modelo de datos o a la página de admin.
- Nuevas dependencias.
