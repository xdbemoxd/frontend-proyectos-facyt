"use client";

import useSWR from "swr";
import {
  INVENTORY_CATALOGS_KEY,
  STOCK_KEY,
  inventoryCatalogsFetcher,
  stockFetcher,
} from "./api";
import type { InventoryCatalogs, StockItem } from "./types";

export function useStock() {
  return useSWR<StockItem[]>(STOCK_KEY, stockFetcher);
}

/** Tipos de recurso y proveedores reales para formularios y filtros. */
export function useInventoryCatalogs() {
  return useSWR<InventoryCatalogs>(
    INVENTORY_CATALOGS_KEY,
    inventoryCatalogsFetcher
  );
}
