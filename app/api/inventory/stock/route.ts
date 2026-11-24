import { NextRequest } from "next/server";
import { forwardBackendResponse, unauthenticated } from "@/lib/bff";
import { backendFetch } from "@/lib/backend";

const ALLOWED_PARAMS = [
  "limit",
  "offset",
  "search",
  "resource_type",
  "only_critical",
];

/** GET /api/inventory/stock -> stock real (Bearer de la sesión). */
export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) params.set(key, value);
  }
  const suffix = params.size ? `?${params}` : "";

  try {
    const response = await backendFetch(`/api/inventory/stock${suffix}`);
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
