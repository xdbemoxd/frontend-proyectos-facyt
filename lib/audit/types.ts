export type Outcome = "success" | "denied" | "failed";

export type AuditUser = {
  id: string;
  full_name: string;
  email: string;
};

/** Fila de private.audit_log con el usuario resuelto. */
export type AuditEntry = {
  id: string;
  timestamp: string;
  user: AuditUser | null;
  user_id: string | null;
  user_email: string | null;
  ip_address: string;
  entity: string;
  action: string;
  entity_id: string | null;
  entity_label: string | null;
  outcome: Outcome;

  // Metadata HTTP
  request_id: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  user_agent: string | null;
  duration_ms: number | null;
  request_headers: Record<string, string> | null;
  query_params: Record<string, string> | null;
  error_code: string | null;
  error_detail: string | null;

  // Snapshots serializados para el diff
  before_str: string | null;
  after_str: string | null;
};

export type AuditFilters = {
  from: string;
  to: string;
  user_id?: string;
  entity?: string;
  outcome?: Outcome;
  page: number;
};

export type AuditPage = {
  items: AuditEntry[];
  total: number;
  page: number;
  page_size: number;
  counts: Record<Outcome, number>;
};
