import type { Criterion } from "./types";

export type ProjectConsumption = {
  project: { id: string; unique_code: string; name: string };
  consumption: number;
};

export type AllocationPreview = ProjectConsumption & { share: number; amount: number };

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Reparte `total` entre los proyectos. Al ultimo se le asigna lo que falte
 * para que la suma cuadre exacto con el total (sin perder centavos).
 * Misma logica que debe usar FastAPI al cerrar el periodo.
 */
export function allocate(total: number, criterion: Criterion, rows: ProjectConsumption[]): AllocationPreview[] {
  if (rows.length === 0) throw new Error("No hay proyectos activos en el período.");
  const totalConsumption = rows.reduce((s, r) => s + r.consumption, 0);
  if (criterion === "proporcional" && totalConsumption <= 0) {
    throw new Error("No hubo consumo registrado en el período. Usa el criterio equitativo.");
  }

  let assigned = 0;
  return rows.map((r, i) => {
    const share = criterion === "equitativo" ? 1 / rows.length : r.consumption / totalConsumption;
    const amount = i === rows.length - 1 ? round2(total - assigned) : round2(total * share);
    assigned = round2(assigned + amount);
    return { ...r, share, amount };
  });
}
