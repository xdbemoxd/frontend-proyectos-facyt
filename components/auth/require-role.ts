import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isRoleAllowed, type Role } from "@/lib/auth/roles";

/**
 * Guard reutilizable para Server Components (paginas y layouts).
 *
 * - Sin sesion: redirige a /login (el proxy ya lo exige; esto es defensa en
 *   profundidad).
 * - Rol sin permiso: redirige a /unauthorized.
 *
 * Usa la misma politica que el menu (ver `lib/auth/roles.ts`):
 * `[]` = solo admin, `undefined` = cualquier autenticado, y el administrador
 * siempre tiene acceso.
 */
export async function requireRole(allowedRoles?: readonly Role[]) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isRoleAllowed(allowedRoles, session.user.rol)) {
    redirect("/unauthorized?error=RoleNotAllowed");
  }
  return session;
}
