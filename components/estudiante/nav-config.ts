export type NavItem = {
  label: string;
  href: string | null;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Inicio",
    items: [{ label: "Bienvenida", href: "/dashboard" }],
  },
  {
    label: "Formación",
    items: [
      { label: "Sistema 100+", href: "/sistema-100" },
      { label: "Clases", href: "/clases" },
      { label: "Curso de Rentas", href: null },
      { label: "Acelerador Pro", href: null },
      { label: "Acelerador Starter", href: null },
    ],
  },
  {
    label: "Negocio",
    items: [
      { label: "Proyectos Inmobiliarios Aliados", href: null },
      { label: "Aliados Estratégicos", href: null },
      { label: "Transacciones", href: null },
      { label: "CRM", href: null },
      { label: "Marketing", href: null },
    ],
  },
  {
    label: "Comunidad",
    items: [
      { label: "Calendario", href: null },
      { label: "Eventos", href: null },
      { label: "Herramientas", href: null },
      { label: "Construcción de Equipo", href: null },
    ],
  },
  {
    label: "Soporte",
    items: [
      { label: "Soporte", href: null },
      { label: "Oficinas", href: null },
    ],
  },
];
