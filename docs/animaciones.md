# Guía de Construcción y Uso de Animaciones Premium

Esta guía detalla el sistema de animación utilizado en la plataforma **Team 100% Real Estate**, construido con **Framer Motion** y **Tailwind CSS**. Puedes utilizar estos patrones para replicar la experiencia premium y dinámica en las demás páginas de la plataforma.

---

## 1. Patrón de Entrada Fluida (Fade-Up con Blur)

Este efecto suaviza la transición de los paneles al cargar la página. En lugar de aparecer de golpe, los elementos suben ligeramente y cambian de borrosos a nítidos.

### Cuándo utilizarlo
- Contenedores principales y tarjetas de contenido en el primer renderizado de la página.
- Secciones completas de cuadrículas (Grids).

### Implementación en Framer Motion

```tsx
import { motion } from "framer-motion";

// 1. Definir los Variants para stagger (escalonado)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Espera 100ms entre cada hijo
      delayChildren: 0.05,
    },
  },
};

// 2. Definir los Variants para el elemento
const cardVariants = {
  hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // Ease Out premium (Quart/Expo)
    },
  },
};

export default function MiSeccion() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 sm:grid-cols-2"
    >
      <motion.div variants={cardVariants} className="bg-white/5 p-6 rounded-xl">
        Tarjeta 1
      </motion.div>
      <motion.div variants={cardVariants} className="bg-white/5 p-6 rounded-xl">
        Tarjeta 2
      </motion.div>
    </motion.div>
  );
}
```

---

## 2. Animaciones de Interacción (Hover y Actives)

Hacen que la interfaz se sienta "viva" y responda a las acciones físicas del usuario.

### A. Desplazamiento Lateral Sutil (Listas de Enlaces)
Excelente para listas de pasos, accesos directos o menús verticales.

```tsx
<motion.li
  whileHover={{ x: 4 }}
  transition={{ duration: 0.2 }}
  className="flex items-center gap-3"
>
  <span>Contenido</span>
</motion.li>
```

### B. Zoom y Glow de Tarjeta (Cards Principales)
Ideal para tarjetas de catálogo, líderes de equipo o planes.

```tsx
<motion.div
  whileHover={{ y: -6 }}
  transition={{ duration: 0.3 }}
  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-950"
>
  <Image
    src="/imagen.jpg"
    alt="Nombre"
    fill
    className="object-cover transition-transform duration-700 group-hover:scale-105"
  />
</motion.div>
```

### C. Escalamiento Micro (Botones y Enlaces de Acción)
Utilizado para botones (CTAs) de gran relevancia para dar sensación de pulsación táctil.

```tsx
<Link
  href="/destino"
  className="inline-flex h-12 items-center justify-center rounded-xl bg-whatsapp px-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
>
  Acción
</Link>
```

---

## 3. Guía de Estilos y Visibilidad Opaque (Dropdowns)

Para evitar que los menús desplegables (dropdowns) se mezclen con el contenido dinámico debajo de ellos, asegúrate de aplicar siempre:
1. **Fondo Opaque Sólido**: Utilizar `bg-ink-950` o `bg-ink-900` puro en lugar de opacidades transparentes.
2. **Backdrop Blur**: Añadir `backdrop-blur-xl`.
3. **Z-Index Alto**: Asignar un `z-index` elevado (por ejemplo, `z-50`).
4. **Sombra Profunda**: Usar `shadow-[0_20px_50px_rgba(0,0,0,0.65)]`.

### Ejemplo de menú desplegable premium:
```tsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-ink-950 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl"
>
  {/* Elementos del menú */}
</motion.div>
```
