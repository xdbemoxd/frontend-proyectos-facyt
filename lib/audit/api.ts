import { MOCK_AUDIT } from "./mock";
import type { AuditFilters, AuditPage, Outcome } from "./types";

export const PAGE_SIZE = 50;

/** Clave de SWR = URL con los filtros. El backend recibe los mismos query params. */
export function auditKey(f: AuditFilters): string {
  const p = new URLSearchParams({ from: f.from, to: f.to, page: String(f.page), page_size: String(PAGE_SIZE) });
  if (f.user_id) p.set("user_id", f.user_id);
  if (f.entity) p.set("entity", f.entity);
  if (f.outcome) p.set("outcome", f.outcome);
  return `/audit?${p.toString()}`;
}

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/**
 * MAÑANA:
 *   const res = await fetch(`/api${key}`);
 *   if (!res.ok) throw new Error("No se pudo cargar la auditoría");
 *   return res.json(); // { items, total, page, page_size, counts }
 */
export async function auditFetcher(key: string): Promise<AuditPage> {
  await delay();
  const q = new URLSearchParams(key.split("?")[1] ?? "");
  const from = new Date(`${q.get("from")}T00:00:00`).getTime();
  const to = new Date(`${q.get("to")}T23:59:59.999`).getTime();
  const page = Math.max(1, Number(q.get("page")) || 1);
  const userId = q.get("user_id");
  const entity = q.get("entity");
  const outcome = q.get("outcome") as Outcome | null;

  const inRange = MOCK_AUDIT.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t >= from && t <= to && (!userId || e.user?.id === userId) && (!entity || e.entity === entity);
  });
  const counts: Record<Outcome, number> = { success: 0, denied: 0, failed: 0 };
  inRange.forEach((e) => counts[e.outcome]++);

  const filtered = inRange
    .filter((e) => !outcome || e.outcome === outcome)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return {
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: filtered.length,
    page,
    page_size: PAGE_SIZE,
    counts,
  };
}
