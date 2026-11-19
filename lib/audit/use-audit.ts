"use client";

import { useCallback, useEffect, useState } from "react";
import { auditFetcher, auditKey } from "./api";
import type { AuditFilters, AuditPage } from "./types";

/**
 * Misma forma que useSWR; la clave cambia con los filtros.
 * Para migrar (pnpm add swr):
 *   return useSWR<AuditPage>(auditKey(filters), auditFetcher, { keepPreviousData: true });
 */
export function useAudit(filters: AuditFilters) {
  const key = auditKey(filters);
  const [data, setData] = useState<AuditPage | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await auditFetcher(key);
      setData(result); // se conserva el resultado anterior mientras carga (keepPreviousData)
      setError(undefined);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    void mutate();
  }, [mutate]);

  return { data, error, isLoading, mutate };
}
