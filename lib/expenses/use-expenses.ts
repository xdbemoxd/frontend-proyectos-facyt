"use client";

import { useCallback, useEffect, useState } from "react";
import { EXPENSES_KEY, expensesFetcher } from "./api";
import type { Expense } from "./types";

/**
 * Misma forma que useSWR. Para migrar (pnpm add swr):
 *   return useSWR<Expense[]>(EXPENSES_KEY, expensesFetcher);
 */
export function useExpenses() {
  const [data, setData] = useState<Expense[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await expensesFetcher(EXPENSES_KEY);
      setData(result);
      setError(undefined);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void mutate();
  }, [mutate]);

  return { data, error, isLoading, mutate };
}
