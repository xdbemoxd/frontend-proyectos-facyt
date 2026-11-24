"use server";

import { backendFetch } from "@/lib/backend";

/**
 * POST /api/user/auth/logout: el backend sube token_version y el JWT
 * deja de valer en todos los dispositivos. Si falla (backend caído o
 * token ya vencido) no bloquea el cierre de sesión local.
 */
export async function logoutBackend(): Promise<void> {
  try {
    await backendFetch("/api/user/auth/logout", { method: "POST" });
  } catch {
    /* sin sesión o sin conexión: igual se cierra la sesión en el frontend */
  }
}
