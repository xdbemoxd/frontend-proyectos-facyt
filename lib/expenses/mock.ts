import type { Expense, ExpenseStatus, ExpenseStatusCode } from "./types";

export const EXPENSE_STATUS: Record<ExpenseStatusCode, ExpenseStatus> = {
  draft: { id: 1, name: "Borrador", code: "draft" },
  pending: { id: 2, name: "Pendiente de Aprobación", code: "pending" },
  approved: { id: 3, name: "Aprobado", code: "approved" },
  rejected: { id: 4, name: "Rechazado", code: "rejected" },
  executed: { id: 5, name: "Ejecutado", code: "executed" },
};

/** Transiciones permitidas (igual que deberia validar FastAPI). */
export const TRANSITIONS: Record<ExpenseStatusCode, ExpenseStatusCode[]> = {
  draft: ["pending"],
  pending: ["approved", "rejected"],
  approved: ["executed"],
  rejected: [],
  executed: [],
};

/** Texto del boton para pasar a cada estado. */
export const ACTION_LABELS: Record<ExpenseStatusCode, string> = {
  draft: "Volver a borrador",
  pending: "Enviar a aprobación",
  approved: "Aprobar",
  rejected: "Rechazar",
  executed: "Marcar como ejecutado",
};

const S = EXPENSE_STATUS;
const P1 = { id: "0193a1b2-0001-7000-8000-000000000001", unique_code: "FACYT-QUI-2026-001", name: "Síntesis de nanopartículas de plata" };
const P2 = { id: "0193a1b2-0002-7000-8000-000000000002", unique_code: "FACYT-BIO-2026-004", name: "Biorremediación de suelos contaminados" };

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "01942000-0001-7000-8000-000000000001", project: P1,
    supplier_item: { id: "0193e000-0001-7000-8000-000000000001", resource_name: "Nitrato de plata", vendor_name: "Químicos del Centro C.A.", unit: "g" },
    status: S.pending, description: "Reposición de nitrato para la fase 2 de síntesis.",
    count_raw_materials: 200, created_at: "2026-11-15T13:00:00Z", modifiet_at: "2026-11-16T09:00:00Z",
  },
  {
    id: "01942000-0002-7000-8000-000000000002", project: P1,
    supplier_item: { id: "0193e000-0002-7000-8000-000000000002", resource_name: "Guantes de nitrilo talla M", vendor_name: "LabSupply Venezuela", unit: "caja" },
    status: S.approved, description: "Guantes para el equipo de laboratorio.",
    count_raw_materials: 10, created_at: "2026-11-08T14:00:00Z", modifiet_at: "2026-11-10T11:30:00Z",
  },
  {
    id: "01942000-0003-7000-8000-000000000003", project: P2, supplier_item: null,
    status: S.draft, description: "Kit de análisis de hidrocarburos en suelo.",
    count_raw_materials: 2, created_at: "2026-11-17T16:00:00Z", modifiet_at: "2026-11-17T16:00:00Z",
  },
  {
    id: "01942000-0004-7000-8000-000000000004", project: P2,
    supplier_item: { id: "0193e000-0003-7000-8000-000000000003", resource_name: "Etanol 96%", vendor_name: "Químicos del Centro C.A.", unit: "L" },
    status: S.rejected, description: "Etanol para limpieza de muestras.",
    count_raw_materials: 40, created_at: "2026-10-28T12:00:00Z", modifiet_at: "2026-10-30T10:00:00Z",
  },
  {
    id: "01942000-0005-7000-8000-000000000005", project: P1,
    supplier_item: { id: "0193e000-0004-7000-8000-000000000004", resource_name: "Papel absorbente", vendor_name: "LabSupply Venezuela", unit: "paquete" },
    status: S.executed, description: "Papel absorbente para el trimestre.",
    count_raw_materials: 20, created_at: "2026-10-02T12:00:00Z", modifiet_at: "2026-10-09T15:00:00Z",
  },
];
