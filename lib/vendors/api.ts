import { MOCK_VENDORS } from "./mock";
import type { Vendor, VendorInput } from "./types";

/** Clave de cache: con SWR sera la URL del endpoint. */
export const VENDORS_KEY = "/vendors";

// Copia en memoria para que los "nuevos" proveedores se vean en el listado.
let store: Vendor[] = [...MOCK_VENDORS];

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetcher con la firma de SWR: (key) => Promise<data>.
 * MAÑANA:
 *   const res = await fetch(`/api${key}`);
 *   if (!res.ok) throw new Error("No se pudieron cargar los proveedores");
 *   return res.json();
 */
export async function vendorsFetcher(_key: string): Promise<Vendor[]> {
  await delay();
  return [...store].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/**
 * Crear proveedor.
 * MAÑANA:
 *   const res = await fetch("/api/vendors", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(input),
 *   });
 *   if (!res.ok) throw new Error("No se pudo guardar el proveedor");
 *   return res.json();
 */
export async function createVendor(input: VendorInput): Promise<Vendor> {
  await delay();
  const exists = store.some((v) => v.name.toLowerCase() === input.name.toLowerCase());
  if (exists) throw new Error("Ya existe un proveedor con ese nombre.");

  const now = new Date().toISOString();
  const vendor: Vendor = { id: crypto.randomUUID(), ...input, create_at: now, updated_at: now };
  store = [...store, vendor];
  return vendor;
}
