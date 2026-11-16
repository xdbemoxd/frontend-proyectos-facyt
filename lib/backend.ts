import { auth } from "@/auth";

/** fetch a FastAPI con el Bearer de la sesion. Solo en el servidor. */
export async function backendFetch(path: string, init: RequestInit = {}) {
  const session = await auth();
  if (!session?.backendToken) throw new Error("No autenticado");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.backendToken}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  return fetch(`${process.env.BACKEND_URL}${path}`, { ...init, headers, cache: "no-store" });
}
