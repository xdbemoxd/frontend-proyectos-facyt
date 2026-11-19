export type Criterion = "proporcional" | "equitativo";

/** Fila de private.overhead_allocation con el proyecto resuelto. */
export type Allocation = {
  id: string;
  project: { id: string; unique_code: string; name: string };
  consumption: number;
  amount: number;
};

/** Fila de private.overhead_period con sus repartos. */
export type OverheadPeriod = {
  id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  criterion: Criterion;
  total_cost: number;
  closed_by: { id: string; full_name: string };
  closed_at: string;
  allocations: Allocation[];
};

/** POST /overhead/periods. El backend calcula y guarda los repartos. */
export type ClosePeriodInput = {
  start_date: string;
  end_date: string;
  criterion: Criterion;
  total_cost: number;
};
