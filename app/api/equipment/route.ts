import { NextRequest } from "next/server";
import {
  forwardBackendResponse,
  invalidJson,
  unauthenticated,
  validationErrors,
} from "@/lib/bff";
import { backendFetch } from "@/lib/backend";
import { equipmentSchema } from "@/lib/equipment/schema";

const ALLOWED_PARAMS = [
  "limit",
  "offset",
  "search",
  "id_status",
  "equipment_id",
];

/** GET /api/equipment -> unidades reales con equipo, proveedor y estado. */
export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) params.set(key, value);
  }
  const suffix = params.size ? `?${params}` : "";

  try {
    const response = await backendFetch(`/api/equipment${suffix}`);
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}

/** POST /api/equipment -> crear unidad (solo admin/aprobador). */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJson();
  }

  const parsed = equipmentSchema.safeParse(body);
  if (!parsed.success) return validationErrors(parsed.error.issues);

  try {
    const response = await backendFetch("/api/equipment", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
