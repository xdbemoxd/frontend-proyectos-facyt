import { getStockSnapshot, mockAdjustStock } from "@/lib/inventory/api";
import { MOCK_PROJECTS } from "@/lib/projects/mock";
import type { Dispatch, DispatchInput } from "./types";

export const DISPATCH_KEY = "/inventory/dispatch";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

let dispatches: Dispatch[] = [
  {
    id: "01940000-0001-7000-8000-000000000001",
    supplier_item: { id: "0193e000-0001-7000-8000-000000000001", resource_name: "Nitrato de plata", vendor_name: "Químicos del Centro C.A.", unit: "g" },
    project: { id: "0193a1b2-0001-7000-8000-000000000001", unique_code: "FACYT-QUI-2026-001", name: "Síntesis de nanopartículas de plata" },
    user: { id: "u-1", full_name: "María Rivas" },
    use_raw_materials: 50,
    material_requested_at: "2026-11-12T14:20:00Z",
    notes: "Lote de síntesis n.º 4.",
  },
  {
    id: "01940000-0002-7000-8000-000000000002",
    supplier_item: { id: "0193e000-0002-7000-8000-000000000002", resource_name: "Guantes de nitrilo talla M", vendor_name: "LabSupply Venezuela", unit: "caja" },
    project: { id: "0193a1b2-0001-7000-8000-000000000001", unique_code: "FACYT-QUI-2026-001", name: "Síntesis de nanopartículas de plata" },
    user: { id: "u-1", full_name: "María Rivas" },
    use_raw_materials: 2,
    material_requested_at: "2026-11-14T12:05:00Z",
    notes: null,
  },
  {
    id: "01940000-0003-7000-8000-000000000003",
    supplier_item: { id: "0193e000-0004-7000-8000-000000000004", resource_name: "Papel absorbente", vendor_name: "LabSupply Venezuela", unit: "paquete" },
    project: { id: "0193a1b2-0002-7000-8000-000000000002", unique_code: "FACYT-BIO-2026-004", name: "Biorremediación de suelos contaminados" },
    user: { id: "u-2", full_name: "José Pérez" },
    use_raw_materials: 8,
    material_requested_at: "2026-11-16T15:40:00Z",
    notes: "Preparación de muestras.",
  },
];

/**
 * MAÑANA:
 *   const res = await fetch(`/api${key}`);
 *   if (!res.ok) throw new Error("No se pudo cargar la bitácora");
 *   const rows = await res.json();
 *   return rows.map((r) => ({ ...r, use_raw_materials: Number(r.use_raw_materials) }));
 */
export async function dispatchFetcher(_key: string): Promise<Dispatch[]> {
  await delay();
  return [...dispatches].sort((a, b) => b.material_requested_at.localeCompare(a.material_requested_at));
}

/**
 * MAÑANA: POST /api/inventory/dispatch. El backend SOLO inserta; el trigger
 * `fn_trg_dispatch_deduct_stock` valida y resta el stock. Si no alcanza,
 * FastAPI debe responder 409 con el mensaje de la BD.
 */
export async function createDispatch(input: DispatchInput): Promise<Dispatch> {
  await delay();
  const item = getStockSnapshot().find((s) => s.supplier_item_id === input.id_raw_materials_suppliers);
  const project = MOCK_PROJECTS.find((p) => p.id === input.id_project);
  if (!item || !project) throw new Error("Material o proyecto no válido.");

  if (item.current_stock < input.use_raw_materials) {
    throw new Error(
      `Stock insuficiente. Disponible: ${item.current_stock} ${item.unit}, solicitado: ${input.use_raw_materials} ${item.unit}.`,
    );
  }
  mockAdjustStock(item.supplier_item_id, -input.use_raw_materials); // simula el trigger

  const dispatch: Dispatch = {
    id: crypto.randomUUID(),
    supplier_item: { id: item.supplier_item_id, resource_name: item.resource_name, vendor_name: item.vendor_name, unit: item.unit },
    project: { id: project.id, unique_code: project.unique_code, name: project.name },
    user: { id: "me", full_name: "Usuario actual" }, // el backend lo toma del token
    use_raw_materials: input.use_raw_materials,
    material_requested_at: new Date().toISOString(),
    notes: input.notes,
  };
  dispatches = [...dispatches, dispatch];
  return dispatch;
}

/** Solo para el MOCK: lo usa el prorrateo para calcular consumos. */
export const getDispatchSnapshot = (): Dispatch[] => dispatches;
