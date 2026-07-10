# Herramientas y Comunicación — `/herramientas` (estudiante) + `/admin/herramientas`

> Reemplaza el stub de `app/(estudiante)/herramientas/page.tsx` por el directorio real de comunidades de WhatsApp/Dropbox del equipo, con datos en Supabase y un panel admin para cargar los enlaces reales. Referencia de estructura: `docs/Estructura_Herramientas.md`. Referencia de animaciones: `docs/animaciones.md`. Referencia de estilo: `docs/design-system.md`. Precedente arquitectónico directo: `007_calendario.sql` + `/calendario` + `/admin/calendario`.

## 1. Alcance

| Archivo | Cambio |
|---|---|
| `supabase/migrations/008_grupos_comunidad.sql` | Nuevo — tabla `grupos_comunidad`, enums, RLS, datos semilla (51 grupos, `enlace_url` en NULL) |
| `lib/db/grupos-comunidad.ts` + `.test.ts` | Nuevo — `getGruposComunidad()`, `getTodosLosGrupos()`, `crearGrupo()`, `actualizarGrupo()`, `eliminarGrupo()` |
| `app/(estudiante)/herramientas/page.tsx` | Reescritura — server component, fetch + delega a componente cliente |
| `components/estudiante/herramientas/*.tsx` | Nuevo — `HerramientasHub` (orquestador cliente), `GrupoPrincipalCard`, `IndicadoresPanel`, `HerramientasToolbar`, `CategoriaChips`, `GrupoCard`, `Paginacion` |
| `app/(admin)/admin/herramientas/page.tsx` | Nuevo — lista + formulario de grupos |
| `app/(admin)/admin/herramientas/actions.ts` | Nuevo — server actions CRUD |
| `components/admin/herramientas/GrupoForm.tsx` + `GrupoListItem.tsx` | Nuevo |
| `docs/BASE_DE_DATOS.md` | Actualizar — documentar tabla `grupos_comunidad` y migración 008 |

No se toca `EstudianteShell` ni el layout de `(admin)` — misma decisión que en el spec de calendario.

## 2. Modelo de datos

```sql
create type categoria_grupo_comunidad as enum
  ('grupo_principal', 'miami', 'orlando_centro_florida', 'venta_renta', 'otros');
create type canal_grupo_comunidad as enum ('whatsapp', 'dropbox');

create table grupos_comunidad (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria categoria_grupo_comunidad not null,
  detalle text,                      -- subtítulo: zona ("Brickell, Miami") o tipo ("Constructor nacional")
  tipo_canal canal_grupo_comunidad not null default 'whatsapp',
  enlace_url text,                   -- NULL al sembrar; se completa desde /admin/herramientas
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index grupos_comunidad_categoria_idx on grupos_comunidad(categoria);
create index grupos_comunidad_activo_idx on grupos_comunidad(activo);

alter table grupos_comunidad enable row level security;
create policy "grupos_comunidad_select_all" on grupos_comunidad for select using (true);
create policy "grupos_comunidad_admin_all" on grupos_comunidad for all using (is_admin()) with check (is_admin());
```

**Datos semilla** (51 filas, `enlace_url = null` en todas, `orden` secuencial dentro de cada categoría siguiendo el orden del documento fuente):

- **`grupo_principal`** (1): Grupo Principal del Equipo.
- **`miami`** (35): Bentley Residences, Botanic Residences, Cassia Coral, COVE, DELANO Residences (Miami Beach), Domus, Doppio, Edge House, Elle Residences, Frida Kahlo, GAIA Residences, House of Wellness 2029, HQ Residences, ICON 192, Jean Georges, Mandarin Residences, Melia Brickell (Brickell, Miami), Mercedes-Benz Residences, Midtown Park, Mondrian Hallandale (Hallandale Beach), Nexo, NoBe Parc (North Beach), Okan Tower, One Hollywood (Hollywood, FL), One Twenty Signature Brickell (Brickell, Miami), PALMA, River District, Seven Park, Shoma Bay, Standard Residences, The William, VICEROY Brickell (Brickell, Miami), Vista Harbor, Visions, W Pompano Beach (Pompano Beach).
- **`orlando_centro_florida`** (8): 14 ROC - Team Wilmar Sosa (Residencial), DR Horton con Angel Acosta (Constructor nacional), GZ Tower Orlando (Torre), Lennar Group – Orlando Division (Constructor nacional), Millenia Park (Residencial), NICKELODEON Orlando (Proyecto temático), Taylor Morrison Orlando (Constructor nacional), Watersong Lotes (Lotes / tierra).
- **`venta_renta`** (2): Listing de Venta / Team 100 Real, Community Rental – Team Wilmar Sosa.
- **`otros`** (5): 26th & 2nd, Parkside, SEVENTEEN GABLES, Casa Bella (`tipo_canal = 'dropbox'`, detalle "Archivos del proyecto"), Lennar Miami.

**Nota de conteo**: el documento fuente menciona "52 grupos", pero la enumeración explícita solo produce 51 entradas distintas (probablemente una fue contada dos veces en la redacción original — Jean Georges/Frida Kahlo aparecen tanto en la tabla de Miami como en la nota de "Otros"). Se siembra con las 51 identificadas; si falta alguna se agrega después desde `/admin/herramientas` sin tocar SQL.

## 3. Capa de datos (`lib/db/grupos-comunidad.ts`)

Mismo patrón que `lib/db/calendario.ts`: tipos `GrupoComunidad`/`GrupoComunidadInput` en camelCase, mapeo manual desde/hacia snake_case, sin ORM.

- `getGruposComunidad()`: `activo = true`, ordenado por `categoria, orden` — usado en `/herramientas`.
- `getTodosLosGrupos()`: sin filtro de `activo` — usado en `/admin/herramientas`.
- `crearGrupo`, `actualizarGrupo`, `eliminarGrupo`: CRUD directo, mismos mensajes de error envueltos que en `calendario.ts`.

## 4. Página del estudiante — árbol de componentes

```
HerramientasPage (server)                     app/(estudiante)/herramientas/page.tsx
 └─ getGruposComunidad()
 └─ <HerramientasHub grupos>  (client)
     ├─ Hero
     │   ├─ Columna izq: ícono WhatsApp + título "Herramientas y Comunicación" +
     │   │     etiqueta "Prioridad #1 para nuevos agentes" + descripción + 3 beneficios en fila
     │   └─ Columna der: ilustración/glow decorativo (mismo lenguaje que banner WhatsApp del dashboard)
     ├─ Panel superior (grid 2 columnas)
     │   ├─ GrupoPrincipalCard (la única fila con categoria = 'grupo_principal'; toda la card
     │   │     es clickeable, botón "Unirse ↗" alineado a la derecha, deshabilitado con
     │   │     "Enlace pendiente" si enlace_url es NULL)
     │   └─ IndicadoresPanel: "50 Grupos" · "1 Oficial" · "100% Privado"
     ├─ HerramientasToolbar
     │   ├─ Buscador (texto libre sobre nombre + detalle)
     │   ├─ Selector de orden ("Nombre A-Z" | "Más recientes")
     │   └─ Toggle de vista: Grid ⊞ / Lista ☰
     ├─ CategoriaChips: Todos (50) · Miami (35) · Orlando y Centro de Florida (8) ·
     │     Venta y Renta (2) · Otros (5) — excluye grupo_principal (ya mostrado arriba)
     ├─ Grid o Lista de GrupoCard (según toggle), paginado
     └─ Paginacion: 12 por página, "Mostrando X–Y de N grupos"
```

Simplificación deliberada frente al wireframe genérico de `Estructura_Herramientas.md`: el toolbar **no** incluye un dropdown de categoría separado (el documento lo menciona en la sección "Toolbar" y otra vez en "Categorías") — un solo control de categoría (los chips) evita redundancia funcional.

**`GrupoCard`**: ícono según `tipo_canal` (`MessageCircle` de `lucide-react` para whatsapp, `Folder` para dropbox), nombre, `detalle` como subtítulo, badge de categoría, botón "Unirse ↗" / "Abrir carpeta ↗" a la derecha. Si `enlace_url` es `null`: botón deshabilitado, texto "Enlace pendiente", `aria-disabled` + `title` explicativo (mismo patrón que "botón deshabilitado permanente" de `design-system.md` §5).

**Responsive**: grid `sm:grid-cols-2 lg:grid-cols-3` (igual que `ClasesCatalogo`); vista lista es una columna de filas compactas en cualquier tamaño.

## 5. Panel admin — `/admin/herramientas`

Mismo patrón que `/admin/calendario`:
- Lista de los 51 grupos (`GrupoListItem`, editar/eliminar inline vía `useState` local + server actions).
- Formulario "Nuevo grupo" (`GrupoForm`, `useActionState`) con campos: nombre, categoría (select), detalle, tipo de canal (select whatsapp/dropbox), enlace URL, orden, activo.
- `actions.ts`: `crearGrupoAction`, `actualizarGrupoAction`, `eliminarGrupoAction` — protegidas por RLS (`is_admin()`) y por `requireRol("admin")` ya aplicado en `app/(admin)/layout.tsx`.

Esta es la vía por la que se cargarán los 51 enlaces reales, sin tocar SQL a mano.

## 6. Animaciones (`lib/motion.ts` + `docs/animaciones.md`)

| Elemento | Patrón |
|---|---|
| Hero + Panel superior al montar | `staggerContainer` + `blurFadeUp` (patrón 1 de `animaciones.md`) |
| Grid de `GrupoCard` | `staggerContainer(0.05)` + `blurFadeUp` por tarjeta |
| Hover de `GrupoCard` | `whileHover={{ y: -6 }}` (patrón 2B) |
| Botón "Unirse ↗" | `hover:scale-[1.02] active:scale-[0.98]` (patrón 2C); omitido si está deshabilitado |
| Chips de categoría | transición de color/borde on click, mismo patrón que `ClasesCatalogo` (sin motion, solo `transition` CSS) |
| Cambio de página (paginación) | fade simple del grid (`fadeIn`, sin slide) |

Todo respeta `useReducedMotionSafe()` de `lib/motion.ts`.

## 7. Testing

- `lib/db/grupos-comunidad.test.ts`: sigue el patrón de mock de cliente Supabase usado en `lib/db/calendario.test.ts`.
- Sin tests de integración de UI nuevos, consistente con el resto del repo (no hay ese patrón hoy para componentes cliente de catálogo/filtrado).
