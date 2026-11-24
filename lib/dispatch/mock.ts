import type { Dispatch } from "./types";

/**
 * Datos demo conservados para storybook/pruebas visuales.
 * El flujo principal de despachos usa el backend real (ver `api.ts`).
 */
export const MOCK_DISPATCH: Dispatch[] = [
  {
    id: "01940000-0001-7000-8000-000000000001",
    supplier_item: {
      id: "0193e000-0001-7000-8000-000000000001",
      resource_name: "Nitrato de plata",
      vendor_name: "Químicos del Centro C.A.",
      unit: "g",
    },
    project: {
      id: "0193a1b2-0001-7000-8000-000000000001",
      unique_code: "FACYT-QUI-2026-001",
      name: "Síntesis de nanopartículas de plata",
    },
    user: { id: "u-1", full_name: "María Rivas" },
    use_raw_materials: 50,
    material_requested_at: "2026-11-12T14:20:00Z",
    notes: "Lote de síntesis n.º 4.",
  },
  {
    id: "01940000-0002-7000-8000-000000000002",
    supplier_item: {
      id: "0193e000-0002-7000-8000-000000000002",
      resource_name: "Guantes de nitrilo talla M",
      vendor_name: "LabSupply Venezuela",
      unit: "caja",
    },
    project: {
      id: "0193a1b2-0001-7000-8000-000000000001",
      unique_code: "FACYT-QUI-2026-001",
      name: "Síntesis de nanopartículas de plata",
    },
    user: { id: "u-1", full_name: "María Rivas" },
    use_raw_materials: 2,
    material_requested_at: "2026-11-14T12:05:00Z",
    notes: null,
  },
  {
    id: "01940000-0003-7000-8000-000000000003",
    supplier_item: {
      id: "0193e000-0004-7000-8000-000000000004",
      resource_name: "Papel absorbente",
      vendor_name: "LabSupply Venezuela",
      unit: "paquete",
    },
    project: {
      id: "0193a1b2-0002-7000-8000-000000000002",
      unique_code: "FACYT-BIO-2026-004",
      name: "Biorremediación de suelos contaminados",
    },
    user: { id: "u-2", full_name: "José Pérez" },
    use_raw_materials: 8,
    material_requested_at: "2026-11-16T15:40:00Z",
    notes: "Preparación de muestras.",
  },
];
