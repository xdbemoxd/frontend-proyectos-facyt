"use client";

import { useCallback, useEffect, useState } from "react";
import { PRIORITY_LOG_KEY, PROJECTS_KEY, priorityLogFetcher, projectsFetcher } from "./api";
import type { PriorityChange, Project } from "./types";

/**
 * Hook con la MISMA forma que devuelve useSWR: { data, error, isLoading, mutate }.
 *
 * Para migrar a SWR (pnpm add swr) reemplaza todo el cuerpo por:
 *
 *   import useSWR from "swr";
 *   export function useProjects() {
 *     return useSWR<Project[]>(PROJECTS_KEY, projectsFetcher);
 *   }
 *
 * Los componentes que usan este hook no cambian.
 */
export function useProjects() {
  const [data, setData] = useState<Project[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await projectsFetcher(PROJECTS_KEY);
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

/** Historial de cambios de prioridad (misma forma que useSWR). */
export function usePriorityLog() {
  const [data, setData] = useState<PriorityChange[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await priorityLogFetcher(PRIORITY_LOG_KEY);
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
