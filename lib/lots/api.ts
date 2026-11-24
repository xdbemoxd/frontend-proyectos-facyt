import { mutate } from "swr";
import { STOCK_KEY } from "@/lib/inventory/api";
import { fetchJson } from "@/lib/http";
import type { Lot, LotInput } from "./types";

/** Clave SWR del flujo principal: lotes reales vía BFF. */
export const LOTS_KEY = "/api/inventory/lots?limit=200";

type RawLot = Omit<Lot, "count_raw_materials_in" | "unit_cost"> & {
  count_raw_materials_in: number | string;
  unit_cost: number | string;
};

type Paginated<T> = { items: T[]; total: number; limit: number; offset: number };

function normalizeLot(raw: RawLot): Lot {
  return {
    ...raw,
    count_raw_materials_in: Number(raw.count_raw_materials_in ?? 0),
    unit_cost: Number(raw.unit_cost ?? 0),
  };
}

/** Fetcher SWR: lista paginada de lotes reales. */
export async function lotsFetcher(key: string): Promise<Lot[]> {
  const page = await fetchJson<Paginated<RawLot>>(
    key,
    { method: "GET" },
    "No se pudieron cargar los lotes."
  );
  return page.items.map(normalizeLot);
}

/**
 * POST /api/inventory/lots (solo admin/aprobador).
 * El servicio SOLO inserta el lote; el trigger `trg_lot_add_stock` suma el
 * stock en la misma transacción. Después se refrescan lotes y stock.
 */
export async function createLot(input: LotInput): Promise<Lot> {
  const created = await fetchJson<RawLot>(
    "/api/inventory/lots",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "No se pudo registrar el lote."
  );

  const lot = normalizeLot(created);
  void mutate(LOTS_KEY);
  void mutate(STOCK_KEY);
  return lot;
}
