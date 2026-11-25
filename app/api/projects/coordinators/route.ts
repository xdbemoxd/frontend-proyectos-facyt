import { NextResponse } from "next/server"
import { backendFetch } from "@/lib/backend"

/** GET /api/projects/coordinators -> coordinadores activos (solo admin). */
export async function GET() {
  try {
    const response = await backendFetch("/api/projects/coordinators")
    const isServerError = response.status >= 500
    const body = isServerError
      ? JSON.stringify({ detail: "Error interno" })
      : await response.text()
    return new NextResponse(body, {
      status: response.status,
      headers: { "content-type": "application/json" },
    })
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 })
  }
}
