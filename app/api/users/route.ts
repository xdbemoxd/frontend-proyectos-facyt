import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { userCreateSchema } from "@/lib/users/schema";
import {
  allowlistedQuery,
  forwardBackendResponse,
  unauthenticated,
  validationErrors,
} from "@/lib/bff";

/** Espeja los query params que acepta GET /api/user del backend. */
const ALLOWED_PARAMS = [
  "limit",
  "offset",
  "search",
  "role_id",
  "is_active",
] as const;

export async function GET(request: NextRequest) {
  const query = allowlistedQuery(request.nextUrl.searchParams, ALLOWED_PARAMS);
  try {
    const response = await backendFetch(`/api/user${query}`);
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ detail: "Cuerpo JSON inválido" }, { status: 422 });
  }

  // Solo { email, id_rol }: zod descarta cualquier otro campo (mass assignment).
  const parsed = userCreateSchema.safeParse(payload);
  if (!parsed.success) return validationErrors(parsed.error.issues);

  try {
    const response = await backendFetch("/api/user", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
