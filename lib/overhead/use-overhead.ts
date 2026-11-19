"use client";

import { useCallback, useEffect, useState } from "react";
import { OVERHEAD_KEY, overheadFetcher } from "./api";
import type { OverheadPeriod } from "./types";

/**
 * Misma forma que useSWR. Para migrar (pnpm add swr):
 *   return useSWR<OverheadPeriod[]>(OVERHEAD_KEY, overheadFetcher);
 */
export function useOverheadPeriods() {
  const [data, setData] = useState<OverheadPeriod[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await overheadFetcher(OVERHEAD_KEY);
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
