import { NextRequest } from "next/server";
import {
  forwardBackendResponse,
  invalidJson,
  unauthenticated,
  validationErrors,
} from "@/lib/bff";
import { backendFetch } from "@/lib/backend";
import { reservationRequestSchema } from "@/lib/equipment/schema";

const ALLOWED_PARAMS = [
  "limit",
  "offset",
  "search",
  "project_id",
  "equipment_supplier_id",
];

/** GET /api/equipment/reservations -> reservas (alcance por rol). */
export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) params.set(key, value);
  }
  const suffix = params.size ? `?${params}` : "";

  try {
    const response = await backendFetch(
      `/api/equipment/reservations${suffix}`
    );
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}

/** POST /api/equipment/reservations -> reservar (los tres roles). */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJson();
  }

  const parsed = reservationRequestSchema.safeParse(body);
  if (!parsed.success) return validationErrors(parsed.error.issues);

  try {
    const response = await backendFetch("/api/equipment/reservations", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
