import { forwardBackendResponse, unauthenticated } from "@/lib/bff";
import { backendFetch } from "@/lib/backend";

/** GET /api/equipment/catalogs -> estados y proveedores reales. */
export async function GET() {
  try {
    const response = await backendFetch("/api/equipment/catalogs");
    return forwardBackendResponse(response);
  } catch {
    return unauthenticated();
  }
}
