import type { Vendor } from "./types";

/** Datos de ejemplo. Se usan mientras no exista GET /vendors. */
export const MOCK_VENDORS: Vendor[] = [
  {
    id: "0193b000-0001-7000-8000-000000000001",
    name: "Químicos del Centro C.A.",
    description: "Reactivos y solventes de grado analítico.",
    contact_email: "ventas@quimicoscentro.com",
    contact_phone: "+58 241-8234567",
    create_at: "2026-01-12T13:00:00Z",
    updated_at: "2026-09-02T10:20:00Z",
  },
  {
    id: "0193b000-0002-7000-8000-000000000002",
    name: "LabSupply Venezuela",
    description: "Consumibles de laboratorio: guantes, papel absorbente, material de vidrio.",
    contact_email: "contacto@labsupply.com.ve",
    contact_phone: "+58 212-5551234",
    create_at: "2026-02-03T15:00:00Z",
    updated_at: "2026-02-03T15:00:00Z",
  },
  {
    id: "0193b000-0003-7000-8000-000000000003",
    name: "Equipos Científicos Valencia",
    description: "Venta y mantenimiento de equipos y maquinaria.",
    contact_email: null,
    contact_phone: "+58 414-4567890",
    create_at: "2026-04-18T11:30:00Z",
    updated_at: "2026-10-27T16:45:00Z",
  },
];
