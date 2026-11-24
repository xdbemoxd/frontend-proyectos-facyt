import { NextRequest, NextResponse } from "next/server"
import { backendFetch } from "@/lib/backend"
import { priorityPatchSchema } from "@/lib/projects/schema"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

type Context = { params: Promise<{ id: string }> }

/** PATCH /api/projects/:id/priority (justificación obligatoria, RN-3). */
export async function PATCH(request: NextRequest, context: Context) {
  const { id } = await context.params
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { detail: "Identificador inválido" },
      { status: 422 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { detail: "Cuerpo JSON inválido" },
      { status: 422 }
    )
  }

  const parsed = priorityPatchSchema.safeParse(body)
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
    const response = await backendFetch(
      `/api/projects/${encodeURIComponent(id)}/priority`,
      {
        method: "PATCH",
        body: JSON.stringify(parsed.data),
      }
    )
    return forward(response)
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 })
  }
}
