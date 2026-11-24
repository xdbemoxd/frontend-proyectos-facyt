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

import { ADMIN_ONLY, ADMIN_OR_APPROVER, isRoleAllowed, type Role } from "@/lib/auth/roles";

export { ROLE_LABELS, normalizeRole, type Role } from "@/lib/auth/roles";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Si se omite, lo ven todos. `[]` = solo admin_sistema. admin_sistema siempre lo ve. */
  roles?: readonly Role[];
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
      roles: ADMIN_OR_APPROVER,
    },
  },
  {
    type: "section",
    title: "Inventario",
    items: [
      { label: "Materias primas", href: "/dashboard/inventory", icon: Boxes },
      { label: "Asignación de materias primas", href: "/dashboard/inventory/dispatch", icon: PackageMinus },
      { label: "Lotes de compra", href: "/dashboard/inventory/lots", icon: PackagePlus },
      { label: "Proveedores", href: "/dashboard/vendors", icon: Truck, roles: ADMIN_OR_APPROVER },
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
      { label: "Prorrateo", href: "/dashboard/overhead", icon: Scale, roles: ADMIN_OR_APPROVER },
    ],
  },
  {
    type: "section",
    title: "Reportes",
    items: [
      { label: "Reportes", href: "/dashboard/reports", icon: FileText },
      { label: "Auditoría", href: "/dashboard/audit", icon: ShieldCheck, roles: ADMIN_ONLY },
    ],
  },
  {
    type: "section",
    title: "Administración",
    items: [{ label: "Usuarios", href: "/dashboard/users", icon: Users, roles: ADMIN_ONLY }],
  },
];

/**
 * Indica si el rol puede ver la opcion de menu.
 * - `roles` omitido: cualquier usuario autenticado.
 * - `roles: ADMIN_ONLY` (`[]`): solo administrador.
 * - En cualquier caso, el administrador ve todo.
 */
export function canSee(item: NavItem, rol: string | null): boolean {
  return isRoleAllowed(item.roles, rol);
}

/** Filtra el menu segun el rol (quita secciones que quedan vacias). */
export function visibleEntries(rol: string | null): NavEntry[] {
  return NAV_ENTRIES.flatMap<NavEntry>((entry) => {
    if (entry.type === "item") return canSee(entry.item, rol) ? [entry] : [];
    const items = entry.items.filter((i) => canSee(i, rol));
    return items.length ? [{ ...entry, items }] : [];
  });
}
