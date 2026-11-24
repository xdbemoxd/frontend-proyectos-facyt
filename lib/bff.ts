import { NextResponse } from "next/server";

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
