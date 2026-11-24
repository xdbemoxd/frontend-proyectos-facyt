import type {
  AuditEntry,
  AuditFilters,
  AuditPage,
  AuditUser,
  Outcome,
} from "./types";

export const PAGE_SIZE = 50;

type BackendUser = {
  id: string;
  email: string;
  name: string | null;
  lastname: string | null;
};

type BackendEntry = {
  id: string;
  timestamp: string;
  request_id: string | null;
  user_id: string | null;
  user_email: string | null;
  user: BackendUser | null;
  ip_address: string;
  method: string | null;
  path: string | null;
  status_code: number | null;
  user_agent: string | null;
  request_headers: Record<string, string> | null;
  query_params: Record<string, string> | null;
  duration_ms: number | null;
  entity: string;
  action: string;
  entity_id: string | null;
  outcome: Outcome;
  error_code: string | null;
  error_detail: string | null;
  before_data: unknown | null;
  after_data: unknown | null;
};

type BackendPage = {
  items: BackendEntry[];
  total: number;
  limit: number;
  offset: number;
  counts: Record<string, number>;
};

/** Clave estable para useAudit; se traduce a query params del backend. */
export function auditKey(f: AuditFilters): string {
  const p = new URLSearchParams({
    from: f.from,
    to: f.to,
    page: String(f.page),
    page_size: String(PAGE_SIZE),
  });
  if (f.user_id) p.set("user_id", f.user_id);
  if (f.entity) p.set("entity", f.entity);
  if (f.outcome) p.set("outcome", f.outcome);
  return `/audit?${p.toString()}`;
}

function mapUser(
  user: BackendUser | null,
  userId: string | null,
  userEmail: string | null,
): AuditUser | null {
  if (user) {
    const fullName = [user.name, user.lastname].filter(Boolean).join(" ").trim();
    return {
      id: user.id,
      full_name: fullName || user.email,
      email: user.email,
    };
  }
  if (userId) {
    return {
      id: userId,
      full_name: userEmail ?? userId,
      email: userEmail ?? "",
    };
  }
  return null;
}

function mapEntry(entry: BackendEntry): AuditEntry {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    user: mapUser(entry.user, entry.user_id, entry.user_email),
    user_id: entry.user_id,
    user_email: entry.user_email,
    ip_address: entry.ip_address,
    entity: entry.entity,
    action: entry.action,
    entity_id: entry.entity_id,
    entity_label: entry.entity_id,
    outcome: entry.outcome,
    request_id: entry.request_id,
    method: entry.method,
    path: entry.path,
    status_code: entry.status_code,
    user_agent: entry.user_agent,
    duration_ms: entry.duration_ms,
    request_headers: entry.request_headers,
    query_params: entry.query_params,
    error_code: entry.error_code,
    error_detail: entry.error_detail,
    before_str: entry.before_data == null ? null : JSON.stringify(entry.before_data),
    after_str: entry.after_data == null ? null : JSON.stringify(entry.after_data),
  };
}

async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
  } catch {
    // La respuesta no era JSON.
  }
  return `Error ${response.status}`;
}

const inFlight = new Map<string, Promise<AuditPage>>();

/** Deduplica peticiones concurrentes (p. ej. StrictMode en desarrollo). */
export function auditFetcher(key: string): Promise<AuditPage> {
  const existing = inFlight.get(key);
  if (existing) return existing;

  const request = fetchAudit(key).finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}

async function fetchAudit(key: string): Promise<AuditPage> {
  const q = new URLSearchParams(key.split("?")[1] ?? "");
  const page = Math.max(1, Number(q.get("page")) || 1);
  const from = q.get("from") ?? "";
  const to = q.get("to") ?? "";

  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String((page - 1) * PAGE_SIZE),
  });

  if (from) params.set("from_date", new Date(`${from}T00:00:00`).toISOString());
  if (to) params.set("to_date", new Date(`${to}T23:59:59.999`).toISOString());

  for (const field of ["user_id", "entity", "outcome"] as const) {
    const value = q.get(field);
    if (value) params.set(field, value);
  }

  const response = await fetch(`/api/audit?${params.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await readError(response));

  const data = (await response.json()) as BackendPage;
  const counts: Record<Outcome, number> = {
    success: data.counts?.success ?? 0,
    denied: data.counts?.denied ?? 0,
    failed: data.counts?.failed ?? 0,
  };

  return {
    items: data.items.map(mapEntry),
    total: data.total,
    page,
    page_size: PAGE_SIZE,
    counts,
  };
}
