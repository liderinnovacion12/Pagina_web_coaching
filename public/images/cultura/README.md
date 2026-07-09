# Fotos de "Cultura y Equipo" — vía Supabase Storage

Las fotos ya **no** se suben a este repositorio ni a Google Drive. Se alojan en un bucket público de Supabase Storage y el código solo guarda la URL pública de cada una.

## Cómo subir una foto y obtener su URL pública

1. En el Dashboard de Supabase del proyecto → **Storage** → crea un bucket (una sola vez) llamado, por ejemplo, `equipo`, marcado como **público** (Public bucket).
2. Sube la foto dentro de ese bucket (arrastrar y soltar funciona).
3. Click en el archivo subido → **Copy URL** (o "Obtener URL pública"). Te da un link con esta forma:
   `https://<tu-proyecto>.supabase.co/storage/v1/object/public/equipo/wilmar-sosa.jpg`
4. Esa URL completa es la que se guarda en el código/base de datos — no hace falta ninguna conversión (a diferencia de Drive).

## Dónde va cada link

- **Team Leaders** (Wilmar Sosa, Samuel Oropeza y futuros miembros): se guarda en la columna `foto_url` de la tabla `miembros_equipo`. Actualízalo con:
  ```sql
  update miembros_equipo set foto_url = 'https://<tu-proyecto>.supabase.co/storage/v1/object/public/equipo/wilmar-sosa.jpg' where nombre = 'Wilmar Sosa';
  ```
- **Galería del Equipo** (8 fotos del grid): se guardan en el array `GALERIA_EQUIPO` dentro de `app/(estudiante)/dashboard/page.tsx` — reemplaza cada `REEMPLAZAR_URL_PUBLICA_FOTO_0X` por la URL real y haz commit/deploy (a diferencia de los Team Leaders, esta lista vive en código, no en la base de datos).

## Por qué Supabase Storage y no Drive

Un archivo de Drive compartido "para cualquiera con el link" a veces igual redirige a una pantalla de login de Google para visitantes sin sesión (justo lo que pasó con la primera prueba). Un bucket público de Supabase Storage es un archivo estático servido por HTTPS sin ninguna capa de autenticación de por medio — no tiene ese problema, y ya es la misma infraestructura que usa el resto de la app.

`next.config.ts` ya está configurado para permitir optimizar imágenes desde cualquier subdominio `*.supabase.co`.
