# Arquitectura técnica — teamwilmarsosa.samueloropeza.com

Documento de referencia para que Claude Code (u otro agente de codificación) entienda cómo está construida la aplicación **sin acceso al repositorio**, basado en inspección en vivo del DOM, `localStorage`, peticiones de red y clases CSS renderizadas. No hay repositorio público conectado a esta sesión; todo lo aquí descrito se infirió inspeccionando el sitio desplegado.

## 1. Plataforma de construcción y despliegue: Lovable

Evidencia directa:

- `localStorage` contiene las claves `__lovable_session` y `__lovable_anonymous_id`, propias del runtime de [Lovable](https://lovable.dev) (antes "GPT Engineer" — el bucket de imágenes de perfil `storage.googleapis.com/gpt-engineer-file-uploads/...` es un resabio de ese nombre anterior).
- El dominio propio (`teamwilmarsosa.samueloropeza.com`) sirve rutas internas de infraestructura de Lovable: `/~flock.js`, `/__l5e/events.js`, `/__l5e/trackevents` y `/~api/analytics` — scripts de analítica y tracking inyectados automáticamente por la plataforma, no parte del código de la app.
- Los archivos multimedia subidos "desde el editor" (miniaturas de reuniones recientes) se sirven vía `/__l5e/assets-v1/<uuid>/<nombre-archivo>.png` — el proxy de assets de Lovable en el dominio custom.

**Implicación práctica:** este proyecto no se edita como un repo Git tradicional en el que Claude Code haría `git clone` y PRs; probablemente se administra desde el editor visual/IA de Lovable, que internamente sí mantiene un repo de GitHub sincronizado (Lovable ofrece "GitHub sync"). Si el usuario quiere que Claude Code trabaje sobre el código, el primer paso es localizar ese repo de GitHub sincronizado (revisar la integración en el dashboard de Lovable) en lugar de asumir acceso directo al servidor.

## 2. Stack de frontend

| Capa | Tecnología detectada | Evidencia |
|---|---|---|
| Bundler | **Vite** | Archivos con hash de contenido: `assets/index-C0BNb43k.js`, `assets/index-FqBvDirj.css`, e imágenes procesadas como `assets/wilmar-sosa-CtFC5gPc.jpg` |
| Framework UI | **React** (vía Vite, no Next.js) | Sin `window.__NEXT_DATA__`; SPA de una sola página (`index.html` + bundle único), enrutamiento 100% cliente |
| Enrutador | Muy probablemente **React Router** | 18 rutas planas sin recarga completa entre navegaciones (`/`, `/cultura`, `/sistema-100`, etc.) |
| Estilos | **Tailwind CSS** | Clases utilitarias verificadas en runtime: `inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium` |
| Componentes UI | **shadcn/ui** (sobre Radix + Tailwind) | El patrón de clases del botón anterior es la firma exacta del componente `Button` de shadcn/ui — stack por defecto de los proyectos Lovable |
| Lenguaje | Casi con certeza **TypeScript** | Estándar de scaffolding de Lovable/Vite; no verificable en runtime porque el código ya está transpilado y minificado en `index-*.js` |

No se detectó `window.React` como global ni React DevTools hook activo (build de producción minificado, sin exponer globals de desarrollo) — coherente con un build de producción normal, no indica un framework distinto.

## 3. Backend: Supabase (BaaS)

Confirmado por dos vías independientes:

1. `localStorage` contiene el token de sesión `sb-wvqljhglrbflozpleqmo-auth-token` → **project ref de Supabase: `wvqljhglrbflozpleqmo`**.
2. Llamadas REST observadas directamente contra `https://wvqljhglrbflozpleqmo.supabase.co/rest/v1/...` (PostgREST, el API autogenerado de Supabase).

Endpoints observados durante la navegación normal (sin login explícito, sesión ya persistida):

- `GET /rest/v1/profiles?select=*&user_id=eq.<uuid>` — carga el perfil del usuario autenticado.
- `PATCH /rest/v1/profiles?user_id=eq.<uuid>` (204) — se ejecuta en cada cambio de ruta; muy probablemente actualiza un campo tipo `last_seen_at` / `last_active_page` para tracking de actividad del agente.
- `GET /rest/v1/user_roles?select=role&user_id=eq.<uuid>&role=eq.admin` (devuelve 406) — patrón típico de verificación de rol vía Supabase Row Level Security: consulta si el usuario tiene el rol `admin` en una tabla `user_roles` separada de `profiles` (el 406 ocurre porque el cliente espera una única fila con `.single()` y no encuentra ninguna coincidencia — es decir, el usuario actual **no** tiene rol admin).

**Modelo de datos mínimo inferido:**

```
auth.users (gestionado por Supabase Auth)
 └── profiles (user_id FK, datos de perfil del agente)
 └── user_roles (user_id FK, role enum/text — patrón estándar de Supabase para evitar guardar roles directamente en profiles/JWT)
```

**Dato clave para Claude Code:** el contenido "de negocio" que se ve en cada módulo (pilares del Sistema 100+, calendario de reuniones, catálogo de proyectos, videoteca de clases, aliados, etc.) **no se pidió a Supabase en ningún momento** durante la sesión de navegación. Eso indica que ese contenido está **hardcodeado como datos estáticos dentro del bundle de React** (arrays/objetos TS embebidos en los componentes de cada página), no en tablas de base de datos. Supabase se usa exclusivamente para autenticación, perfil de usuario y control de roles — no como CMS del contenido visible. Cualquier edición de contenido (agregar una clase nueva, un proyecto nuevo, un evento nuevo) implica modificar el código fuente de esa página y volver a desplegar, no insertar una fila en una tabla.

## 4. Gestión de assets multimedia

Dos orígenes distintos conviven en la misma app:

- **Assets estáticos versionados por Vite** (`/assets/<nombre>-<hash>.ext`): imágenes importadas directamente en el código fuente (fotos de los Team Leaders, fotos de equipo, capturas de reuniones antiguas). Cambian solo si se modifica el código y se reconstruye el bundle.
- **Assets subidos vía editor de Lovable** (`/__l5e/assets-v1/<uuid>/<nombre-descriptivo>.png`): imágenes de portada de las clases más recientes, subidas probablemente arrastrando archivos en el editor visual de Lovable sin tocar código. Estos sí pueden cambiar sin rebuild.
- **Miniaturas de YouTube** (`img.youtube.com/vi/<id>/maxresdefault.jpg`): los videos de clases y del Sistema 100+ no están alojados en la plataforma; son embeds de YouTube referenciados por ID de video.

## 5. Mapa de rutas (para referencia de un futuro `src/App.tsx` / router config)

```
/                                → Bienvenida (onboarding, accesos rápidos)
/cultura                         → Cultura y Equipo (misión, visión, valores, líderes)
/sistema-100                     → Sistema 100+ (5 pilares, videos YouTube embebidos)
/calendario                      → Calendario Semanal (reuniones recurrentes, links Zoom)
/clases                          → Clases y Entrenamientos (videoteca histórica filtrable)
/herramientas                    → Herramientas y Comunicación (directorio de 52 grupos WhatsApp)
/proyectos-inmobiliarios-aliados → Catálogo de preconstrucciones con comisión y contacto in-house
/aliados                         → Aliados Estratégicos (proveedores externos: legal, hipotecas, TC, marketing)
/eventos                         → Eventos (internacionales, NY, Legacy Impact 360, Tu sueño tu casa Fest)
/acelerador-pro                  → Landing externa embebida (programa de pago, 4 semanas)
/acelerador-starter              → Landing externa embebida (taller de 3 días)
/curso-rentas                    → Maestría en Rentas (venta cruzada con descuento)
/crm                              → CRM GoHighLevel (onboarding + pricing)
/marketing                       → Recursos de Marketing y Ventas (descargas, scripts, técnicas)
/construccion-equipo             → Construcción de Equipo (progresión de carrera / reclutamiento)
/transacciones                   → Transacciones (documentos, BackOffice, tutoriales)
/soporte                         → Soporte, Ayuda y Contactos (asistente IA + directorio corporativo)
/oficinas                        → Nuestras Oficinas (4 sedes en Florida + reserva de sala)
```

Los módulos `acelerador-pro` y `acelerador-starter` rompen el layout común (sidebar + `<main>`) y cargan una landing page con su propio header — indicio de que son `<iframe>` o vistas standalone que envuelven una landing externa de venta, no páginas nativas construidas con los mismos componentes que el resto del panel.

## 6. Autenticación y control de acceso

- Login gestionado por **Supabase Auth** (JWT persistido en `localStorage` bajo la clave `sb-<project-ref>-auth-token`).
- Autorización basada en roles vía tabla `user_roles`, consultada por rol específico (`role=eq.admin`) en el cliente — patrón de RLS recomendado por la propia documentación de Supabase (evita guardar roles en el JWT o en `profiles` para prevenir escalamiento de privilegios vía edición directa de esa tabla).
- El usuario de la sesión inspeccionada (Julian Robles, `lider.innovacion@servialc...`) no tiene rol `admin` (la consulta devolvió 406 / sin fila).

## 7. Recomendaciones si se va a conectar Claude Code a este proyecto

1. Ubicar el repositorio de GitHub sincronizado desde el dashboard de Lovable (Project → Settings → GitHub) — es la fuente de verdad del código, no el sitio desplegado.
2. Confirmar la estructura esperada de un scaffold Lovable estándar: `src/pages/*.tsx` (una por ruta), `src/components/ui/*` (shadcn/ui), `src/integrations/supabase/client.ts` (cliente inicializado con el project ref `wvqljhglrbflozpleqmo`), `tailwind.config.ts`, `vite.config.ts`.
3. Buscar en el repo las tablas `profiles` y `user_roles` (probablemente definidas también como migraciones SQL en `supabase/migrations/` si el proyecto usa Supabase CLI) para entender el esquema de permisos antes de tocar lógica de autenticación.
4. Tratar el contenido de cada módulo (textos, videos, proyectos, aliados) como **datos estáticos en código**, no como registros de base de datos — al editarlos con Claude Code, el cambio correcto es modificar el componente de la página correspondiente, no escribir una migración.
5. Los dos módulos "Acelerador" apuntan a landing pages externas; si se requiere editarlas, hay que identificar si son iframes a otra propiedad (otro proyecto Lovable/dominio) o componentes propios antes de asumir que el código vive en este mismo repo.