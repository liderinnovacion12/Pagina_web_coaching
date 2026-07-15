# Proyectos Inmobiliarios Aliados — `/proyectos-inmobiliarios-aliados` (estudiante) + `/admin/proyectos-inmobiliarios-aliados`

> Reemplaza el `href: null` de "Proyectos Inmobiliarios Aliados" en `components/estudiante/nav-config.ts` por una página real: catálogo de 10 preconstrucciones con las que el equipo tiene alianza comercial (comisión 6% regular / 7% para el equipo), cada una con contacto "In House" y grupo de WhatsApp propio. Referencia de contenido: `docs/descripcion_contenido_pagina.txt` sección 7 (resumen) — el contenido real y completo (textos, precios, contactos, enlaces de WhatsApp) fue capturado del sitio de referencia y se transcribe íntegro en este documento (sección 2). Referencia de estilo: `docs/design-system.md`. Precedente arquitectónico: `008_grupos_comunidad.sql` + `/herramientas` + `/admin/herramientas` (capa de datos, RLS, patrón CRUD admin) y `DashboardContent.tsx` (tratamiento visual de tarjeta grande con imagen, para las fotos reales de este módulo — a diferencia de `GrupoCard`, que no tiene fotos).

## 1. Alcance

| Archivo | Cambio |
|---|---|
| `supabase/migrations/009_proyectos_aliados.sql` | Nuevo — tabla `proyectos_aliados`, RLS, datos semilla (10 proyectos, `imagen_url` en NULL) |
| `lib/db/proyectos-aliados.ts` + `.test.ts` | Nuevo — `getProyectosAliados()`, `getTodosLosProyectos()`, `crearProyecto()`, `actualizarProyecto()`, `eliminarProyecto()` |
| `app/(estudiante)/proyectos-inmobiliarios-aliados/page.tsx` | Nuevo — server component, fetch + delega a componente cliente |
| `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx` + `.test.tsx` | Nuevo — orquestador cliente (animación de entrada) |
| `components/estudiante/proyectos-aliados/ProyectoCard.tsx` | Nuevo — tarjeta grande con imagen |
| `app/(admin)/admin/proyectos-inmobiliarios-aliados/page.tsx` | Nuevo — lista + formulario |
| `app/(admin)/admin/proyectos-inmobiliarios-aliados/actions.ts` | Nuevo — server actions CRUD |
| `components/admin/proyectos-aliados/ProyectoForm.tsx` + `ProyectoListItem.tsx` | Nuevo |
| `components/estudiante/nav-config.ts` | Modificar — `href: null` → `href: "/proyectos-inmobiliarios-aliados"` en el ítem "Proyectos Inmobiliarios Aliados" |
| `public/images/proyectos-aliados/README.md` | Nuevo — mismo patrón que `public/images/cultura/README.md`, instrucciones para subir las 10 fotos a Supabase Storage |
| `docs/BASE_DE_DATOS.md` | Actualizar — documentar tabla `proyectos_aliados` y migración 009 |

No se toca `EstudianteShell` ni el layout de `(admin)` — misma decisión que en specs anteriores.

## 2. Contenido real (capturado del sitio de referencia, transcrito íntegro)

Encabezado de página: **"Proyectos Inmobiliarios Aliados"** / subtítulo **"Desarrollos y proyectos con los que trabajamos junto al Team Wilmar & Samuel"** / comisión regular **6%**, comisión para el equipo **7%**.

El texto original de cada proyecto traía el precio incrustado en el párrafo de descripción (ej. "...amoblados. Desde $480,000 aprox."). Por decisión de diseño (sección 4), se separa en un campo `precio_desde` propio; el resto queda como `descripcion`. Dos proyectos (Elle Residences, GZ Tower) no traían precio en el texto original — `precio_desde` queda `NULL` para esos dos, no se inventa un valor.

Cada fila incluye el nombre del archivo de imagen que el usuario ya tiene en `C:\Users\Gabriel Sanchez\Downloads\fotos` (a subir manualmente a Supabase Storage — ver sección 6), como referencia de qué imagen corresponde a qué proyecto.

| # | Nombre | Descripción | Precio | Contacto In House | Teléfono | WhatsApp | Archivo de imagen de referencia |
|---|---|---|---|---|---|---|---|
| 1 | Domus | Una nueva revolución en el lujo urbano, ubicado en el distrito financiero de Miami, Brickell. Estudios y apartamentos de 1 y 2 habitaciones completamente amoblados. | Desde $480K | Diana Garcia | +1 (305) 606-4208 | `https://chat.whatsapp.com/GHHgOqknNKgEh2hiEkqo7M?mode=wwc` | `domus-brickell-DHlkSPs2.png` |
| 2 | Delano | Descubre Delano Residences & Hotel Miami, una torre icónica en Downtown que combina lujo, residencias exclusivas y renta corta, con amenidades de primer nivel como rooftop pool, spa, restaurante y acceso a servicios de playa. | Desde $725K | Christian Tupper | +1 (786) 351-3342 | `https://chat.whatsapp.com/CsU3wnH91AX0WoPD3PFGOY` | `delano-miami-CpKrHLsz.png` |
| 3 | Palma | Descubre Palma Miami Beach, residencias de lujo completamente amobladas, con acceso a beach club, amenidades tipo resort y sin restricciones de renta. Vive o invierte en el destino soñado frente al mar. | Desde $650K | Danny Neumann | +1 (786) 521-5992 | `https://chat.whatsapp.com/HbFwLGQhZuyBDiTV1zE5wq` | `palma-miami-CCNcd5kC.png` |
| 4 | The House of Wellness | House of Wellness en Brickell redefine el estilo de vida con un enfoque en bienestar integral, combinando fitness, spa, recuperación y comunidad en un solo lugar. Diseñado para equilibrar la energía de la ciudad con la tranquilidad diaria. | Desde $400K | Natalia Rojas | +1 (305) 767-5840 | `https://chat.whatsapp.com/Hf2vxF4QSBBG7xrszLLMia?mode=gi_t` | `house-of-wellness-D2aPMcsG.png` |
| 5 | Meliá | Meliá Residences Miami, un proyecto hotelero en Brickell diseñado para generar ingresos pasivos. Unidades amobladas, operación por Meliá y alta demanda turística. Entrega 2027. | Desde $539K | Luisiana Gamboa | +1 (786) 707-9944 | `https://chat.whatsapp.com/Bm1SLnpvRmJ76KJDBCvf7u?mode=gi_t` | `melia-miami-DGN_m5sT.png` |
| 6 | Edge House | Oportunidad de inversión en Miami. Proyecto de 57 pisos con 600 unidades, renta corta permitida desde 1 noche y unidades amobladas por Adriana Hoyos. Estructura flexible desde 5% inicial, con leaseback del 10% anual. Entrega 2028. | Desde $495K | Jessica Rivera | +1 (786) 499-9237 | `https://chat.whatsapp.com/JqdXGJDf6OXAplxC8iGtmA?mode=wwc` | `edge-house-BBDirAd2.png` |
| 7 | Elle Residences | Ofrece residencias de lujo completamente amobladas, con renta flexible y amenidades tipo resort. Ubicación estratégica y respaldo de una marca global de lifestyle. Ideal para inversionistas que buscan exclusividad y rentabilidad en Miami. | *(sin precio)* | Alex Cardona | +1 (786) 366-2666 | `https://chat.whatsapp.com/FPcCprZSLCaIgOfvoYMOPR?mode=wwc` | `elle-residences-YDZjDmyu.png` |
| 8 | GZ Tower | Proyecto de renta corta a 5 minutos de Universal Studios con 357 unidades turnkey (studios, 1BR y lockouts). Edificio de 17 pisos con amenidades tipo resort y alta demanda turística. | *(sin precio)* | Katherine Vargas | +1 (689) 233-6683 | `https://chat.whatsapp.com/BcYhZZ2gToI8LLs3qoDQr2?mode=gi_t` | `gz-tower-BRxY1Npk.png` |
| 9 | Millenia Park | Enfocado en renta anual (no short term), en un mercado con +95% de ocupación. Entregas por fases hasta 2028. Estructura flexible según fase (desde 20%–30% inicial + pagos durante construcción). Ideal para inversionistas que buscan estabilidad y flujo constante a largo plazo. | Desde $289K | Marisol Prada | +1 (786) 948-4060 | `https://chat.whatsapp.com/IO6ARY3HkljACCTiQwSsvR?mode=wwc` | `millenia-park-Cp6M3j55.png` |
| 10 | The Standard | The Standard Residences Brickell Miami: torre de 46 pisos con 422 unidades y política de renta flexible (30 días, hasta 12 veces al año). Ubicación estratégica en Brickell con alto potencial de inversión. | Desde $621K | Nathalie Fernandez | +1 (305) 331-3151 | `https://chat.whatsapp.com/EmUIqBubafQCaO47DOB8WM?mode=wwc` | `the-standard-BrL7yoZp.png` |

Orden de siembra: el mismo orden de esta tabla (1–10), vía columna `orden`.

## 3. Modelo de datos

```sql
create table proyectos_aliados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null,
  precio_desde text,              -- nullable: 2 de 10 proyectos no traen precio en el contenido fuente
  contacto_nombre text not null,
  contacto_telefono text not null,
  whatsapp_url text not null,     -- a diferencia de grupos_comunidad, los 10 enlaces reales ya están disponibles al sembrar
  imagen_url text,                -- nullable: se completa después subiendo a Supabase Storage (ver sección 6)
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index proyectos_aliados_orden_idx on proyectos_aliados(orden);
create index proyectos_aliados_activo_idx on proyectos_aliados(activo);

alter table proyectos_aliados enable row level security;
create policy "proyectos_aliados_select_all" on proyectos_aliados for select using (true);
create policy "proyectos_aliados_admin_all" on proyectos_aliados for all using (is_admin()) with check (is_admin());
```

`precio_desde` es texto libre (no numérico) porque el formato varía por proyecto ("Desde $480K", "Desde $289K") y no hay necesidad de ordenar/filtrar por precio en este módulo (10 ítems, sin buscador — sección 4).

## 4. Página del estudiante

Sin buscador, filtro, categorías ni paginación — con solo 10 ítems no aportan valor real, a diferencia de `/herramientas` (51 grupos). Estructura:

```
ProyectosAliadosPage (server)                 app/(estudiante)/proyectos-inmobiliarios-aliados/page.tsx
 └─ getProyectosAliados()
 └─ <ProyectosAliadosGrid proyectos>  (client, solo para stagger de entrada)
     ├─ Header: título "Proyectos Inmobiliarios Aliados" + subtítulo +
     │     par de badges "Comisión regular: 6%" / "Comisión equipo: 7%"
     └─ Grid de tarjetas (`grid gap-6 sm:grid-cols-2`)
         └─ ProyectoCard × 10
```

### `ProyectoCard`

Tarjeta grande con imagen protagonista — mismo lenguaje visual que las tarjetas de "Cultura y Equipo" en `DashboardContent.tsx` (`h-[440px]`, imagen `fill` con `object-cover`, fallback `bg-ink-900` si `imagen_url` es `null`, gradiente inferior para legibilidad del texto sobre la foto), **no** el patrón de ícono pequeño de `GrupoCard` — esta es la diferencia de estilo deliberada pedida para este módulo.

Contenido superpuesto sobre la imagen (parte inferior, sobre gradiente `from-ink-950 via-ink-950/70 to-transparent`):
- Badge de precio en dorado (`bg-gold-500/10 border-gold-500/20 text-gold-300`), esquina superior — **solo si `precioDesde` no es `null`** (Elle Residences y GZ Tower no lo muestran, sin placeholder ni "Consultar precio").
- Nombre del proyecto (`font-display text-xl font-bold text-white`).
- Descripción (`text-sm text-mist-300`, máx. 3 líneas con `line-clamp-3`).
- Fila de contacto: `{contactoNombre} · {contactoTelefono}` (`text-xs text-mist-400`).
- Botón "Unirse al grupo de WhatsApp ↗" (`text-sm font-semibold text-gold-300 hover:text-gold-200`) — siempre un link real (`target="_blank" rel="noopener noreferrer"`), nunca deshabilitado, porque los 10 `whatsapp_url` ya vienen completos desde el seed (a diferencia de `grupos_comunidad`, no hace falta el estado "Enlace pendiente").

Toda la tarjeta tiene `whileHover={{ y: -6 }}` (mismo patrón que `DashboardContent`), pero **no** es clickeable en su totalidad — solo el botón de WhatsApp es interactivo, igual que `GrupoCard`/`GrupoPrincipalCard`.

## 5. Capa de datos (`lib/db/proyectos-aliados.ts`)

Mismo patrón que `lib/db/grupos-comunidad.ts`: tipos `ProyectoAliado`/`ProyectoAliadoInput` en camelCase, mapeo manual desde/hacia snake_case, sin ORM.

- `getProyectosAliados()`: `activo = true`, ordenado por `orden` — usado en `/proyectos-inmobiliarios-aliados`.
- `getTodosLosProyectos()`: sin filtro de `activo` — usado en `/admin/proyectos-inmobiliarios-aliados`.
- `crearProyecto`, `actualizarProyecto`, `eliminarProyecto`: CRUD directo, mismos mensajes de error envueltos que en `grupos-comunidad.ts` (`"No se pudo crear/actualizar/eliminar el proyecto: ${error.message}"`).

```ts
export type ProyectoAliado = {
  id: string;
  nombre: string;
  descripcion: string;
  precioDesde: string | null;
  contactoNombre: string;
  contactoTelefono: string;
  whatsappUrl: string;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
  creadoEn?: string;
};

export type ProyectoAliadoInput = {
  nombre: string;
  descripcion: string;
  precioDesde: string | null;
  contactoNombre: string;
  contactoTelefono: string;
  whatsappUrl: string;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
};
```

## 6. Fotos (Supabase Storage)

Las 10 imágenes ya existen localmente (`C:\Users\Gabriel Sanchez\Downloads\fotos`) pero no se suben desde este entorno (sin acceso al Storage del proyecto). Se siembra `imagen_url = NULL` en los 10 proyectos; el estudiante ve el fallback `bg-ink-900` hasta que se complete.

`public/images/proyectos-aliados/README.md` documenta el mismo flujo que `public/images/cultura/README.md`: crear (o reutilizar) un bucket público en Supabase Storage, subir cada archivo, copiar la URL pública, y actualizar la fila correspondiente:

```sql
update proyectos_aliados set imagen_url = 'https://<proyecto>.supabase.co/storage/v1/object/public/<bucket>/domus-brickell.png' where nombre = 'Domus';
```

(También puede completarse desde `/admin/proyectos-inmobiliarios-aliados` una vez subida la foto, sin tocar SQL.)

## 7. Admin (`/admin/proyectos-inmobiliarios-aliados`)

Mismo patrón exacto que `/admin/herramientas`: página server component con lista (`ProyectoListItem` por fila: nombre, precio, activo/inactivo, botones editar/eliminar) + formulario (`ProyectoForm`, campos: nombre, descripción, precio, contacto (nombre+teléfono), WhatsApp URL, imagen URL, orden, activo) montado vía server actions (`crear`, `actualizar`, `eliminar` en `actions.ts`) con `useActionState`.

## 8. Navegación

`components/estudiante/nav-config.ts`: el ítem `{ label: "Proyectos Inmobiliarios Aliados", href: null }` (grupo "Negocio") pasa a `{ label: "Proyectos Inmobiliarios Aliados", href: "/proyectos-inmobiliarios-aliados" }`.

## 9. Testing

- `lib/db/proyectos-aliados.test.ts`: mismo esqueleto de tests que `grupos-comunidad.test.ts` (`getProyectosAliados` filtra por activo y ordena; `getTodosLosProyectos` sin filtro; `crearProyecto`/`actualizarProyecto`/`eliminarProyecto` mapean camelCase→snake_case y envuelven errores).
- `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`: renderiza las 10 tarjetas recibidas por props; verifica que un proyecto con `precioDesde: null` no muestra badge de precio; verifica que el link de WhatsApp usa la URL correcta y `target="_blank"`.

## 10. Fuera de alcance (explícitamente, para no desviarse)

- Subir las 10 fotos a Supabase Storage — acción manual del usuario, fuera de lo que se puede automatizar desde este entorno (sección 6).
- Buscador, filtro por zona/categoría o paginación — no se justifican con 10 ítems (sección 4).
- Cualquier dato no capturado del sitio de referencia (ej. metadatos adicionales, más proyectos) — solo se siembran los 10 de la sección 2.
