import { MOCK_VENDORS } from "@/lib/vendors/mock";
import { MOCK_STOCK, RESOURCE_TYPES } from "./mock";
import type { RawMaterialInput, StockItem } from "./types";

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
}

export const getStockSnapshot = (): StockItem[] => store;
