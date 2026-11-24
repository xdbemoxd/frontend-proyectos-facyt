import { mutate } from "swr";
import { getDispatchSnapshot } from "@/lib/dispatch/api";
import { MOCK_PROJECTS } from "@/lib/projects/mock";
import { allocate, type ProjectConsumption } from "./calc";
import type { ClosePeriodInput, OverheadPeriod } from "./types";

export const OVERHEAD_KEY = "/overhead/periods";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

let periods: OverheadPeriod[] = [
  {
    id: "01943000-0001-7000-8000-000000000001",
    start_date: "2026-10-01",
    end_date: "2026-10-31",
    criterion: "equitativo",
    total_cost: 900,
    closed_by: { id: "u-5", full_name: "Laura Silva" },
    closed_at: "2026-11-01T13:00:00Z",
    allocations: [
      { id: "a1", project: { id: "0193a1b2-0001-7000-8000-000000000001", unique_code: "FACYT-QUI-2026-001", name: "Síntesis de nanopartículas de plata" }, consumption: 0, amount: 450 },
      { id: "a2", project: { id: "0193a1b2-0003-7000-8000-000000000003", unique_code: "FACYT-FIS-2025-012", name: "Caracterización de películas delgadas" }, consumption: 0, amount: 450 },
    ],
  },
];

/** MAÑANA: fetch(`/api${key}`) y convertir los Numeric a number. */
export async function overheadFetcher(_key: string): Promise<OverheadPeriod[]> {
  await delay();
  return [...periods].sort((a, b) => b.start_date.localeCompare(a.start_date));
}

/**
 * Proyectos activos del periodo y su consumo (despachos dentro del rango).
 * MAÑANA: GET /api/overhead/preview?start=..&end=.. (lo calcula FastAPI con dispatch_log).
 * Nota: suma cantidades; si hay unidades distintas conviene usar costo.
 */
export async function getConsumption(start: string, end: string): Promise<ProjectConsumption[]> {
  await delay(300);
  const from = new Date(`${start}T00:00:00`).getTime();
  const to = new Date(`${end}T23:59:59`).getTime();
  const active = MOCK_PROJECTS.filter((p) => p.status.name === "En ejecución");
  return active.map((p) => ({
    project: { id: p.id, unique_code: p.unique_code, name: p.name },
    consumption: getDispatchSnapshot()
      .filter((d) => {
        const t = new Date(d.material_requested_at).getTime();
        return d.project.id === p.id && t >= from && t <= to;
      })
      .reduce((s, d) => s + d.use_raw_materials, 0),
  }));
}

/** Rangos [a1,b1] y [a2,b2] se solapan (fechas YYYY-MM-DD, inclusivo). */
const overlaps = (a1: string, b1: string, a2: string, b2: string) => a1 <= b2 && b1 >= a2;

/**
 * MAÑANA: POST /api/overhead/periods. FastAPI calcula, guarda el periodo y sus
 * repartos en una transaccion; la restriccion de exclusion evita solapes (409).
 */
export async function closePeriod(input: ClosePeriodInput): Promise<OverheadPeriod> {
  const clash = periods.find((p) => overlaps(p.start_date, p.end_date, input.start_date, input.end_date));
  if (clash) {
    throw new Error(`Se solapa con el período ya cerrado ${clash.start_date} a ${clash.end_date}.`);
  }
  const rows = await getConsumption(input.start_date, input.end_date);
  const preview = allocate(input.total_cost, input.criterion, rows);
  await delay();

  const period: OverheadPeriod = {
    id: crypto.randomUUID(),
    ...input,
    closed_by: { id: "me", full_name: "Usuario actual" }, // el backend lo toma del token
    closed_at: new Date().toISOString(),
    allocations: preview.map((p) => ({
      id: crypto.randomUUID(), project: p.project, consumption: p.consumption, amount: p.amount,
    })),
  };
  periods = [...periods, period];
  void mutate(OVERHEAD_KEY);
  return period;
}
