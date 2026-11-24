import type { ExpenseStatus, ExpenseStatusCode } from "./types";

/** Estados estables de `private.status_expense_approval`. */
export const EXPENSE_STATUS: Record<ExpenseStatusCode, ExpenseStatus> = {
  draft: { id: 1, name: "Borrador", code: "draft" },
  pending: { id: 2, name: "Pendiente de Aprobación", code: "pending" },
  approved: { id: 3, name: "Aprobado", code: "approved" },
  rejected: { id: 4, name: "Rechazado", code: "rejected" },
  executed: { id: 5, name: "Ejecutado", code: "executed" },
};

/** Transiciones permitidas (el backend es la autoridad final, RN-7). */
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
