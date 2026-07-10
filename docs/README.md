# Documentación de la plataforma

Índice de la documentación técnica del proyecto. Esta carpeta describe **el estado real del código en este repositorio**, no aspiraciones de producto ni el sitio anterior en el que se basó el contenido.

## Empezar aquí

| Documento | Para qué sirve |
|---|---|
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Stack, estructura de carpetas, rutas, flujo de autenticación/roles, convenciones. |
| [BASE_DE_DATOS.md](./BASE_DE_DATOS.md) | Esquema de Supabase/Postgres: tablas, relaciones, RLS, funciones y triggers, migraciones. |
| [TAREAS.md](./TAREAS.md) | Qué está construido, qué es un placeholder y qué falta para el objetivo final del producto. |

## Otros documentos en esta carpeta

- **`design-system.md`** — guía de estilo visual (tipografía, color, espaciado). Nota: la sección de login describe un layout de dos columnas con `LoginBranding` que ya no existe en el código (se simplificó a una columna en el commit `2bbdbbb`); tratar esa parte como desactualizada hasta que se revise.
- **`descripcion-paginas.md`** y **`descripcion_contenido_pagina.txt`** — notas de ingeniería inversa del sitio anterior (`teamwilmarsosa.samueloropeza.com`, hecho en Lovable/Vite/React Router). Son referencia de contenido/funcionalidad objetivo, **no** documentación de este repositorio.
- **`superpowers/`** — historial de planes y specs generados durante el desarrollo (skill `superpowers`). Es un registro cronológico, no documentación viva.

## Marca del producto

**Team 100% Real Estate** es la marca real y definitiva (confirmado 2026-07-10) — plataforma de formación para agentes inmobiliarios. `package.json` (`team-100-real-estate`) y todo el código en ejecución (`app/`, `components/`) ya reflejaban esta marca correctamente.

`PRODUCT.md` y `design-system.md` mencionaban antes "CoachPro", nombre de un LMS de coaching ejecutivo genérico que no correspondía al producto real — ya se corrigieron para hablar consistentemente de Team 100% Real Estate. Sigue pendiente actualizar el dominio de envío de `supabase/functions/send-email/index.ts` (`no-reply@coachpro.app`), que no se tocó porque requiere confirmar el dominio real de correo del negocio — ver `TAREAS.md`.
