"use server";

import { backendFetch } from "@/lib/backend";
import type { Role } from "@/lib/roles/types";

/**
 * GET /api/user/roles. Corre solo en el servidor: el JWT y BACKEND_URL
 * no llegan al navegador. Lanza Error con un mensaje legible (SWR lo
 * guarda en `error`).
 */
export async function getRoles(): Promise<Role[]> {
  let res: Response;
  try {
    res = await backendFetch("/api/user/roles");
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (res.status === 401) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  if (res.status === 403) throw new Error("No tienes permiso para ver los roles.");
  if (!res.ok) throw new Error("No se pudieron cargar los roles.");

  return (await res.json()) as Role[];
}
