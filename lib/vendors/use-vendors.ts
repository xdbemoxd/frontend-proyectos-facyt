"use client";

import { useCallback, useEffect, useState } from "react";
import { VENDORS_KEY, vendorsFetcher } from "./api";
import type { Vendor } from "./types";

/**
 * Misma forma que useSWR: { data, error, isLoading, mutate }.
 *
 * Para migrar (pnpm add swr):
 *   import useSWR from "swr";
 *   export function useVendors() {
 *     return useSWR<Vendor[]>(VENDORS_KEY, vendorsFetcher);
 *   }
 */
export function useVendors() {
  const [data, setData] = useState<Vendor[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await vendorsFetcher(VENDORS_KEY);
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
