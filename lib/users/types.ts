/** Rol (private.rol). */
export type Role = { id: string; name: string; description: string | null };

/** Usuario (private.user) con su rol resuelto. */
export type AppUser = {
  id: string;
  email: string;
  name: string | null; // null hasta el primer ingreso con Google
  lastname: string | null;
  is_active: boolean;
  rol: { id: string; name: string };
  create_at: string;
};

/** Estado mostrado en la UI. */
export type UserState = "active" | "inactive" | "pending";

export function userState(u: AppUser): UserState {
  if (u.name === null || u.lastname === null) return "pending";
  return u.is_active ? "active" : "inactive";
}

/** POST /users */
export type UserCreateInput = { email: string; id_rol: string };

/** PATCH /users/:id */
export type UserUpdateInput = { id_rol: string; is_active: boolean };
