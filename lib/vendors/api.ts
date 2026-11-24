import { mutate } from "swr";
import { auditUiEvent } from "@/lib/audit/ui-event";
import { fetchJson } from "@/lib/http";
import type { Vendor, VendorInput } from "./types";

/** Clave SWR del flujo principal: proveedores reales vía BFF. */
export const VENDORS_KEY = "/api/vendors?limit=200";

type Paginated<T> = { items: T[]; total: number; limit: number; offset: number };

/** Fetcher SWR: lista paginada de proveedores reales. */
export async function vendorsFetcher(key: string): Promise<Vendor[]> {
  const page = await fetchJson<Paginated<Vendor>>(
    key,
    { method: "GET" },
    "No se pudieron cargar los proveedores."
  );
  return page.items;
}

/** POST /api/vendors (solo admin/aprobador). */
export async function createVendor(input: VendorInput): Promise<Vendor> {
  const vendor = await fetchJson<Vendor>(
    "/api/vendors",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "No se pudo guardar el proveedor."
  );

  void mutate(VENDORS_KEY);
  auditUiEvent({
    entity: "Vendor",
    action: "create",
    summary: vendor.name,
  });
  return vendor;
}

/** GET /api/vendors/:id. null si no existe o el id no es válido. */
export async function getVendor(id: string): Promise<Vendor | null> {
  let response: Response;
  try {
    response = await fetch(`/api/vendors/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (response.status === 404 || response.status === 422) return null;
  if (response.status === 403)
    throw new Error("No tienes permiso para ver este proveedor.");
  if (!response.ok) throw new Error("No se pudo cargar el proveedor.");
  return (await response.json()) as Vendor;
}

/**
 * PATCH /api/vendors/:id con `expected_updated_at` (bloqueo optimista).
 * El backend responde 409 si el nombre ya existe o si otra persona cambió el
 * registro mientras se editaba.
 */
export async function updateVendor(
  id: string,
  input: VendorInput,
  expectedUpdatedAt: string
): Promise<Vendor> {
  const vendor = await fetchJson<Vendor>(
    `/api/vendors/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        expected_updated_at: expectedUpdatedAt,
      }),
    },
    "No se pudo guardar el proveedor."
  );

  void mutate(VENDORS_KEY);
  auditUiEvent({
    entity: "Vendor",
    action: "update",
    summary: vendor.name,
  });
  return vendor;
}
