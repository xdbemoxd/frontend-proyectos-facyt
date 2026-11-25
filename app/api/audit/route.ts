import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/backend";
import {
  allowlistedQuery,
  forwardBackendResponse,
  unauthenticated,
} from "@/lib/bff";

/** Espeja los filtros que acepta GET /api/audit del backend. */
const ALLOWED_PARAMS = [
  "limit",
  "offset",
  "entity",
  "action",
  "outcome",
  "status_code",
  "user_id",
  "request_id",
  "path",
  "from_date",
  "to_date",
] as const;

export async function GET(request: NextRequest) {
  const query = allowlistedQuery(request.nextUrl.searchParams, ALLOWED_PARAMS);
  try {
    const response = await backendFetch(`/api/audit${query}`);
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
