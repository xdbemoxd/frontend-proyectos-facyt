import { auth } from "@/auth";

/**
 * fetch a FastAPI con el Bearer de la sesion. Solo en el servidor.
 * NO lleva "use server" a propósito: devuelve un Response (no serializable)
 * y no debe quedar expuesto como acción llamable desde el navegador.
 * Úsalo solo desde services/*.service.ts.
 */
export async function backendFetch(path: string, init: RequestInit = {}) {
  const session = await auth();
  // auth.ts guarda el JWT de FastAPI en session.user.token
  const token = (session?.user as { token?: string } | undefined)?.token ?? session?.backendToken;
  if (!token) throw new Error("No autenticado");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  return fetch(`${process.env.BACKEND_URL}${path}`, { ...init, headers, cache: "no-store" });
}
