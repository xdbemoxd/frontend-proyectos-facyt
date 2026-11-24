import { forwardBackendResponse, unauthenticated } from "@/lib/bff";
import { backendFetch } from "@/lib/backend";

/** GET /api/inventory/catalogs -> tipos de recurso y proveedores reales. */
export async function GET() {
  try {
    const response = await backendFetch("/api/inventory/catalogs");
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
