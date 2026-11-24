import { mutate } from "swr";
import { fetchJson } from "@/lib/http";
import type {
  ClosePeriodInput,
  Criterion,
  OverheadPeriod,
  OverheadPreview,
} from "./types";

/** Clave SWR del flujo principal: períodos reales vía BFF. */
export const OVERHEAD_KEY = "/api/overhead/periods?limit=100";

type RawAllocation = Omit<
  OverheadPeriod["allocations"][number],
  "consumption" | "amount"
> & { consumption: number | string; amount: number | string };

type RawPeriod = Omit<
  OverheadPeriod,
  "total_cost" | "allocations"
> & { total_cost: number | string; allocations: RawAllocation[] };

type RawPreview = Omit<
  OverheadPreview,
  "total_cost" | "total_consumption" | "allocations"
> & {
  total_cost: number | string;
  total_consumption: number | string;
  allocations: (Omit<
    OverheadPreview["allocations"][number],
    "consumption" | "share" | "amount"
  > & {
    consumption: number | string;
    share: number | string;
    amount: number | string;
  })[];
};

type Paginated<T> = { items: T[]; total: number; limit: number; offset: number };

function normalizePeriod(raw: RawPeriod): OverheadPeriod {
  return {
    ...raw,
    total_cost: Number(raw.total_cost ?? 0),
    allocations: raw.allocations.map((a) => ({
      ...a,
      consumption: Number(a.consumption ?? 0),
      amount: Number(a.amount ?? 0),
    })),
  };
}

function normalizePreview(raw: RawPreview): OverheadPreview {
  return {
    ...raw,
    total_cost: Number(raw.total_cost ?? 0),
    total_consumption: Number(raw.total_consumption ?? 0),
    allocations: raw.allocations.map((a) => ({
      ...a,
      consumption: Number(a.consumption ?? 0),
      share: Number(a.share ?? 0),
      amount: Number(a.amount ?? 0),
    })),
  };
}

/** Fetcher SWR: períodos cerrados reales (solo admin/aprobador). */
export async function overheadFetcher(key: string): Promise<OverheadPeriod[]> {
  const page = await fetchJson<Paginated<RawPeriod>>(
    key,
    { method: "GET" },
    "No se pudieron cargar los períodos."
  );
  return page.items.map(normalizePeriod);
}

async function previewError(response: Response): Promise<Error> {
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === "string" && body.detail.trim()) {
      return new Error(body.detail);
    }
    if (Array.isArray(body.detail)) {
      const first = body.detail[0] as { msg?: unknown } | undefined;
      if (first && typeof first.msg === "string") return new Error(first.msg);
    }
  } catch {
    /* sin cuerpo JSON */
  }
  if (response.status === 403) return new Error("No tienes permiso para esta acción.");
  return new Error("No se pudo calcular el reparto.");
}

/**
 * GET /api/overhead/preview. El backend usa los proyectos activos y el
 * consumo real de dispatch_log; aquí solo se muestra.
 */
export async function getOverheadPreview(input: {
  start_date: string;
  end_date: string;
  total_cost: string;
  criterion: Criterion;
}): Promise<OverheadPreview> {
  const params = new URLSearchParams(input);
  let response: Response;
  try {
    response = await fetch(`/api/overhead/preview?${params}`, { method: "GET" });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }
  if (!response.ok) throw await previewError(response);
  return normalizePreview((await response.json()) as RawPreview);
}

/** POST /api/overhead/periods: el backend calcula y guarda el reparto. */
export async function closePeriod(input: ClosePeriodInput): Promise<OverheadPeriod> {
  const created = await fetchJson<RawPeriod>(
    "/api/overhead/periods",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "No se pudo cerrar el período."
  );

  const period = normalizePeriod(created);
  void mutate(OVERHEAD_KEY);
  return period;
}
