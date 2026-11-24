"use client";

import useSWR from "swr";
import { OVERHEAD_KEY, overheadFetcher } from "./api";
import type { OverheadPeriod } from "./types";

export function useOverheadPeriods() {
  return useSWR<OverheadPeriod[]>(OVERHEAD_KEY, overheadFetcher);
}
