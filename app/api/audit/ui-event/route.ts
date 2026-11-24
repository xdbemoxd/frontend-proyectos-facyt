import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { entity?: unknown; action?: unknown; summary?: unknown; path?: unknown };
    const entity = typeof body.entity === "string" ? body.entity : "";
    const action = typeof body.action === "string" ? body.action : "";
    const summary = typeof body.summary === "string" ? body.summary : "";
    const path = typeof body.path === "string" ? body.path : "";

    if (!entity || !action || !summary || !path.startsWith("/dashboard")) {
      return NextResponse.json({ detail: "Evento inválido" }, { status: 400 });
    }

    const response = await backendFetch("/api/audit/ui-event", {
      method: "POST",
      body: JSON.stringify({ entity, action, summary, path }),
    });

    return new NextResponse(null, { status: response.status });
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }
}
