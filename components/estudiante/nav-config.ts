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
      { label: "Curso de Rentas", href: "/curso-de-rentas" },
      { label: "Acelerador Pro", href: null },
      { label: "Acelerador Starter", href: null },
    ],
  },
  {
    label: "Negocio",
    items: [
      { label: "Proyectos Inmobiliarios Aliados", href: "/proyectos-inmobiliarios-aliados" },
      { label: "Aliados Estratégicos", href: "/aliados" },
      { label: "Transacciones", href: null },
      { label: "CRM", href: "/crm" },
      { label: "Marketing", href: "/marketing" },
    ],
  },
  {
    label: "Comunidad",
    items: [
      { label: "Calendario", href: "/calendario" },
      { label: "Eventos", href: null },
      { label: "Herramientas", href: "/herramientas" },
      { label: "Construcción de Equipo", href: null },
    ],
  },
  {
    label: "Soporte",
    items: [
      { label: "Soporte", href: "/soporte" },
      { label: "Oficinas", href: "/oficinas" },
    ],
  },
];
