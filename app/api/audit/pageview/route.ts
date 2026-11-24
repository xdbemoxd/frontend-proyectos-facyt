import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { path?: unknown };
    const path = typeof body.path === "string" ? body.path : "";

    if (!path.startsWith("/")) {
      return NextResponse.json({ detail: "Ruta inválida" }, { status: 400 });
    }

    const response = await backendFetch("/api/audit/pageview", {
      method: "POST",
      body: JSON.stringify({ path }),
    });

    return new NextResponse(null, { status: response.status });
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }
}
