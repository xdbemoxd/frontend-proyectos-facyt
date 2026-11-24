/** Estado de la maquina de aprobacion (private.status_expense_approval). */
export type ExpenseStatusCode = "draft" | "pending" | "approved" | "rejected" | "executed";
export type ExpenseStatus = { id: number; name: string; code: ExpenseStatusCode };

/** Solicitante resuelto por el backend (sin datos internos de la cuenta). */
export type ExpenseRequester = { id: string; full_name: string };

/** Solicitud de gasto (private.expense_approval) con FK resueltas. */
export type Expense = {
  id: string;
  project: { id: string; unique_code: string; name: string };
  supplier_item: { id: string; resource_name: string; vendor_name: string; unit: string } | null;
  status: ExpenseStatus;
  requester: ExpenseRequester;
  description: string;
  count_raw_materials: number;
  created_at: string;
  modifiet_at: string;
};

/** POST /expenses (se crea siempre en Borrador; el solicitante sale del token). */
export type ExpenseInput = {
  id_project: string;
  id_raw_materials_suppliers: string | null;
  description: string;
  count_raw_materials: number;
};
