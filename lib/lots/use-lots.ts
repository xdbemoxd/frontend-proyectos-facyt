"use client";

import useSWR from "swr";
import { LOTS_KEY, lotsFetcher } from "./api";
import type { Lot } from "./types";

export function useLots() {
  return useSWR<Lot[]>(LOTS_KEY, lotsFetcher);
}
