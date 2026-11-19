"use client";

import { useCallback, useEffect, useState } from "react";
import { STOCK_KEY, stockFetcher } from "./api";
import type { StockItem } from "./types";

/**
 * Misma forma que useSWR. Para migrar (pnpm add swr):
 *   return useSWR<StockItem[]>(STOCK_KEY, stockFetcher);
 */
export function useStock() {
  const [data, setData] = useState<StockItem[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await stockFetcher(STOCK_KEY);
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
