"use client";

import useSWR from "swr";
import { EXPENSES_KEY, expensesFetcher } from "./api";
import type { Expense } from "./types";

export function useExpenses() {
  return useSWR<Expense[]>(EXPENSES_KEY, expensesFetcher);
}
