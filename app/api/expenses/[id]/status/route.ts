import { NextRequest, NextResponse } from "next/server";
import {
  forwardBackendResponse,
  invalidJson,
  unauthenticated,
  validationErrors,
} from "@/lib/bff";
import { backendFetch } from "@/lib/backend";
import { expenseStatusSchema } from "@/lib/expenses/schema";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ id: string }> };

/** PATCH /api/expenses/:id/status -> transición validada en el backend. */
export async function PATCH(request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { detail: "Identificador inválido" },
      { status: 422 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJson();
  }

  const parsed = expenseStatusSchema.safeParse(body);
  if (!parsed.success) return validationErrors(parsed.error.issues);

  try {
    const response = await backendFetch(
      `/api/expenses/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(parsed.data),
      }
    );
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
