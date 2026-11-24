import { NextRequest, NextResponse } from "next/server"
import { backendFetch } from "@/lib/backend"

const ALLOWED_PARAMS = ["limit", "offset", "project_id"]

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

/** GET /api/projects/priority-log -> bitácora real de audith_project. */
export async function GET(request: NextRequest) {
  const params = new URLSearchParams()
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key)
    if (value !== null) params.set(key, value)
  }
  const suffix = params.size ? `?${params}` : ""

  try {
    const response = await backendFetch(`/api/projects/priority-log${suffix}`)
    return forward(response)
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 })
  }
}
