"use client";

import useSWR from "swr";
import { DISPATCH_KEY, dispatchFetcher } from "./api";
import type { Dispatch } from "./types";

export function useDispatches() {
  return useSWR<Dispatch[]>(DISPATCH_KEY, dispatchFetcher);
}
