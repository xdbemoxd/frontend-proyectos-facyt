import { mutate } from "swr";
import { auditUiEvent } from "@/lib/audit/ui-event";
import { getStockSnapshot, mockAdjustStock } from "@/lib/inventory/api";
import type { Lot, LotInput } from "./types";

export const LOTS_KEY = "/inventory/lots";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

let lots: Lot[] = [
  {
    id: "0193f000-0001-7000-8000-000000000001",
    supplier_item: { id: "0193e000-0001-7000-8000-000000000001", resource_name: "Nitrato de plata", vendor_name: "Químicos del Centro C.A.", unit: "g" },
    in_date: "2026-10-05T14:00:00Z",
    count_raw_materials_in: 250,
    unit_cost: 3.2,
    invoice_reference: "FAC-000812",
    created_at: "2026-10-05T14:05:00Z",
  },
  {
    id: "0193f000-0002-7000-8000-000000000002",
    supplier_item: { id: "0193e000-0004-7000-8000-000000000004", resource_name: "Papel absorbente", vendor_name: "LabSupply Venezuela", unit: "paquete" },
    in_date: "2026-11-02T13:30:00Z",
    count_raw_materials_in: 40,
    unit_cost: 4.75,
    invoice_reference: "LS-2026-1147",
    created_at: "2026-11-02T13:31:00Z",
  },
  {
    id: "0193f000-0003-7000-8000-000000000003",
    supplier_item: { id: "0193e000-0005-7000-8000-000000000005", resource_name: "Etanol 96%", vendor_name: "LabSupply Venezuela", unit: "L" },
    in_date: "2026-11-10T15:00:00Z",
    count_raw_materials_in: 12,
    unit_cost: 6,
    invoice_reference: null,
    created_at: "2026-11-10T15:02:00Z",
  },
];

/**
 * MAÑANA:
 *   const res = await fetch(`/api${key}`);
 *   if (!res.ok) throw new Error("No se pudieron cargar los lotes");
 *   const rows = await res.json();
 *   return rows.map((r) => ({ ...r, count_raw_materials_in: Number(r.count_raw_materials_in), unit_cost: Number(r.unit_cost) }));
 */
export async function lotsFetcher(_key: string): Promise<Lot[]> {
  await delay();
  return [...lots].sort((a, b) => b.in_date.localeCompare(a.in_date)); // mas recientes primero
}

/**
 * MAÑANA: POST /api/inventory/lots con `input`. El backend SOLO inserta el lote;
 * el trigger `fn_trg_inventory_lot_added` suma el stock.
 */
export async function createLot(input: LotInput): Promise<Lot> {
  await delay();
  const item = getStockSnapshot().find((s) => s.supplier_item_id === input.id_raw_materials_supplier);
  if (!item) throw new Error("Material o proveedor no válido.");

  mockAdjustStock(item.supplier_item_id, input.count_raw_materials_in); // simula el trigger

  const lot: Lot = {
    id: crypto.randomUUID(),
    supplier_item: {
      id: item.supplier_item_id,
      resource_name: item.resource_name,
      vendor_name: item.vendor_name,
      unit: item.unit,
    },
    in_date: input.in_date,
    count_raw_materials_in: input.count_raw_materials_in,
    unit_cost: input.unit_cost,
    invoice_reference: input.invoice_reference,
    created_at: new Date().toISOString(),
  };
  lots = [...lots, lot];
  void mutate(LOTS_KEY);
  auditUiEvent({ entity: "Lot", action: "register_lot", summary: `Lote de ${item.resource_name}` });
  return lot;
}
