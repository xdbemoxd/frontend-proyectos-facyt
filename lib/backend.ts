import { cache } from "react";
import { headers as nextHeaders } from "next/headers";
import { getToken } from "next-auth/jwt";

/** Mismo criterio que auth.config.ts (`useSecureCookies`). */
const SECURE_COOKIES = process.env.NODE_ENV === "production";

/**
 * Lee el JWT del backend desde la cookie cifrada de NextAuth.
 *
 * - No hace ninguna petición de red: decodifica el JWE localmente.
 * - `cache()` memoriza el resultado durante el request, así que varias
 *   llamadas a backendFetch en el mismo render comparten una sola decodificación.
 * - El token nunca se devuelve al navegador.
 */
const readBackendToken = cache(async (): Promise<string | null> => {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Falta AUTH_SECRET");

  // Solo la cookie HttpOnly: se ignora cualquier `Authorization` que envíe
  // el cliente para que el BFF no acepte credenciales fuera de la sesión.
  const incoming = new Headers(await nextHeaders());
  incoming.delete("authorization");

  const token = await getToken({
    req: { headers: incoming },
    secret,
    secureCookie: SECURE_COOKIES,
  });

  const backendToken = token?.backendToken;
  return typeof backendToken === "string" && backendToken ? backendToken : null;
});

/**
 * fetch a FastAPI con el Bearer de la sesión y el origen del cliente.
 * Solo en el servidor.
 * NO lleva "use server" a propósito: devuelve un Response (no serializable)
 * y no debe quedar expuesto como acción llamable desde el navegador.
 * Úsalo solo desde services/*.service.ts.
 */
export async function backendFetch(path: string, init: RequestInit = {}) {
  const [backendToken, requestHeaders] = await Promise.all([
    readBackendToken(),
    nextHeaders(),
  ]);
  if (!backendToken) throw new Error("No autenticado");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${backendToken}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  // Propaga el origen real del cliente para que la auditoría del backend
  // registre IP y user-agent. Solo se copian cabeceras que ya existen:
  // cero llamadas adicionales y nada de esto llega al navegador.
  for (const name of ["x-forwarded-for", "x-real-ip", "user-agent"]) {
    const value = requestHeaders.get(name);
    if (value && !headers.has(name)) headers.set(name, value);
  }

  return fetch(`${process.env.BACKEND_URL}${path}`, { ...init, headers, cache: "no-store" });
}
