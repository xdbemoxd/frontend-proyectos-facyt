import { NextResponse } from "next/server";

/** UUID (cualquier versión). Local y barato: sin dependencias ni red. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/** 422 uniforme para identificadores de ruta inválidos. */
export function invalidId() {
  return NextResponse.json({ detail: "Identificador inválido" }, { status: 422 });
}

/**
 * Reconstruye la query string solo con los parámetros permitidos.
 *
 * Evita que el navegador inyecte parámetros que el backend no espera
 * (p. ej. filtros internos o `debug=true`) y descarta duplicados: se toma
 * el primer valor de cada clave.
 */
export function allowlistedQuery(
  searchParams: URLSearchParams,
  allowed: readonly string[]
): string {
  const params = new URLSearchParams();
  for (const key of allowed) {
    const value = searchParams.get(key);
    if (value !== null) params.set(key, value);
  }
  return params.size ? `?${params}` : "";
}

/**
 * Reenvía la respuesta de FastAPI al navegador.
 *
 * Los errores 5xx se sustituyen por un mensaje genérico: nunca se filtra una
 * traza, SQL ni una ruta interna del backend. El resto de estados (401, 403,
 * 404, 409, 422) conserva el `detail` seguro del backend.
 */
export async function forwardBackendResponse(response: Response) {
  const isServerError = response.status >= 500;
  const body = isServerError
    ? JSON.stringify({ detail: "Error interno" })
    : await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": isServerError
        ? "application/json"
        : (response.headers.get("content-type") ?? "application/json"),
    },
  });
}

export function invalidJson() {
  return NextResponse.json({ detail: "Cuerpo JSON inválido" }, { status: 422 });
}

export function validationErrors(
  issues: { path: PropertyKey[]; message: string; code: string }[]
) {
  return NextResponse.json(
    {
      // Solo loc/msg/type, igual que el handler del backend.
      detail: issues.map((issue) => ({
        loc: issue.path,
        msg: issue.message,
        type: issue.code,
      })),
    },
    { status: 422 }
  );
}

export function unauthenticated() {
  return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
}
