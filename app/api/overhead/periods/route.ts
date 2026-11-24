import { NextRequest } from "next/server";
import {
  forwardBackendResponse,
  invalidJson,
  unauthenticated,
  validationErrors,
} from "@/lib/bff";
import { backendFetch } from "@/lib/backend";
import { closePeriodSchema } from "@/lib/overhead/schema";

const ALLOWED_PARAMS = ["limit", "offset"];

/** GET /api/overhead/periods -> períodos cerrados (solo admin/aprobador). */
export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) params.set(key, value);
  }
  const suffix = params.size ? `?${params}` : "";

  try {
    const response = await backendFetch(`/api/overhead/periods${suffix}`);
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}

/** POST /api/overhead/periods -> cierra y guarda el reparto en el backend. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJson();
  }

  const parsed = closePeriodSchema.safeParse(body);
  if (!parsed.success) return validationErrors(parsed.error.issues);

  try {
    const response = await backendFetch("/api/overhead/periods", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
