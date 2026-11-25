import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/backend";
import {
  forwardBackendResponse,
  invalidId,
  isUuid,
  unauthenticated,
  validationErrors,
} from "@/lib/bff";
import { userPatchSchema } from "@/lib/users/schema";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!isUuid(id)) return invalidId();

  try {
    const response = await backendFetch(`/api/user/${encodeURIComponent(id)}`);
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!isUuid(id)) return invalidId();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrors([
      { path: [], message: "Cuerpo JSON inválido", code: "invalid_json" },
    ]);
  }

  const parsed = userPatchSchema.safeParse(body);
  if (!parsed.success) return validationErrors(parsed.error.issues);

  try {
    const response = await backendFetch(
      `/api/user/${encodeURIComponent(id)}`,
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
