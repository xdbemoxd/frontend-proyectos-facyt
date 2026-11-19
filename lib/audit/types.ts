export type Outcome = "success" | "denied" | "failed";

/** Fila de private.audit_log con el usuario resuelto (null si fue eliminado). */
export type AuditEntry = {
  id: string;
  timestamp: string; // ISO
  user: { id: string; full_name: string; email: string } | null;
  ip_address: string;
  entity: string; // p. ej. "Project"
  action: string; // p. ej. "update_priority"
  entity_id: string | null;
  entity_label: string | null; // texto legible (codigo, nombre…), lo arma el backend
  outcome: Outcome;
  before_str: string | null; // JSON
  after_str: string | null; // JSON
};

/** Filtros = query params de GET /audit. */
export type AuditFilters = {
  from: string; // YYYY-MM-DD
  to: string;
  user_id?: string;
  entity?: string;
  outcome?: Outcome;
  page: number;
};

/** Respuesta paginada de GET /audit. */
export type AuditPage = {
  items: AuditEntry[];
  total: number;
  page: number;
  page_size: number;
  counts: Record<Outcome, number>; // totales del rango (sin paginar)
};
