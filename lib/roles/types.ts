/** Rol (private.rol), tal como lo devuelve GET /api/roles. */
export type Role = {
  id: string; // UUID
  name: string; // admin_sistema | aprobador | coordinador
  description: string | null;
};

/** Opción lista para un <select>. */
export type RoleOption = { value: string; label: string };
