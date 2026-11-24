"use client";

import { useState } from "react";
import { Activity, ChevronLeft, ChevronRight, Lock, ShieldAlert, XCircle } from "lucide-react";
import { useAudit } from "@/lib/audit/use-audit";
import { ENTITY_LABELS, OUTCOME_LABELS, actionLabel, entityLabel } from "@/lib/audit/labels";
import type { AuditEntry, AuditFilters, AuditUser, Outcome } from "@/lib/audit/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { OutcomeBadge } from "./outcome-badge";
import { HttpStatusBadge } from "./http-status-badge";
import { AuditDetail } from "./audit-detail";

const dateTimeFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium", timeStyle: "short" });

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function defaultFilters(): AuditFilters {
  const to = new Date();
  const from = new Date(to.getTime() - 6 * 24 * 60 * 60 * 1000); // ultimos 7 dias
  return { from: ymd(from), to: ymd(to), page: 1 };
}

const control =
  "rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function StatCard({ label, value, icon: Icon, tone, active, onClick }: {
  label: string; value: number; icon: React.ComponentType<{ className?: string }>;
  tone: string; active: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`rounded-xl border bg-card p-4 text-left text-card-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring ${active ? "ring-2 ring-ring" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className={`size-4 ${tone}`} aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </button>
  );
}

function AuditLoadingState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-card/60 p-10 text-center"
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner className="size-12" label="Cargando registros de auditoría" />
      <div className="space-y-1">
        <p className="text-sm font-medium">Cargando auditoría…</p>
        <p className="text-xs text-muted-foreground">
          Consultando peticiones, usuarios y eventos de seguridad.
        </p>
      </div>
      <div className="mt-2 w-full max-w-md space-y-2" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-9 animate-pulse rounded-lg bg-muted/70"
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AuditView() {
  const [filters, setFilters] = useState<AuditFilters>(defaultFilters);
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const { data, error, isLoading, mutate } = useAudit(filters);

  // Evita una segunda peticion pesada (/api/users) solo para el filtro.
  const users = Array.from(
    new Map<string, AuditUser>(
      (data?.items ?? [])
        .map((entry) => entry.user)
        .filter((user): user is AuditUser => user !== null)
        .map((user) => [user.id, user]),
    ).values(),
  );

  const set = (patch: Partial<AuditFilters>) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));
  const toggleOutcome = (o?: Outcome) => set({ outcome: filters.outcome === o ? undefined : o });

  const counts = data?.counts ?? { success: 0, denied: 0, failed: 0 };
  const totalRange = counts.success + counts.denied + counts.failed;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        Registro inmutable: las entradas no se pueden editar ni borrar.
      </p>

      <section aria-label="Resumen del período" className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Acciones registradas" value={totalRange} icon={Activity} tone="text-muted-foreground"
          active={!filters.outcome} onClick={() => set({ outcome: undefined })} />
        <StatCard label="Intentos denegados" value={counts.denied} icon={ShieldAlert}
          tone="text-amber-600 dark:text-amber-400" active={filters.outcome === "denied"} onClick={() => toggleOutcome("denied")} />
        <StatCard label="Acciones fallidas" value={counts.failed} icon={XCircle}
          tone="text-red-600 dark:text-red-400" active={filters.outcome === "failed"} onClick={() => toggleOutcome("failed")} />
      </section>

      <form aria-label="Filtros de auditoría" onSubmit={(e) => e.preventDefault()}
        className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Desde
          <input type="date" value={filters.from} max={filters.to} className={control}
            onChange={(e) => e.target.value && set({ from: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Hasta
          <input type="date" value={filters.to} min={filters.from} className={control}
            onChange={(e) => e.target.value && set({ to: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Usuario
          <select value={filters.user_id ?? ""} className={control}
            onChange={(e) => set({ user_id: e.target.value || undefined })}>
            <option value="">Todos</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Entidad
          <select value={filters.entity ?? ""} className={control}
            onChange={(e) => set({ entity: e.target.value || undefined })}>
            <option value="">Todas</option>
            {Object.entries(ENTITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Resultado
          <select value={filters.outcome ?? ""} className={control}
            onChange={(e) => set({ outcome: (e.target.value || undefined) as Outcome | undefined })}>
            <option value="">Todos</option>
            {(Object.keys(OUTCOME_LABELS) as Outcome[]).map((o) => <option key={o} value={o}>{OUTCOME_LABELS[o]}</option>)}
          </select>
        </label>
        <Button type="button" variant="ghost" onClick={() => setFilters(defaultFilters())}>Limpiar filtros</Button>
      </form>

      {error ? (
        <div className="py-6 text-sm text-destructive" role="alert">
          No se pudo cargar la auditoría.{" "}
          <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
        </div>
      ) : !data ? (
        <AuditLoadingState />
      ) : data.items.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No hay registros con estos filtros.
        </p>
      ) : (
        <div className={`relative overflow-x-auto rounded-xl border transition-opacity ${isLoading ? "opacity-60" : ""}`} aria-busy={isLoading}>
          {isLoading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
              <div className="flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-sm">
                <Spinner className="size-5" label="Actualizando auditoría" />
                <span className="text-xs text-muted-foreground">Actualizando…</span>
              </div>
            </div>
          )}
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Registro de auditoría. Selecciona una fila para ver el detalle.</caption>
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Fecha y hora</th>
                <th scope="col" className="px-4 py-3">Usuario</th>
                <th scope="col" className="px-4 py-3">Acción</th>
                <th scope="col" className="px-4 py-3">Petición</th>
                <th scope="col" className="px-4 py-3">Código HTTP</th>
                <th scope="col" className="px-4 py-3">User-Agent</th>
                <th scope="col" className="px-4 py-3">Entidad</th>
                <th scope="col" className="px-4 py-3">Resultado</th>
                <th scope="col" className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((e) => (
                <tr key={e.id} className="cursor-pointer border-t hover:bg-accent/50" onClick={() => setSelected(e)}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button type="button" onClick={(ev) => { ev.stopPropagation(); setSelected(e); }}
                      className="text-left underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">
                      {dateTimeFmt.format(new Date(e.timestamp))}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {e.user ? e.user.full_name : <span className="text-muted-foreground">Usuario eliminado</span>}
                  </td>
                  <td className="px-4 py-3">{actionLabel(e.action)}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {e.method || e.path ? (
                      <span>
                        {e.method}
                        {e.path && <span className="text-muted-foreground"> {e.path}</span>}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <HttpStatusBadge status={e.status_code} />
                  </td>
                  <td className="px-4 py-3">
                    {e.user_agent ? (
                      <span
                        className="block max-w-[220px] truncate font-mono text-xs"
                        title={e.user_agent}
                      >
                        {e.user_agent}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>{entityLabel(e.entity)}</div>
                    {e.entity_label && <div className="text-xs text-muted-foreground">{e.entity_label}</div>}
                  </td>
                  <td className="px-4 py-3"><OutcomeBadge outcome={e.outcome} /></td>
                  <td className="px-4 py-3 font-mono text-xs">{e.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > data.page_size && (
        <nav aria-label="Paginación" className="flex items-center justify-end gap-3 text-sm">
          <span className="text-muted-foreground">
            Página {data.page} de {pages} · {data.total} registros
          </span>
          <Button variant="outline" size="sm" disabled={filters.page <= 1}
            onClick={() => set({ page: filters.page - 1 })}>
            <ChevronLeft className="size-4" aria-hidden="true" /><span className="sr-only">Anterior</span>
          </Button>
          <Button variant="outline" size="sm" disabled={filters.page >= pages}
            onClick={() => set({ page: filters.page + 1 })}>
            <ChevronRight className="size-4" aria-hidden="true" /><span className="sr-only">Siguiente</span>
          </Button>
        </nav>
      )}

      {selected && <AuditDetail entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
