"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { auditFetcher, auditKey, auditUsersFetcher } from "./api";
import { handleSessionExpired } from "@/lib/session";
import type { AuditFilters, AuditPage, AuditUser } from "./types";

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
  const requestId = useRef(0);

  const mutate = useCallback(async () => {
    const current = ++requestId.current;
    setIsLoading(true);
    try {
      const result = await auditFetcher(key);
      if (current !== requestId.current) return;
      setData(result);
      setError(undefined);
      return result;
    } catch (e) {
      if (current !== requestId.current) return;
      if (e instanceof Error && e.message === "No autenticado") {
        handleSessionExpired();
        return;
      }
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (current === requestId.current) setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    void mutate();
  }, [mutate]);

  return { data, error, isLoading, mutate };
}

export function useAuditUsers() {
  return useSWR<AuditUser[]>("audit-users", auditUsersFetcher);
}
