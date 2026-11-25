import { NextRequest, NextResponse } from "next/server"
import { backendFetch } from "@/lib/backend"
import { projectPostSchema } from "@/lib/projects/schema"

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

/** POST /api/projects con validación estricta del body antes de ir al backend. */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ detail: "Cuerpo JSON inválido" }, { status: 422 })
  }

  const parsed = projectPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        detail: parsed.error.issues.map((issue) => ({
          loc: issue.path,
          msg: issue.message,
          type: issue.code,
        })),
      },
      { status: 422 }
    )
  }

  try {
    const response = await backendFetch("/api/projects", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    })
    return forward(response)
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 })
  }
}

