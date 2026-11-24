import { NextRequest, NextResponse } from "next/server";
import {
  forwardBackendResponse,
  invalidJson,
  unauthenticated,
  validationErrors,
} from "@/lib/bff";
import { backendFetch } from "@/lib/backend";
import { rawMaterialUpdateSchema } from "@/lib/inventory/schema";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ supplierItemId: string }> };

/** PATCH /api/inventory/raw-materials/:supplierItemId -> editar material. */
export async function PATCH(request: NextRequest, context: Context) {
  const { supplierItemId } = await context.params;
  if (!UUID_RE.test(supplierItemId)) {
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

  const parsed = rawMaterialUpdateSchema.safeParse(body);
  if (!parsed.success) return validationErrors(parsed.error.issues);

  try {
    const response = await backendFetch(
      `/api/inventory/raw-materials/${encodeURIComponent(supplierItemId)}`,
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
