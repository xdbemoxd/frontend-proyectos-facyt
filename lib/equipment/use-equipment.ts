"use client";

import { useCallback, useEffect, useState } from "react";
import { EQUIPMENT_KEY, RESERVATIONS_KEY, equipmentFetcher, reservationsFetcher } from "./api";
import type { EquipmentUnit, Reservation } from "./types";

/**
 * Misma forma que useSWR: { data, error, isLoading, mutate }.
 * Para migrar (pnpm add swr) cambia el cuerpo de cada hook por:
 *   return useSWR<EquipmentUnit[]>(EQUIPMENT_KEY, equipmentFetcher);
 *   return useSWR<Reservation[]>(RESERVATIONS_KEY, reservationsFetcher);
 */
function useResource<T>(key: string, fetcher: (key: string) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcher(key);
      setData(result);
      setError(undefined);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    void mutate();
  }, [mutate]);

  return { data, error, isLoading, mutate };
}

export function useEquipment() {
  return useResource<EquipmentUnit[]>(EQUIPMENT_KEY, equipmentFetcher);
}

export function useReservations() {
  return useResource<Reservation[]>(RESERVATIONS_KEY, reservationsFetcher);
}
