/**
 * Descarga de reportes XLSX/PDF generados por el backend.
 *
 * El navegador pide al BFF del mismo origen, que reenvía el Bearer de la sesión
 * y devuelve el binario. Aquí solo se dispara la descarga; nunca se parsea el
 * archivo como JSON.
 */

export type ReportType = "expenses" | "overhead" | "equipment";
export type ReportFormat = "xlsx" | "pdf";

export type ReportDownloadParams = {
  from_date?: string;
  to_date?: string;
  project_id?: string;
  status?: string;
};

const PARAM_KEYS = [
  "from_date",
  "to_date",
  "project_id",
  "status",
] as const;

function filenameFromDisposition(
  header: string | null,
  fallback: string
): string {
  if (!header) return fallback;

  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      /* encabezado mal formado: se usa el fallback */
    }
  }

  const quoted = /filename="?([^";]+)"?/i.exec(header);
  return quoted?.[1]?.trim() || fallback;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function errorMessage(response: Response): Promise<string> {
  if (response.status === 401) {
    return "Tu sesión expiró. Vuelve a iniciar sesión.";
  }
  if (response.status === 403) {
    return "No tienes permiso para exportar este reporte.";
  }
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === "string" && body.detail.trim()) {
      return body.detail;
    }
    if (Array.isArray(body.detail)) {
      const first = body.detail[0] as { msg?: unknown } | undefined;
      if (first && typeof first.msg === "string") return first.msg;
    }
  } catch {
    /* respuesta sin JSON */
  }
  return "No se pudo generar el reporte.";
}

export async function downloadReport(
  type: ReportType,
  format: ReportFormat,
  params: ReportDownloadParams = {}
): Promise<void> {
  const search = new URLSearchParams();
  for (const key of PARAM_KEYS) {
    const value = params[key];
    if (value) search.set(key, value);
  }
  const suffix = search.size ? `?${search}` : "";

  let response: Response;
  try {
    response = await fetch(`/api/reports/${type}/${format}${suffix}`, {
      method: "GET",
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error("El archivo generado está vacío.");
  }

  triggerDownload(
    blob,
    filenameFromDisposition(
      response.headers.get("content-disposition"),
      `${type}.${format}`
    )
  );
}
