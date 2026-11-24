import { NextRequest } from "next/server";
import {
  forwardBackendResponse,
  unauthenticated,
  validationErrors,
} from "@/lib/bff";
import { backendFetch } from "@/lib/backend";
import { overheadPreviewQuerySchema } from "@/lib/overhead/schema";

/** GET /api/overhead/preview -> reparto calculado sin guardar. */
export async function GET(request: NextRequest) {
  const parsed = overheadPreviewQuerySchema.safeParse({
    start_date: request.nextUrl.searchParams.get("start_date") ?? "",
    end_date: request.nextUrl.searchParams.get("end_date") ?? "",
    total_cost: request.nextUrl.searchParams.get("total_cost") ?? "",
    criterion: request.nextUrl.searchParams.get("criterion") ?? "",
  });
  if (!parsed.success) return validationErrors(parsed.error.issues);

  const params = new URLSearchParams(parsed.data);
  try {
    const response = await backendFetch(
      `/api/overhead/preview?${params}`
    );
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
