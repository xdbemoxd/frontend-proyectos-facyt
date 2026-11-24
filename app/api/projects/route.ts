import { NextRequest, NextResponse } from "next/server"
import { backendFetch } from "@/lib/backend"

const ALLOWED_PARAMS = [
  "limit",
  "offset",
  "search",
  "id_status",
  "id_priority",
  "user_id",
]

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

/** GET /api/projects -> GET /api/projects del backend (Bearer de la sesión). */
export async function GET(request: NextRequest) {
  const params = new URLSearchParams()
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key)
    if (value !== null) params.set(key, value)
  }
  const suffix = params.size ? `?${params}` : ""

  try {
    const response = await backendFetch(`/api/projects${suffix}`)
    return forward(response)
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 })
  }
}
