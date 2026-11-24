/**
 * Politica de roles compartida por el menu y las rutas protegidas.
 *
 * Los codigos deben coincidir con `rol.name` del backend. Solo existen tres
 * roles: Administrador del Sistema, Coordinador de Proyecto y
 * Aprobador / Gestor de Inventario.
 *
 * Convencion de `allowedRoles` (la misma en el menu y en `requireRole`):
 * - `undefined`: cualquier usuario autenticado.
 * - `[]`: solo el administrador.
 * - `["aprobador"]`: administrador o aprobador (el admin siempre tiene acceso).
 */
export type Role = "admin_sistema" | "coordinador" | "aprobador";

/** Roles que pueden ver/entrar a una seccion (el admin se agrega siempre). */
export const ADMIN_ONLY: readonly Role[] = [];
export const ADMIN_OR_APPROVER: readonly Role[] = ["aprobador"];

export const ROLE_LABELS: Record<string, string> = {
  admin_sistema: "Administrador del sistema",
  coordinador: "Coordinador de proyecto",
  aprobador: "Aprobador / Gestor de inventario",
};

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

/** Indica si un rol puede acceder a un recurso segun sus roles permitidos. */
export function isRoleAllowed(
  allowedRoles: readonly Role[] | undefined,
  rol: string | null | undefined,
): boolean {
  // Sin restriccion explicita: lo ven todos los usuarios autenticados.
  if (allowedRoles === undefined) return true;

  const role = normalizeRole(rol);
  if (!role) return false;

  // El administrador siempre tiene acceso a todo el sistema.
  if (role === "admin_sistema") return true;

  return allowedRoles.includes(role);
}
