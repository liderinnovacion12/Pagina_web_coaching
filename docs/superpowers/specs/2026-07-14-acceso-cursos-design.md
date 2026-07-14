# Control de acceso real a cursos comprados (Épica A)

> Cierra el gap descrito en `docs/ARQUITECTURA.md` ("Gaps conocidos") y `docs/TAREAS.md` (ítem 1): `lib/db/cursos.ts` hoy solo filtra por `cursos.publicado` — cualquier estudiante autenticado ve el contenido de cualquier curso publicado, sin verificar `inscripciones` (compra individual) ni `membresia` (suscripción). Las tablas y su RLS ya existen (`004_rls.sql`); falta la lógica de aplicación. Sin integración de Stripe todavía (Épica B, posterior) — las filas de `inscripciones`/`membresia` se siguen asignando a mano vía SQL, igual que hoy.

## 1. Alcance

| Archivo | Cambio |
|---|---|
| `lib/db/cursos.ts` + `.test.ts` | Nueva función `tieneAccesoCurso()`; `getCursoDetalle()` ya no retorna `null` por falta de acceso — agrega el campo `accesoCurso` |
| `lib/db/lecciones.ts` + `.test.ts` | `getLeccionDetalle()` agrega el campo `accesoCurso` (importa `tieneAccesoCurso` de `cursos.ts`, reusa la fila de curso que ya consulta internamente) |
| `app/(estudiante)/cursos/[cursoId]/page.tsx` + `.test.ts` | Lecciones sin acceso se muestran con candado, no clickeables; banner si `searchParams.bloqueado === "1"` |
| `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.tsx` + `.test.ts` | Si `leccion.accesoCurso === false`, `redirect()` a la portada del curso con `?bloqueado=1` en vez de renderizar el reproductor |

No se toca el catálogo (`/sistema-100`, `/clases`, `ClasesCatalogo.tsx`) ni Stripe/checkout — quedan fuera de esta épica.

## 2. Regla de acceso

Nueva función en `lib/db/cursos.ts`, único lugar donde vive esta regla de negocio:

```ts
export async function tieneAccesoCurso(cursoId: string, usuarioId: string, precio: number): Promise<boolean> {
  if (precio === 0) return true;

  const supabase = await createClient();

  const { data: inscripcion } = await supabase
    .from("inscripciones")
    .select("id")
    .eq("usuario_id", usuarioId)
    .eq("curso_id", cursoId)
    .maybeSingle();

  if (inscripcion) return true;

  const { data: membresia } = await supabase
    .from("membresia")
    .select("estado, periodo_fin")
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (!membresia || membresia.estado !== "activa") return false;

  return membresia.periodo_fin === null || new Date(membresia.periodo_fin) > new Date();
}
```

- **Curso gratuito** (`precio === 0`): acceso libre para cualquier estudiante autenticado, sin fila en `inscripciones`. Cubre "Sistema 100+" (los 5 pilares, sembrados con `precio: 0`).
- **Inscripción individual**: fila en `inscripciones(usuario_id, curso_id)` — el `origen` (`compra_individual`/`membresia`) no importa para el chequeo, es solo metadato de cómo se originó.
- **Membresía activa**: `estado = 'activa'` Y (`periodo_fin` es `null` — sin fecha de corte — O `periodo_fin` es futuro). Una membresía activa da acceso a **todos** los cursos pagos, no solo a los que tengan fila en `inscripciones` (el esquema no asocia membresía a cursos específicos).
- Rol: esta función se usa exclusivamente en rutas bajo `(estudiante)`, protegidas por `requireRol("estudiante")` — admin/coach no navegan por `/cursos/*` hoy, no hace falta lógica de bypass.

## 3. Cambios en `lib/db/cursos.ts`

`getCursoDetalle(cursoId, usuarioId)`:
- Ya no retorna `null` cuando el usuario no tiene acceso al curso — sigue retornando `null` solo si el curso no existe o `publicado = false` (comportamiento actual, sin cambios).
- El objeto `CursoDetalle` gana un campo `accesoCurso: boolean`, calculado con `tieneAccesoCurso(curso.id, usuarioId, curso.precio)` (se agrega `precio` al `select` existente).
- Las lecciones siguen viniendo completas en la respuesta (títulos, orden, progreso) independientemente del acceso — el bloqueo es una decisión de UI en la página, no un filtro de datos. El progreso de un usuario sin acceso será siempre vacío en la práctica (nunca pudo ver el video), así que no hace falta ocultarlo explícitamente.

`getCursosPublicados` y `getCursosPorCategoria` (catálogo) no cambian — siguen mostrando todo curso `publicado = true`, con o sin acceso, según lo acordado (portada/catálogo visible, solo el contenido se bloquea).

## 4. Cambios en `lib/db/lecciones.ts`

`getLeccionDetalle()` sigue retornando `null` solo si el curso no existe/no está publicado o la lección no existe (comportamiento actual → `notFound()` en la página, sin cambios).

Se agrega `precio` al `select` de curso que ya hace internamente y se llama `tieneAccesoCurso(cursoId, usuarioId, curso.precio)` (importado de `cursos.ts`) para calcular el nuevo campo `accesoCurso` en `LeccionDetalle`. Sin consultas adicionales más allá de la ya existente para `tieneAccesoCurso` — el objeto `LeccionDetalle` se sigue construyendo completo (incluyendo `muxAssetId`); es la página la que decide no renderizar el reproductor cuando `accesoCurso` es `false`.

## 5. Cambios de UI

### `/cursos/[cursoId]/page.tsx`

- Nueva prop `searchParams: Promise<{ bloqueado?: string }>`. Si `bloqueado === "1"`, se renderiza un banner arriba del título:
  > "No tienes acceso a este curso todavía — habla con tu coach para inscribirte."
  (sin CTA de compra — llega con Stripe en la Épica B; estilo consistente con los demás textos de mist/gold del área de estudiante).
- Cada `<li>` de la lista de lecciones cambia según `curso.accesoCurso`:
  - `true` (comportamiento actual, sin cambios): `<Link>` clickeable con check/circle de progreso.
  - `false`: mismo layout, pero sin `<Link>` — un `<div>` no interactivo, ícono `Lock` (lucide-react) en vez de check/circle, texto atenuado (`text-mist-500`), sin `href`.

### `/cursos/[cursoId]/lecciones/[leccionId]/page.tsx`

- Llama `getLeccionDetalle` como hoy. Si retorna `null` (curso no existe/no publicado, o lección no existe): comportamiento actual, `notFound()` (sin cambios).
- Si retorna un objeto con `accesoCurso === false`: `redirect(`/cursos/${cursoId}?bloqueado=1`)` en vez de renderizar `LeccionPlayer`. Next.js `redirect()` dentro de un server component, mismo patrón que el resto del código usa para navegación server-side.
- Si `accesoCurso === true`: comportamiento actual sin cambios.

## 6. Testing

- `lib/db/cursos.test.ts`: casos para `tieneAccesoCurso` — curso gratis (acceso sin inscripción), con inscripción individual, con membresía `activa` y `periodo_fin` futuro, con membresía `activa` y `periodo_fin` nulo (acceso), con membresía `vencida`/`cancelada` (sin acceso), sin ninguna fila (sin acceso). Actualizar el test existente de `getCursoDetalle` para el nuevo campo `accesoCurso`.
- `app/(estudiante)/cursos/[cursoId]/page.test.tsx`: agregar caso con `accesoCurso: false` — verifica que las lecciones no son links y que aparece el ícono de candado; caso con `searchParams.bloqueado=1` — verifica el banner.
- `app/(estudiante)/cursos/[cursoId]/lecciones/[leccionId]/page.test.tsx`: agregar caso de curso sin acceso — verifica que se llama `redirect` con la URL esperada y no se renderiza el reproductor.

## 7. Fuera de alcance (explícitamente, para no desviarse)

- Cualquier UI de compra/checkout — eso es la Épica B (Stripe).
- Badges de "bloqueado" en las tarjetas del catálogo (`/sistema-100`, `/clases`) — el catálogo sigue mostrando todos los cursos publicados sin distinción visual de acceso.
- Panel de admin para asignar `inscripciones`/`membresia` manualmente desde UI — sigue siendo por SQL directo (script de ejemplo puede agregarse en `supabase/scripts/` si se necesita, pero no es parte de esta épica).
