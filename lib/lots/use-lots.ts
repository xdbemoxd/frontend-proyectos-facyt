"use client";

import { useCallback, useEffect, useState } from "react";
import { LOTS_KEY, lotsFetcher } from "./api";
import type { Lot } from "./types";

/**
 * Misma forma que useSWR. Para migrar (pnpm add swr):
 *   return useSWR<Lot[]>(LOTS_KEY, lotsFetcher);
 */
export function useLots() {
  const [data, setData] = useState<Lot[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await lotsFetcher(LOTS_KEY);
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
