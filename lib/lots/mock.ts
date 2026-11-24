import type { Lot } from "./types";

/**
 * Datos demo conservados para storybook/pruebas visuales.
 * El flujo principal de lotes usa el backend real (ver `api.ts`).
 */
export const MOCK_LOTS: Lot[] = [
  {
    id: "0193f000-0001-7000-8000-000000000001",
    supplier_item: {
      id: "0193e000-0001-7000-8000-000000000001",
      resource_name: "Nitrato de plata",
      vendor_name: "Químicos del Centro C.A.",
      unit: "g",
    },
    in_date: "2026-10-05T14:00:00Z",
    count_raw_materials_in: 250,
    unit_cost: 3.2,
    invoice_reference: "FAC-000812",
    created_at: "2026-10-05T14:05:00Z",
  },
  {
    id: "0193f000-0002-7000-8000-000000000002",
    supplier_item: {
      id: "0193e000-0004-7000-8000-000000000004",
      resource_name: "Papel absorbente",
      vendor_name: "LabSupply Venezuela",
      unit: "paquete",
    },
    in_date: "2026-11-02T13:30:00Z",
    count_raw_materials_in: 40,
    unit_cost: 4.75,
    invoice_reference: "LS-2026-1147",
    created_at: "2026-11-02T13:31:00Z",
  },
  {
    id: "0193f000-0003-7000-8000-000000000003",
    supplier_item: {
      id: "0193e000-0005-7000-8000-000000000005",
      resource_name: "Etanol 96%",
      vendor_name: "LabSupply Venezuela",
      unit: "L",
    },
    in_date: "2026-11-10T15:00:00Z",
    count_raw_materials_in: 12,
    unit_cost: 6,
    invoice_reference: null,
    created_at: "2026-11-10T15:02:00Z",
  },
];
