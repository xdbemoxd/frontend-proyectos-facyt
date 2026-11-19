import { MOCK_ROLES, MOCK_USERS } from "./mock";
import type { AppUser, UserCreateInput, UserUpdateInput } from "./types";

export const USERS_KEY = "/users";

let users: AppUser[] = [...MOCK_USERS];
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/** MAÑANA: fetch(`/api${key}`) */
export async function usersFetcher(_key: string): Promise<AppUser[]> {
  await delay();
  return [...users].sort((a, b) => a.email.localeCompare(b.email));
}

/** MAÑANA: fetch(`/api/users/${id}`) */
export async function getUser(id: string): Promise<AppUser | null> {
  await delay(300);
  return users.find((u) => u.id === id) ?? null;
}

/**
 * MAÑANA: POST /api/users. FastAPI responde 409 si el correo ya existe
 * (UNIQUE de email en la BD).
 */
export async function createUser(input: UserCreateInput): Promise<AppUser> {
  await delay();
  const email = input.email.toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error("Ese correo ya está registrado.");
  }
  const rol = MOCK_ROLES.find((r) => r.id === input.id_rol);
  if (!rol) throw new Error("Rol no válido.");
  const user: AppUser = {
    id: crypto.randomUUID(), email, name: null, lastname: null, is_active: false,
    rol: { id: rol.id, name: rol.name }, create_at: new Date().toISOString(),
  };
  users = [...users, user];
  return user;
}

/** MAÑANA: PATCH /api/users/:id */
export async function updateUser(id: string, input: UserUpdateInput, currentUserEmail?: string | null): Promise<AppUser> {
  await delay();
  const user = users.find((u) => u.id === id);
  const rol = MOCK_ROLES.find((r) => r.id === input.id_rol);
  if (!user || !rol) throw new Error("Usuario o rol no válido.");

  const isSelf = !!currentUserEmail && user.email.toLowerCase() === currentUserEmail.toLowerCase();
  if (isSelf && (rol.name !== user.rol.name || !input.is_active)) {
    throw new Error("No puedes cambiar tu propio rol ni desactivar tu cuenta.");
  }
  const admins = users.filter((u) => u.rol.name === "admin_sistema" && u.is_active);
  if (user.rol.name === "admin_sistema" && admins.length === 1 && (rol.name !== "admin_sistema" || !input.is_active)) {
    throw new Error("Debe quedar al menos un administrador activo.");
  }

  const updated: AppUser = { ...user, rol: { id: rol.id, name: rol.name }, is_active: input.is_active };
  users = users.map((u) => (u.id === id ? updated : u));
  return updated;
}
