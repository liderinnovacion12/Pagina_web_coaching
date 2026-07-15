# Aliados Estratégicos — `/aliados` (estudiante) + `/admin/aliados`

> Reemplaza el `href: null` de "Aliados Estratégicos" en `components/estudiante/nav-config.ts` por una página real: directorio de 4 proveedores externos que dan soporte al negocio del agente (LLC/impuestos, hipotecas, transaction coordinator, marketing digital). Referencia de contenido: `docs/descripcion_contenido_pagina.txt` sección 8 (resumen) — el contenido real y completo se transcribe en este documento (sección 2). Precedente arquitectónico: `009_proyectos_aliados.sql` + `/proyectos-inmobiliarios-aliados` + `/admin/proyectos-inmobiliarios-aliados` (capa de datos, RLS, patrón CRUD admin) — pero con un tratamiento visual **nuevo**, no el de tarjeta grande de imagen: acá las fotos son retratos/logos pequeños tipo avatar, no fotografía de proyecto.

## 1. Alcance

| Archivo | Cambio |
|---|---|
| `supabase/migrations/010_aliados.sql` | Nuevo — tabla `aliados`, RLS, datos semilla (4 aliados, con `imagen_url` ya poblado — a diferencia de `proyectos_aliados`, las 4 fotos ya están subidas) |
| `lib/db/aliados.types.ts` + `.test.ts` | Nuevo — tipos `Aliado`/`AliadoInput`, tipo `Contacto` y función pura `parsearContactos()` (con sus tests) |
| `lib/db/aliados.ts` + `.test.ts` | Nuevo — `getAliados()`, `getTodosLosAliados()`, `crearAliado()`, `actualizarAliado()`, `eliminarAliado()` |
| `app/(estudiante)/aliados/page.tsx` | Nuevo — server component, fetch + delega a componente cliente |
| `components/estudiante/aliados/AliadosGrid.tsx` + `.test.tsx` | Nuevo — orquestador cliente (animación de entrada) |
| `components/estudiante/aliados/AliadoCard.tsx` + `.test.tsx` | Nuevo — tarjeta de contacto con avatar circular |
| `app/(admin)/admin/aliados/page.tsx` | Nuevo — lista + formulario |
| `app/(admin)/admin/aliados/actions.ts` | Nuevo — server actions CRUD |
| `components/admin/aliados/AliadoForm.tsx` + `AliadoListItem.tsx` | Nuevo |
| `components/estudiante/nav-config.ts` | Modificar — `href: null` → `href: "/aliados"` en el ítem "Aliados Estratégicos" |
| `docs/BASE_DE_DATOS.md` | Actualizar — documentar tabla `aliados` y migración 010 |

No se toca `EstudianteShell` ni el layout de `(admin)` — misma decisión que en specs anteriores.

## 2. Contenido real (capturado del sitio de referencia, transcrito íntegro)

Encabezado de página: **"Aliados Estratégicos del Equipo"** / subtítulo **"Contactos y aliados que trabajan con el Team Wilmar & Samuel"**.

| # | Servicio | Contacto(s) | Descripción | Teléfono(s) | Correo(s) | Imagen |
|---|---|---|---|---|---|---|
| 1 | Tributaria LLC | Ricardo Fernandez de Cordoba Martos | Asistencia integral en la creación y renovación de sociedades LLC, actualización del Operating Agreement y presentación de taxes (impuestos anuales). Acompañamiento continuo durante todo el proceso de venta y soporte postventa personalizado. | +1 (305) 458-6559 | ricardo.fernandez@firstglobalfinanceus.com | `aliado-ricardo-fernandez-c4k6Rpie.jpeg` |
| 2 | Préstamos Hipotecarios - Cornerstone First Mortgage | Rafael Aguilera | Con 23 años de experiencia, es gerente en First Mortgage y una guía clave para primeros compradores. Se especializa en explicar de forma clara el proceso financiero, ayudando especialmente a clientes del extranjero a entender cómo invertir en una propiedad puede generar capital a largo plazo y brindar estabilidad financiera. | +1 (305) 297-5104 | raguilera@cfmtg.com | `aliado-rafael-aguilera-HW7GQnh0.jpeg` |
| 3 | Keep It Simple - Transaction Coordinator | Anahis · Antonio | Keep It Simple surge con el objetivo de brindar apoyo remoto a agentes inmobiliarios, acompañándolos durante todo el proceso de compraventa. Actuamos como un puente clave entre el cliente y el agente para coordinar tiempos, avisos y depósitos, y también entre el agente y el broker en temas de cobro y pago de comisiones. Nuestro compromiso es proteger siempre los intereses del agente, asegurando que cada paso del proceso se realice de manera clara, documentada, conforme a la normativa vigente y dentro de los plazos establecidos. | +1 (478) 412-5213 · +1 (832) 299-5129 | Anahis@keepitsimple.properties · Antonio@keepitsimple.properties | `aliado-keep-it-simple-CfsV0J1H.png` (logo, no retrato) |
| 4 | Grow Marketing - Agencia de Marketing Digital Inmobiliario | Carolina Sanabria | Especialista en gerencia de mercadeo y experta en marketing digital inmobiliario. Desde hace más de cuatro años ayuda a agentes de bienes raíces a generar leads calificados mediante campañas efectivas en Facebook Ads. Ofrece servicios de configuración, optimización y gestión de campañas digitales, con un enfoque estratégico en el sector inmobiliario. | +57 313 339 6751 | Carolina.Sanabria@growmarketing.com | `aliado-carolina-sanabria-D1bm9UDi.jpeg` |

Nota: el teléfono de Grow Marketing usa código de país de Colombia (`+57`), a diferencia de los otros 3 que son de EE.UU. (`+1`) — se guarda tal cual, sin normalizar formato.

Las 4 imágenes **ya están subidas** a Supabase Storage (a diferencia del seed de `proyectos_aliados`, que quedó con `imagen_url = NULL`):

```
https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-ricardo-fernandez-c4k6Rpie.jpeg
https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-rafael-aguilera-HW7GQnh0.jpeg
https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-keep-it-simple-CfsV0J1H.png
https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-carolina-sanabria-D1bm9UDi.jpeg
```

Orden de siembra: el mismo orden de la tabla (1–4), vía columna `orden`.

## 3. Modelo de datos

```sql
create table aliados (
  id uuid primary key default gen_random_uuid(),
  servicio text not null,
  descripcion text not null,
  contacto_nombre text not null,    -- una línea por contacto (\n si hay más de uno)
  contacto_telefono text not null,  -- una línea por contacto, mismo orden que contacto_nombre
  contacto_correo text not null,    -- una línea por contacto, mismo orden que contacto_nombre
  imagen_url text,
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index aliados_orden_idx on aliados(orden);
create index aliados_activo_idx on aliados(activo);

alter table aliados enable row level security;
create policy "aliados_select_all" on aliados for select using (true);
create policy "aliados_admin_all" on aliados for all using (is_admin()) with check (is_admin());
```

**Decisión de diseño — multi-contacto sin tabla relacional:** 3 de los 4 aliados tienen un único contacto; "Keep It Simple" tiene dos (Anahis y Antonio), cada uno con su propio teléfono/correo. En vez de una tabla `aliados_contactos` (1 a muchos) — sobre-ingeniería para este volumen — `contacto_nombre`/`contacto_telefono`/`contacto_correo` son texto libre donde **cada línea es un contacto**, alineadas por índice entre las tres columnas. Para los 3 aliados con un solo contacto, cada columna tiene una sola línea (comportamiento idéntico a un campo simple). La función pura `parsearContactos()` (sección 4) reconstruye la lista de contactos a partir de las tres columnas, preservando teléfono/correo clickeables individualmente por contacto — no se pierde esa información dentro de un bloque de texto plano.

`imagen_url` es nullable (mismo patrón que `proyectos_aliados.imagen_url`) para que un aliado agregado después desde `/admin/aliados` sin foto todavía no rompa nada — aunque los 4 sembrados ya la traen.

## 4. Capa de datos

### `lib/db/aliados.types.ts`

```ts
export type Aliado = {
  id: string;
  servicio: string;
  descripcion: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoCorreo: string;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
  creadoEn?: string;
};

export type AliadoInput = {
  servicio: string;
  descripcion: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoCorreo: string;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
};

export type Contacto = {
  nombre: string;
  telefono: string;
  correo: string;
};

export function parsearContactos(
  aliado: Pick<Aliado, "contactoNombre" | "contactoTelefono" | "contactoCorreo">
): Contacto[] {
  const nombres = aliado.contactoNombre.split("\n").map((linea) => linea.trim()).filter(Boolean);
  const telefonos = aliado.contactoTelefono.split("\n").map((linea) => linea.trim()).filter(Boolean);
  const correos = aliado.contactoCorreo.split("\n").map((linea) => linea.trim()).filter(Boolean);

  return nombres.map((nombre, indice) => ({
    nombre,
    telefono: telefonos[indice] ?? "",
    correo: correos[indice] ?? "",
  }));
}
```

`parsearContactos` vive en el archivo de tipos (no en `aliados.ts`) porque no importa `@/lib/supabase/server` — así `AliadoCard` (componente cliente) puede usarla directamente sin arrastrar código server-only, mismo motivo que separa `ETIQUETA_CATEGORIA` en `grupos-comunidad.types.ts`.

### `lib/db/aliados.ts`

Mismo patrón que `lib/db/proyectos-aliados.ts`: mapeo manual snake_case↔camelCase, sin ORM.

- `getAliados()`: `activo = true`, ordenado por `orden` — usado en `/aliados`.
- `getTodosLosAliados()`: sin filtro de `activo` — usado en `/admin/aliados`.
- `crearAliado`, `actualizarAliado`, `eliminarAliado`: CRUD directo, mensajes de error `"No se pudo(ieron) crear/actualizar/eliminar/cargar el/los aliado(s): ${error.message}"`.

## 5. Página del estudiante

Sin buscador/filtro/paginación — 4 ítems no lo justifican (mismo razonamiento que `/proyectos-inmobiliarios-aliados`).

```
AliadosPage (server)                          app/(estudiante)/aliados/page.tsx
 └─ getAliados()
 └─ <AliadosGrid aliados>  (client, solo para stagger de entrada)
     ├─ Header: título "Aliados Estratégicos del Equipo" + subtítulo
     └─ Grid de tarjetas (`grid gap-6 sm:grid-cols-2`)
         └─ AliadoCard × 4
```

### `AliadoCard` — tarjeta de contacto (patrón nuevo)

Ni el patrón de imagen grande de `ProyectoCard` ni el de ícono chico de `GrupoCard` encajan con fotos tipo retrato/logo — patrón nuevo, coherente con los tokens `ink`/`gold`/`mist` de `docs/design-system.md`:

- Contenedor: `rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6`, `whileHover={{ y: -6 }}` (mismo hover que el resto de las tarjetas del sitio).
- Fila superior: avatar circular (`h-14 w-14 rounded-full object-cover`, `next/image`) a la izquierda; si `imagenUrl` es `null`, fallback círculo `bg-gold-500/10 border-gold-500/20` con ícono `Building2` (lucide-react) en `text-gold-300`. A la derecha del avatar: nombre del servicio (`font-display font-semibold text-white`) y, debajo, los nombres de contacto unidos por `" · "` (`text-sm text-mist-400`).
- Descripción completa debajo (`text-sm leading-relaxed text-mist-300`) — sin truncar (a diferencia de `ProyectoCard`, acá no hay imagen de fondo compitiendo por espacio, así que no hace falta `line-clamp`).
- Pie de tarjeta, separado por `border-t border-white/[0.06] pt-4`: una fila por contacto (via `parsearContactos`), con teléfono como link `tel:` y correo como link `mailto:`, cada uno con su ícono (`Phone`/`Mail` de lucide-react, `h-3.5 w-3.5`), color `text-gold-300 hover:text-gold-200`. Si hay más de un contacto, el nombre de cada uno precede su teléfono/correo en esa fila (para el caso de Keep It Simple); si hay uno solo, no se repite el nombre (ya está arriba, junto al avatar).

## 6. Admin (`/admin/aliados`)

Mismo patrón exacto que `/admin/proyectos-inmobiliarios-aliados`: lista (`AliadoListItem`: servicio, primer contacto, activo/inactivo, editar/eliminar) + formulario (`AliadoForm`: servicio, descripción, tres `<textarea>` para contacto (nombre/teléfono/correo, una línea por contacto, con texto de ayuda explicando la convención de líneas alineadas), URL de imagen, orden, activo) vía server actions (`crear`, `actualizar`, `eliminar`) con `useActionState`.

## 7. Navegación

`components/estudiante/nav-config.ts`: `{ label: "Aliados Estratégicos", href: null }` (grupo "Negocio") pasa a `{ label: "Aliados Estratégicos", href: "/aliados" }`.

## 8. Testing

- `lib/db/aliados.types.test.ts`: `parsearContactos` — un contacto (líneas únicas en las 3 columnas), dos contactos (caso Keep It Simple), líneas con espacios extra (se recortan), columnas con distinto número de líneas (defensivo: usa `""` para el faltante).
- `lib/db/aliados.test.ts`: mismo esqueleto que `proyectos-aliados.test.ts` (`getAliados` filtra por activo y ordena; `getTodosLosAliados` sin filtro; CRUD mapea camelCase→snake_case y envuelve errores).
- `components/estudiante/aliados/AliadoCard.test.tsx`: un contacto → no repite el nombre en el pie; dos contactos → nombre precede cada teléfono/correo; `imagenUrl: null` → renderiza el ícono de fallback, no `<img>`.
- `components/estudiante/aliados/AliadosGrid.test.tsx`: renderiza una tarjeta por aliado.

## 9. Fuera de alcance (explícitamente)

- Tabla relacional para contactos — decisión explícita de no hacerlo (sección 3).
- Buscador, filtro o paginación — no se justifican con 4 ítems.
- Cualquier dato no capturado del sitio de referencia — solo se siembran los 4 aliados de la sección 2.
