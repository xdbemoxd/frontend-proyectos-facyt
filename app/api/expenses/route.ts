import { NextRequest } from "next/server";
import {
  forwardBackendResponse,
  invalidJson,
  unauthenticated,
  validationErrors,
} from "@/lib/bff";
import { backendFetch } from "@/lib/backend";
import { expenseSchema } from "@/lib/expenses/schema";

const ALLOWED_PARAMS = ["limit", "offset", "search", "status", "project_id"];

/** GET /api/expenses -> listado real con alcance por rol. */
export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) params.set(key, value);
  }
  const suffix = params.size ? `?${params}` : "";

  try {
    const response = await backendFetch(`/api/expenses${suffix}`);
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}

/** POST /api/expenses -> admin o coordinador; nace en Borrador. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJson();
  }

  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) return validationErrors(parsed.error.issues);

  try {
    const response = await backendFetch("/api/expenses", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
