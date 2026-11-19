"use client";

import { useCallback, useEffect, useState } from "react";
import { DISPATCH_KEY, dispatchFetcher } from "./api";
import type { Dispatch } from "./types";

/**
 * Misma forma que useSWR. Para migrar (pnpm add swr):
 *   return useSWR<Dispatch[]>(DISPATCH_KEY, dispatchFetcher);
 */
export function useDispatches() {
  const [data, setData] = useState<Dispatch[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await dispatchFetcher(DISPATCH_KEY);
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
