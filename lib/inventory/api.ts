import { mutate } from "swr";
import { MOCK_VENDORS } from "@/lib/vendors/mock";
import { MOCK_STOCK, RESOURCE_TYPES } from "./mock";
import type { RawMaterialInput, RawMaterialUpdateInput, StockItem } from "./types";

/** Clave de cache: con SWR sera la URL del endpoint (GET /inventory/stock). */
export const STOCK_KEY = "/inventory/stock";

let store: StockItem[] = [...MOCK_STOCK];

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/** Misma regla que la vista SQL. */
function statusOf(current: number, min: number): Pick<StockItem, "stock_status" | "is_critical"> {
  return {
    stock_status: current <= 0 ? "Agotado" : current <= min ? "Alerta Stock Mínimo" : "Normal",
    is_critical: current <= min,
  };
}

/**
 * MAÑANA:
 *   const res = await fetch(`/api${key}`);
 *   if (!res.ok) throw new Error("No se pudo cargar el inventario");
 *   const rows = await res.json();
 *   // Numeric llega como string desde FastAPI:
 *   return rows.map((r) => ({ ...r, current_stock: Number(r.current_stock), minimun_stock: Number(r.minimun_stock) }));
 */
export async function stockFetcher(_key: string): Promise<StockItem[]> {
  await delay();
  return [...store].sort((a, b) => a.resource_name.localeCompare(b.resource_name, "es"));
}

/** MAÑANA: POST /api/inventory/raw-materials con `input`. */
export async function createRawMaterial(input: RawMaterialInput): Promise<StockItem> {
  await delay();
  const vendor = MOCK_VENDORS.find((v) => v.id === input.vendors_id);
  const type = RESOURCE_TYPES.find((t) => t.id === input.resource_type_id);
  if (!vendor || !type) throw new Error("Proveedor o tipo de recurso no válido.");

  const existing = store.find((s) => s.resource_name.toLowerCase() === input.name.toLowerCase());
  // Mismo UNIQUE que la BD: (raw_materials_id, vendors_id)
  if (existing && store.some((s) => s.resource_id === existing.resource_id && s.vendor_name === vendor.name)) {
    throw new Error("Esa materia prima ya está registrada con ese proveedor.");
  }

  const item: StockItem = {
    supplier_item_id: crypto.randomUUID(),
    resource_id: existing?.resource_id ?? crypto.randomUUID(),
    resource_name: existing?.resource_name ?? input.name,
    resource_type: existing?.resource_type ?? type.name,
    unit: existing?.unit ?? input.unit,
    vendor_name: vendor.name,
    current_stock: 0,
    minimun_stock: input.minimun_stock,
    ...statusOf(0, input.minimun_stock),
  };
  store = [...store, item];
  void mutate(STOCK_KEY);
  return item;
}

/**
 * Solo para el MOCK: suma (o resta) stock como lo hara el trigger de la BD
 * al insertar un lote (o un despacho). Con el backend real esto desaparece.
 */
export function mockAdjustStock(supplierItemId: string, delta: number): void {
  store = store.map((s) => {
    if (s.supplier_item_id !== supplierItemId) return s;
    const current = Math.round((s.current_stock + delta) * 100) / 100;
    if (current < 0) throw new Error("Stock insuficiente.");
    return { ...s, current_stock: current, ...statusOf(current, s.minimun_stock) };
  });
  void mutate(STOCK_KEY);
}

export const getStockSnapshot = (): StockItem[] => store;

/** MAÑANA: fetch(`/api/inventory/stock/${id}`) */
export async function getStockItem(supplierItemId: string): Promise<StockItem | null> {
  await delay(300);
  return store.find((s) => s.supplier_item_id === supplierItemId) ?? null;
}

/**
 * ¿El material ya tuvo entradas o salidas? Si sí, su unidad no se puede cambiar
 * (los lotes y despachos viejos quedarían en otra unidad).
 * MOCK: se aproxima con "tiene stock". Con el backend: existe algún lote o despacho.
 */
export function hasStockMovements(resourceId: string): boolean {
  return store.some((s) => s.resource_id === resourceId && s.current_stock > 0);
}

/**
 * MAÑANA: PATCH /api/inventory/raw-materials/:supplier_item_id con `input`.
 * El backend rechaza (409) el cambio de unidad si hay lotes o despachos.
 */
export async function updateRawMaterial(supplierItemId: string, input: RawMaterialUpdateInput): Promise<StockItem> {
  await delay();
  const item = store.find((s) => s.supplier_item_id === supplierItemId);
  if (!item) throw new Error("Materia prima no encontrada.");
  const type = RESOURCE_TYPES.find((t) => t.id === input.resource_type_id);
  if (!type) throw new Error("Tipo de recurso no válido.");
  if (input.unit !== item.unit && hasStockMovements(item.resource_id)) {
    throw new Error("No se puede cambiar la unidad: el material ya tiene movimientos de stock.");
  }
  if (store.some((s) => s.resource_id !== item.resource_id && s.resource_name.toLowerCase() === input.name.toLowerCase())) {
    throw new Error("Ya existe otra materia prima con ese nombre.");
  }

  store = store.map((s) => {
    if (s.resource_id !== item.resource_id) return s;
    const base = { ...s, resource_name: input.name, resource_type: type.name, unit: input.unit };
    return s.supplier_item_id === supplierItemId
      ? { ...base, minimun_stock: input.minimun_stock, ...statusOf(s.current_stock, input.minimun_stock) }
      : base;
  });
  void mutate(STOCK_KEY);
  return store.find((s) => s.supplier_item_id === supplierItemId)!;
}
