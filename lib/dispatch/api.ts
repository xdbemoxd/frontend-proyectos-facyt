import { mutate } from "swr";
import { STOCK_KEY } from "@/lib/inventory/api";
import { fetchJson } from "@/lib/http";
import type { Dispatch, DispatchInput } from "./types";

/** Clave SWR del flujo principal: bitácora real vía BFF. */
export const DISPATCH_KEY = "/api/inventory/dispatch?limit=200";

type RawDispatch = Omit<Dispatch, "use_raw_materials"> & {
  use_raw_materials: number | string;
};

type Paginated<T> = { items: T[]; total: number; limit: number; offset: number };

function normalizeDispatch(raw: RawDispatch): Dispatch {
  return {
    ...raw,
    use_raw_materials: Number(raw.use_raw_materials ?? 0),
  };
}

/** Fetcher SWR: bitácora real (el coordinador solo ve sus proyectos). */
export async function dispatchFetcher(key: string): Promise<Dispatch[]> {
  const page = await fetchJson<Paginated<RawDispatch>>(
    key,
    { method: "GET" },
    "No se pudo cargar la bitácora."
  );
  return page.items.map(normalizeDispatch);
}

/**
 * POST /api/inventory/dispatch (solo admin/aprobador).
 * El backend inserta y el trigger `trg_dispatch_log_subtract_stock` valida y
 * resta el stock. Si no alcanza responde 409 con un mensaje claro.
 */
export async function createDispatch(input: DispatchInput): Promise<Dispatch> {
  const created = await fetchJson<RawDispatch>(
    "/api/inventory/dispatch",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "No se pudo registrar el despacho."
  );

  const dispatch = normalizeDispatch(created);
  void mutate(DISPATCH_KEY);
  void mutate(STOCK_KEY);
  return dispatch;
}
