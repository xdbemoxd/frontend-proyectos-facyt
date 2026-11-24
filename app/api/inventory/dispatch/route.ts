import { NextRequest } from "next/server";
import {
  forwardBackendResponse,
  invalidJson,
  unauthenticated,
  validationErrors,
} from "@/lib/bff";
import { backendFetch } from "@/lib/backend";
import { dispatchSchema } from "@/lib/dispatch/schema";

const ALLOWED_PARAMS = [
  "limit",
  "offset",
  "search",
  "project_id",
  "supplier_item_id",
];

/** GET /api/inventory/dispatch -> bitácora real (coordinador: sus proyectos). */
export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) params.set(key, value);
  }
  const suffix = params.size ? `?${params}` : "";

  try {
    const response = await backendFetch(`/api/inventory/dispatch${suffix}`);
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}

/** POST /api/inventory/dispatch -> solo admin/aprobador; el trigger resta stock. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJson();
  }

  const parsed = dispatchSchema.safeParse(body);
  if (!parsed.success) return validationErrors(parsed.error.issues);

  try {
    const response = await backendFetch("/api/inventory/dispatch", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
