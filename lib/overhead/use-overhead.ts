"use client";

import useSWR from "swr";
import { OVERHEAD_KEY, overheadFetcher } from "./api";
import type { OverheadPeriod } from "./types";

/**
 * `enabled=false` desactiva la petición (p. ej. coordinador): el backend solo
 * permite overhead a admin/aprobador y la UI oculta esa vista.
 */
export function useOverheadPeriods(enabled = true) {
  return useSWR<OverheadPeriod[]>(enabled ? OVERHEAD_KEY : null, overheadFetcher);
}
