import { mutate } from "swr";
import { fetchJson } from "@/lib/http";
import type {
  InventoryCatalogs,
  RawMaterialInput,
  RawMaterialUpdateInput,
  StockItem,
} from "./types";

/**
 * Clave SWR del flujo principal: apunta al BFF (mismo origen), que reenvía el
 * Bearer al backend y devuelve el stock real de `v_inventory_stock_status`.
 */
export const STOCK_KEY = "/api/inventory/stock?limit=200";
export const INVENTORY_CATALOGS_KEY = "/api/inventory/catalogs";

type RawStockItem = Omit<
  StockItem,
  "current_stock" | "minimun_stock" | "has_movements"
> & {
  current_stock: number | string;
  minimun_stock: number | string;
  has_movements?: boolean;
};

type Paginated<T> = { items: T[]; total: number; limit: number; offset: number };

function normalizeStock(raw: RawStockItem): StockItem {
  return {
    ...raw,
    current_stock: Number(raw.current_stock ?? 0),
    minimun_stock: Number(raw.minimun_stock ?? 0),
    has_movements: Boolean(raw.has_movements),
  };
}

/** Fetcher con la firma de SWR: (key) => Promise<StockItem[]>. */
export async function stockFetcher(key: string): Promise<StockItem[]> {
  const page = await fetchJson<Paginated<RawStockItem>>(
    key,
    { method: "GET" },
    "No se pudo cargar el inventario."
  );
  return page.items.map(normalizeStock);
}

/** GET /api/inventory/catalogs: tipos de recurso y proveedores reales. */
export async function inventoryCatalogsFetcher(
  key: string
): Promise<InventoryCatalogs> {
  return fetchJson<InventoryCatalogs>(
    key,
    { method: "GET" },
    "No se pudieron cargar los catálogos."
  );
}

/** POST /api/inventory/raw-materials (solo admin/aprobador). */
export async function createRawMaterial(
  input: RawMaterialInput
): Promise<StockItem> {
  const created = await fetchJson<RawStockItem>(
    "/api/inventory/raw-materials",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "No se pudo guardar la materia prima."
  );

  const item = normalizeStock(created);
  void mutate(STOCK_KEY);
  return item;
}

/**
 * PATCH /api/inventory/raw-materials/:supplierItemId.
 * El backend responde 409 si la unidad cambió y el material ya tiene
 * movimientos, o si el nombre duplica otro material.
 */
export async function updateRawMaterial(
  supplierItemId: string,
  input: RawMaterialUpdateInput
): Promise<StockItem> {
  const updated = await fetchJson<RawStockItem>(
    `/api/inventory/raw-materials/${encodeURIComponent(supplierItemId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "No se pudo guardar la materia prima."
  );

  const item = normalizeStock(updated);
  void mutate(STOCK_KEY);
  return item;
}

/** GET /api/inventory/stock/:id. null si no existe o el id no es válido. */
export async function getStockItem(
  supplierItemId: string
): Promise<StockItem | null> {
  let response: Response;
  try {
    response = await fetch(
      `/api/inventory/stock/${encodeURIComponent(supplierItemId)}`,
      { method: "GET" }
    );
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (response.status === 404 || response.status === 422) return null;
  if (response.status === 403)
    throw new Error("No tienes permiso para ver este registro.");
  if (!response.ok) throw new Error("No se pudo cargar la materia prima.");
  return normalizeStock((await response.json()) as RawStockItem);
}
