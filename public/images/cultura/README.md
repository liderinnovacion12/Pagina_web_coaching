# Fotos de "Cultura y Equipo" — vía Google Drive

Las fotos ya **no** se suben a este repositorio. Se alojan en una carpeta de Google Drive y el código solo guarda el link directo de cada una.

## Cómo obtener el link directo de una foto en Drive

1. Sube la foto a la carpeta de Drive del equipo.
2. Click derecho → **Compartir** → cambia el acceso a **"Cualquier persona con el enlace"** (como mínimo "Lector"). Sin esto, la imagen no cargará en la página.
3. Copia el link que te da Drive, con esta forma:
   `https://drive.google.com/file/d/AQUI_VA_EL_ID/view?usp=sharing`
4. Toma solo el `ID` (la parte entre `/d/` y `/view`) y arma la URL directa:
   `https://lh3.googleusercontent.com/d/AQUI_VA_EL_ID`

Esa segunda URL (`lh3.googleusercontent.com/...`) es la que se guarda en el código/base de datos — la de `drive.google.com/file/d/...` es solo la de compartir y no sirve para mostrarla directo en la página.

## Dónde va cada link

- **Team Leaders** (Wilmar Sosa, Samuel Oropeza y futuros miembros): se guarda en la columna `foto_url` de la tabla `miembros_equipo` en Supabase. Actualízalo con:
  ```sql
  update miembros_equipo set foto_url = 'https://lh3.googleusercontent.com/d/...' where nombre = 'Wilmar Sosa';
  ```
- **Galería del Equipo** (8 fotos del grid): se guardan en el array `GALERIA_EQUIPO` dentro de `app/(estudiante)/dashboard/page.tsx` — reemplaza cada `REEMPLAZAR_ID_FOTO_0X` por el link real y haz commit/deploy (a diferencia de los Team Leaders, esta lista sí vive en código, no en la base de datos).

## Notas

- Google Drive no es un CDN de producción: para un equipo pequeño funciona bien, pero si el tráfico crece conviene migrar a Supabase Storage o un servicio de imágenes dedicado.
- `next.config.ts` ya está configurado para permitir optimizar imágenes desde `lh3.googleusercontent.com`.
