# Product

## Register

product

## Users

Dos roles reales sobre Supabase Auth:

- **Estudiante**: profesional o líder ejecutivo que compra/toma cursos de coaching ejecutivo (B2B2C, ~1000 estudiantes objetivo). Llega desde la landing pública, se registra o inicia sesión, y pasa a `(estudiante)` para ver su catálogo/progreso.
- **Admin**: cuenta creada por seed (sin sign-up propio), gestiona cursos/lecciones desde `(admin)`.

El login es la puerta entre la landing de marca y el producto: debe sentirse ya "del producto" (confianza, seriedad ejecutiva), no como un formulario genérico desconectado del resto del sitio.

## Product Purpose

CoachPro es una plataforma de venta y consumo de cursos de coaching ejecutivo (LMS B2B2C) construida en Next.js App Router + Supabase (Auth, Postgres con RLS, Storage) + Mux + Stripe (fases posteriores). Éxito = un usuario puede registrarse, iniciar sesión, y llegar a su contenido sin fricción; un admin entra a rutas protegidas separadas.

## Brand Personality

Confiado, exclusivo, editorial. Ejecutivo-premium: dorado sobre negro casi puro (`ink-950`), tipografía display (Bricolage Grotesque) para peso y carácter, mono (IBM Plex Mono) para detalles técnicos/etiquetas en mayúsculas trackeadas. Nada de calidez tipo SaaS-cream ni de generic-dashboard azul/gris.

## Anti-references

Sin anti-referencias explícitas del usuario más allá de: no caer en el genérico "SaaS card centrado, gradiente sutil, inputs grises" que domina los login de productos B2C. El login debe leerse como parte de la misma marca dorado/negro/editorial que la landing, no como una plantilla de auth desconectada.

## Design Principles

- El login es continuación de marca, no una pantalla aislada: mismos tokens (`ink`, `gold`, `mist`), misma tipografía, mismo tono editorial-ejecutivo que la landing.
- Confianza antes que fricción: estados de error, carga y validación deben ser claros e inmediatos, sin ambigüedad sobre qué falló.
- Jerarquía por peso y color, no por decoración: el dorado se reserva para acciones y acentos, no se satura la pantalla.
- Un solo camino obvio: email/password y "Continuar con Google" conviven sin competir por atención.

## Accessibility & Inclusion

WCAG 2.1 AA como estándar: contraste ≥4.5:1 en texto de cuerpo y placeholders (revisar `mist-500` sobre `ink-950`/`ink-900`), estados de foco visibles en inputs y botones, mensajes de error anunciados (`role="alert"`, ya presente), soporte de `prefers-reduced-motion` en cualquier animación nueva. Sin requisitos adicionales conocidos de usuarios.
