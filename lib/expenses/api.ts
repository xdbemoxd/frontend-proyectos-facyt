import { mutate } from "swr";
import { auditUiEvent } from "@/lib/audit/ui-event";
import { getStockSnapshot } from "@/lib/inventory/api";
import { MOCK_PROJECTS } from "@/lib/projects/mock";
import { EXPENSE_STATUS, MOCK_EXPENSES, TRANSITIONS } from "./mock";
import type { Expense, ExpenseInput, ExpenseStatusCode } from "./types";

export const EXPENSES_KEY = "/expenses";

let expenses: Expense[] = [...MOCK_EXPENSES];
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/**
 * MAÑANA:
 *   const res = await fetch(`/api${key}`); if (!res.ok) throw ...;
 *   const rows = await res.json();
 *   return rows.map((r) => ({ ...r, count_raw_materials: Number(r.count_raw_materials) }));
 */
export async function expensesFetcher(_key: string): Promise<Expense[]> {
  await delay();
  return [...expenses].sort((a, b) => b.modifiet_at.localeCompare(a.modifiet_at));
}

/** MAÑANA: POST /api/expenses. Siempre nace en Borrador. */
export async function createExpense(input: ExpenseInput): Promise<Expense> {
  await delay();
  const project = MOCK_PROJECTS.find((p) => p.id === input.id_project);
  if (!project) throw new Error("Proyecto no válido.");
  const item = input.id_raw_materials_suppliers
    ? getStockSnapshot().find((s) => s.supplier_item_id === input.id_raw_materials_suppliers)
    : null;
  if (input.id_raw_materials_suppliers && !item) throw new Error("Material no válido.");

  const now = new Date().toISOString();
  const expense: Expense = {
    id: crypto.randomUUID(),
    project: { id: project.id, unique_code: project.unique_code, name: project.name },
    supplier_item: item
      ? { id: item.supplier_item_id, resource_name: item.resource_name, vendor_name: item.vendor_name, unit: item.unit }
      : null,
    status: EXPENSE_STATUS.draft,
    description: input.description,
    count_raw_materials: input.count_raw_materials,
    created_at: now,
    modifiet_at: now,
  };
  expenses = [...expenses, expense];
  void mutate(EXPENSES_KEY);
  auditUiEvent({ entity: "Expense", action: "create", summary: `Solicitud para ${project.unique_code}` });
  return expense;
}

/**
 * MAÑANA: PATCH /api/expenses/:id/status con { status: code }.
 * FastAPI valida la transicion y el rol (aprobar/rechazar = aprobador).
 */
export async function changeExpenseStatus(id: string, to: ExpenseStatusCode): Promise<Expense> {
  await delay();
  const expense = expenses.find((e) => e.id === id);
  if (!expense) throw new Error("Solicitud no encontrada.");
  if (!TRANSITIONS[expense.status.code].includes(to)) {
    throw new Error(`No se puede pasar de "${expense.status.name}" a "${EXPENSE_STATUS[to].name}".`);
  }
  const updated: Expense = { ...expense, status: EXPENSE_STATUS[to], modifiet_at: new Date().toISOString() };
  expenses = expenses.map((e) => (e.id === id ? updated : e));
  void mutate(EXPENSES_KEY);
  auditUiEvent({
    entity: "Expense",
    action: "update_status",
    summary: `${expense.description.slice(0, 120)} → ${EXPENSE_STATUS[to].name}`,
  });
  return updated;
}
