/** Utilidades HTTP compartidas por los modulos que ya usan el backend real. */

import { handleSessionExpired } from "@/lib/session";

export async function errorFromResponse(
  response: Response,
  fallback: string
): Promise<Error> {
  if (response.status === 401) {
    handleSessionExpired();
    return new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  }
  if (response.status === 403)
    return new Error("No tienes permiso para esta acción.");
  if (response.status === 422)
    return new Error("Revisa los datos del formulario.");

  try {
    const body = (await response.json()) as { detail?: unknown };
    const detail = body?.detail;
    if (typeof detail === "string" && detail.trim()) return new Error(detail);
    if (Array.isArray(detail)) {
      const first = detail[0] as { msg?: unknown } | undefined;
      if (first && typeof first.msg === "string") return new Error(first.msg);
    }
  } catch {
    /* sin cuerpo JSON */
  }
  return new Error(fallback);
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit,
  fallback: string
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }
  if (!response.ok) throw await errorFromResponse(response, fallback);
  return (await response.json()) as T;
}
