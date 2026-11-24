import { NextRequest, NextResponse } from "next/server";
import { forwardBackendResponse, unauthenticated } from "@/lib/bff";
import { backendFetch } from "@/lib/backend";

/**
 * BFF binario de reportes.
 *
 * GET /api/reports/:type/:format
 *   type   -> expenses | overhead | equipment
 *   format -> xlsx | pdf
 *
 * Reenvía el archivo del backend con el Bearer de la sesión. No se parsea como
 * JSON: se conservan `Content-Type` y `Content-Disposition`. Los errores sí se
 * reenvían como JSON seguro (401/403/422) o como mensaje genérico (5xx).
 */

const ALLOWED_TYPES = new Set(["expenses", "overhead", "equipment"]);
const ALLOWED_FORMATS = new Set(["xlsx", "pdf"]);
const ALLOWED_PARAMS = ["from_date", "to_date", "project_id", "status"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MEDIA_TYPES: Record<string, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

type Context = { params: Promise<{ type: string; format: string }> };

function invalid(detail: string) {
  return NextResponse.json({ detail }, { status: 422 });
}

export async function GET(request: NextRequest, context: Context) {
  const { type, format } = await context.params;
  if (!ALLOWED_TYPES.has(type) || !ALLOWED_FORMATS.has(format)) {
    return NextResponse.json(
      { detail: "Reporte o formato no válido" },
      { status: 404 }
    );
  }

  const params = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value === null) continue;

    if ((key === "from_date" || key === "to_date") && !DATE_RE.test(value)) {
      return invalid("Fecha inválida; usa el formato AAAA-MM-DD");
    }
    if (key === "project_id" && !UUID_RE.test(value)) {
      return invalid("Identificador de proyecto inválido");
    }
    if (key === "status" && (value.length === 0 || value.length > 50)) {
      return invalid("Estado inválido");
    }
    params.set(key, value);
  }

  const suffix = params.size ? `?${params}` : "";
  try {
    const response = await backendFetch(
      `/api/reports/${type}.${format}${suffix}`
    );
    if (!response.ok) return forwardBackendResponse(response);

    const body = await response.arrayBuffer();
    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers.get("content-type") ?? MEDIA_TYPES[format]
    );
    const disposition = response.headers.get("content-disposition");
    if (disposition) headers.set("Content-Disposition", disposition);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");

    return new NextResponse(body, { status: 200, headers });
  } catch {
    return unauthenticated();
  }
}
