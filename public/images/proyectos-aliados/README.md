# Fotos de "Proyectos Inmobiliarios Aliados" — vía Supabase Storage

Mismo patrón que `public/images/cultura/README.md`: las fotos no se suben a este repositorio, se alojan en un bucket público de Supabase Storage y el código solo guarda la URL pública de cada una en la columna `imagen_url` de `proyectos_aliados`.

## Cómo subir una foto y obtener su URL pública

1. En el Dashboard de Supabase del proyecto → **Storage** → crea un bucket (una sola vez) llamado, por ejemplo, `proyectos`, marcado como **público** (Public bucket). Puede ser el mismo bucket `equipo` si ya existe — no hace falta uno por tabla.
2. Sube cada foto dentro de ese bucket.
3. Click en el archivo subido → **Copy URL** (o "Obtener URL pública"). Te da un link con esta forma:
   `https://<tu-proyecto>.supabase.co/storage/v1/object/public/proyectos/domus-brickell.png`
4. Esa URL completa es la que se guarda en la base de datos — no hace falta ninguna conversión.

## Dónde va cada link

Se guarda en la columna `imagen_url` de la tabla `proyectos_aliados`, por `nombre`:

```sql
update proyectos_aliados set imagen_url = 'https://<tu-proyecto>.supabase.co/storage/v1/object/public/proyectos/domus-brickell.png' where nombre = 'Domus';
```

También puede completarse desde `/admin/proyectos-inmobiliarios-aliados` (campo "URL de imagen"), sin tocar SQL.

## Los 10 proyectos y su foto de referencia

Las 10 fotos ya existen (capturadas del sitio de referencia, con la foto del contacto "In House" superpuesta) — quedan pendientes de subir a Storage:

| Proyecto | Archivo de referencia |
|---|---|
| Domus | `domus-brickell.png` |
| Delano | `delano-miami.png` |
| Palma | `palma-miami.png` |
| The House of Wellness | `house-of-wellness.png` |
| Meliá | `melia-miami.png` |
| Edge House | `edge-house.png` |
| Elle Residences | `elle-residences.png` |
| GZ Tower | `gz-tower.png` |
| Millenia Park | `millenia-park.png` |
| The Standard | `the-standard.png` |

Hasta que se complete `imagen_url`, la tarjeta del proyecto muestra un fondo sólido (`bg-ink-900`) en vez de la foto — no rompe la página.
