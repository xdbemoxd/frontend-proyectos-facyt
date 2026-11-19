import {
  Boxes,
  CalendarClock,
  FileText,
  LayoutDashboard,
  ListOrdered,
  PackageMinus,
  PackagePlus,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Roles del enunciado (deben coincidir con `rol.name` del backend). */
export type Role = "admin_sistema" | "coordinador" | "aprobador";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Si se omite, lo ven todos. `[]` = solo admin_sistema. admin_sistema siempre lo ve. */
  roles?: Role[];
};

/**
 * Entrada del menu superior:
 * - `item`: enlace directo.
 * - `section`: menu desplegable con varias opciones.
 */
export type NavEntry =
  | { type: "item"; item: NavItem }
  | { type: "section"; title: string; items: NavItem[] };

/** Menu principal, organizado segun los requerimientos del enunciado. */
export const NAV_ENTRIES: NavEntry[] = [
  // Dashboard = listado de proyectos + KPIs
  { type: "item", item: { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard } },
  {
    type: "item",
    item: {
      label: "Priorización",
      href: "/dashboard/priority",
      icon: ListOrdered,
      roles: ["aprobador"],
    },
  },
  {
    type: "section",
    title: "Inventario",
    items: [
      { label: "Materias primas", href: "/dashboard/inventory", icon: Boxes },
      { label: "Asignación de materias primas", href: "/dashboard/inventory/dispatch", icon: PackageMinus },
      { label: "Lotes de compra", href: "/dashboard/inventory/lots", icon: PackagePlus, roles: ["aprobador"] },
      { label: "Proveedores", href: "/dashboard/vendors", icon: Truck, roles: ["aprobador"] },
    ],
  },
  {
    type: "section",
    title: "Equipamiento",
    items: [
      { label: "Equipos", href: "/dashboard/equipment", icon: Wrench },
      { label: "Reservas", href: "/dashboard/equipment/reservations", icon: CalendarClock },
    ],
  },
  {
    type: "section",
    title: "Finanzas",
    items: [
      { label: "Solicitudes de gasto", href: "/dashboard/expenses", icon: Receipt },
      { label: "Prorrateo", href: "/dashboard/overhead", icon: Scale, roles: ["aprobador"] },
    ],
  },
  {
    type: "section",
    title: "Reportes",
    items: [
      { label: "Reportes", href: "/dashboard/reports", icon: FileText },
      { label: "Auditoría", href: "/dashboard/audit", icon: ShieldCheck, roles: [] },
    ],
  },
  {
    type: "section",
    title: "Administración",
    items: [{ label: "Usuarios", href: "/dashboard/users", icon: Users, roles: [] }],
  },
];

/**
 * Convierte el nombre de rol que manda el backend al codigo del front.
 * Acepta variantes: "Administrador", "admin", "Aprobador / Gestor", etc.
 */
export function normalizeRole(rol: string | null | undefined): Role | null {
  if (!rol) return null;
  const r = rol.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  if (r.startsWith("admin")) return "admin_sistema";
  if (r.startsWith("aprob") || r.includes("gestor")) return "aprobador";
  if (r.startsWith("coord")) return "coordinador";
  return null;
}

/**
 * ACCESO COMPLETO: por ahora todos ven todo el menu.
 * Cuando el backend envie el menu (segun el rol del usuario), el filtrado
 * lo hara FastAPI y esta funcion ya no sera necesaria. Los permisos reales
 * siempre se validan en el backend.
 */
export function canSee(_item: NavItem, _rol: string | null): boolean {
  return true;
}

/** Filtra el menu segun el rol (quita secciones que quedan vacias). */
export function visibleEntries(rol: string | null): NavEntry[] {
  return NAV_ENTRIES.flatMap<NavEntry>((entry) => {
    if (entry.type === "item") return canSee(entry.item, rol) ? [entry] : [];
    const items = entry.items.filter((i) => canSee(i, rol));
    return items.length ? [{ ...entry, items }] : [];
  });
}

export const ROLE_LABELS: Record<string, string> = {
  admin_sistema: "Administrador del sistema",
  coordinador: "Coordinador de proyecto",
  aprobador: "Aprobador / Gestor de inventario",
};
