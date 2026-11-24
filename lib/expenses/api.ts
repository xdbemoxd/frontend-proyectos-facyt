import { mutate } from "swr";
import { auditUiEvent } from "@/lib/audit/ui-event";
import { fetchJson } from "@/lib/http";
import { EXPENSE_STATUS } from "./constants";
import type { Expense, ExpenseInput, ExpenseStatusCode } from "./types";

/** Clave SWR del flujo principal: BFF con el Bearer de la sesión. */
export const EXPENSES_KEY = "/api/expenses?limit=200";

type RawExpense = Omit<Expense, "count_raw_materials"> & {
  count_raw_materials: number | string;
};

type Paginated<T> = { items: T[]; total: number; limit: number; offset: number };

function normalizeExpense(raw: RawExpense): Expense {
  return {
    ...raw,
    count_raw_materials: Number(raw.count_raw_materials ?? 0),
  };
}

/** Fetcher SWR: solicitudes reales (el coordinador solo ve sus proyectos). */
export async function expensesFetcher(key: string): Promise<Expense[]> {
  const page = await fetchJson<Paginated<RawExpense>>(
    key,
    { method: "GET" },
    "No se pudieron cargar las solicitudes."
  );
  return page.items.map(normalizeExpense);
}

/** POST /api/expenses. Siempre nace en Borrador. */
export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const created = await fetchJson<RawExpense>(
    "/api/expenses",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "No se pudo guardar la solicitud."
  );

  const expense = normalizeExpense(created);
  void mutate(EXPENSES_KEY);
  auditUiEvent({
    entity: "Expense",
    action: "create",
    summary: `Solicitud para ${expense.project.unique_code}`,
  });
  return expense;
}

/**
 * PATCH /api/expenses/:id/status con { status: code }.
 * El backend valida la transición, el rol y la autoaprobación.
 */
export async function changeExpenseStatus(
  id: string,
  to: ExpenseStatusCode
): Promise<Expense> {
  const updated = await fetchJson<RawExpense>(
    `/api/expenses/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    },
    "No se pudo cambiar el estado."
  );

  const expense = normalizeExpense(updated);
  void mutate(EXPENSES_KEY);
  auditUiEvent({
    entity: "Expense",
    action: "update_status",
    summary: `${expense.description.slice(0, 120)} → ${expense.status.name || EXPENSE_STATUS[to].name}`,
  });
  return expense;
}
