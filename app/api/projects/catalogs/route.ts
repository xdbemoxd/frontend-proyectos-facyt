import { NextResponse } from "next/server"
import { backendFetch } from "@/lib/backend"

async function forward(response: Response) {
  const isServerError = response.status >= 500
  const body = isServerError
    ? JSON.stringify({ detail: "Error interno" })
    : await response.text()
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": isServerError
        ? "application/json"
        : (response.headers.get("content-type") ?? "application/json"),
    },
  })
}

/** GET /api/projects/catalogs -> estados y prioridades reales. */
export async function GET() {
  try {
    const response = await backendFetch("/api/projects/catalogs")
    return forward(response)
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 })
  }
}
