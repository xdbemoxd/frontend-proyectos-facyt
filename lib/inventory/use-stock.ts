"use client";

import useSWR from "swr";
import { STOCK_KEY, stockFetcher } from "./api";
import type { StockItem } from "./types";

export function useStock() {
  return useSWR<StockItem[]>(STOCK_KEY, stockFetcher);
}
