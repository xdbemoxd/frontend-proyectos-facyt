"use server";

import { backendFetch } from "@/lib/backend";
import type { AppUser, UserCreateInput, UserUpdateInput } from "@/lib/users/types";

/**
 * Capa de acceso a FastAPI. Corre SOLO en el servidor: el JWT del backend
 * y BACKEND_URL nunca llegan al navegador.
 * Devuelve { ok, ... } en vez de lanzar: en producción Next.js oculta
 * el mensaje de los errores lanzados desde el servidor.
 */
export type ServiceResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

async function toError(res: Response, fallback: string): Promise<{ ok: false; status: number; error: string }> {
  let error = fallback;
  if (res.status === 401) error = "Tu sesión expiró. Vuelve a iniciar sesión.";
  else if (res.status === 403) error = "No tienes permiso para esta acción.";
  else if (res.status === 409) error = "Ese correo ya está registrado.";
  else if (res.status === 422) error = "Revisa los datos: correo o rol no válidos.";
  try {
    const body = await res.json();
    // El backend responde detail: "Error" en auth; solo usamos mensajes útiles.
    if (typeof body?.detail === "string" && body.detail !== "Error") error = body.detail;
  } catch {
    /* sin cuerpo JSON */
  }
  return { ok: false, status: res.status, error };
}

const NETWORK_ERROR = { ok: false as const, status: 0, error: "No se pudo conectar con el servidor." };

/** POST /api/user con solo { email, id_rol }. El backend responde 201 y envía los correos. */
export async function postUser(input: UserCreateInput): Promise<ServiceResult<null>> {
  try {
    const res = await backendFetch("/user", {
      method: "POST",
      body: JSON.stringify({ email: input.email, id_rol: input.id_rol }),
    });
    if (!res.ok) return toError(res, "No se pudo registrar el usuario.");
    return { ok: true, data: null };
  } catch {
    return NETWORK_ERROR;
  }
}

// El backend devuelve `rol` como el nombre (texto) y `id_rol` aparte.
// Se acepta también la forma antigua { id, name } por compatibilidad.
type RawUser = Omit<AppUser, "rol"> & { rol: AppUser["rol"] | string | null };
const normalizeUser = (u: RawUser): AppUser => ({
  ...u,
  rol:
    typeof u.rol === "string"
      ? { id: u.id_rol ?? "", name: u.rol }
      : u.rol ?? { id: u.id_rol ?? "", name: "Sin rol" },
});

export type UsersQuery = {
  limit: number;
  offset: number;
  search?: string;
  role_id?: string;
  is_active?: boolean;
};

export type UsersPage = { items: AppUser[]; total: number; limit: number; offset: number };

/** GET /api/user?limit&offset&search&role_id&is_active (solo admin). */
export async function getUsers(query: UsersQuery): Promise<UsersPage> {
  const params = new URLSearchParams({ limit: String(query.limit), offset: String(query.offset) });
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.role_id) params.set("role_id", query.role_id);
  if (query.is_active !== undefined) params.set("is_active", String(query.is_active));

  let res: Response;
  try {
    res = await backendFetch(`/user?${params}`);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }
  if (res.status === 401) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  if (res.status === 403) throw new Error("No tienes permiso para ver los usuarios.");
  if (!res.ok) throw new Error("No se pudieron cargar los usuarios.");

  const page = (await res.json()) as Omit<UsersPage, "items"> & { items: RawUser[] };
  return { ...page, items: page.items.map(normalizeUser) };
}

/** GET /api/user/:id (solo admin). null si no existe. */
export async function getUserById(id: string): Promise<AppUser | null> {
  let res: Response;
  try {
    res = await backendFetch(`/user/${encodeURIComponent(id)}`);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }
  if (res.status === 404 || res.status === 422) return null;
  if (res.status === 401) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  if (res.status === 403) throw new Error("No tienes permiso para ver este usuario.");
  if (!res.ok) throw new Error("No se pudo cargar el usuario.");
  return normalizeUser((await res.json()) as RawUser);
}

/** PATCH /api/user/:id con solo { id_rol, is_active }. */
export async function patchUser(id: string, input: UserUpdateInput): Promise<ServiceResult<AppUser>> {
  try {
    const res = await backendFetch(`/user/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ id_rol: input.id_rol, is_active: input.is_active }),
    });
    if (!res.ok) return toError(res, "No se pudo guardar el usuario.");
    return { ok: true, data: normalizeUser((await res.json()) as RawUser) };
  } catch {
    return NETWORK_ERROR;
  }
}
