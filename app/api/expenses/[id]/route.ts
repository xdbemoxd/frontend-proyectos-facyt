import { NextResponse } from "next/server";
import { forwardBackendResponse, unauthenticated } from "@/lib/bff";
import { backendFetch } from "@/lib/backend";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ id: string }> };

/** GET /api/expenses/:id -> detalle real con alcance por proyecto. */
export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { detail: "Identificador inválido" },
      { status: 422 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/expenses/${encodeURIComponent(id)}`
    );
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
