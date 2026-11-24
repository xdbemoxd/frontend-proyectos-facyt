"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useExpenses } from "@/lib/expenses/use-expenses";
import { changeExpenseStatus } from "@/lib/expenses/api";
import { ACTION_LABELS, EXPENSE_STATUS, TRANSITIONS } from "@/lib/expenses/mock";
import type { ExpenseStatusCode } from "@/lib/expenses/types";
import { Button } from "@/components/ui/button";
import { ExpenseStatusBadge } from "./expense-status-badge";
import { LoadingState } from "@/components/ui/loading-state";

const FLOW: ExpenseStatusCode[] = ["draft", "pending", "approved", "executed"];
const numFmt = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });
const dateTimeFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium", timeStyle: "short" });

export function ExpensesBoard() {
  const { data, error, isLoading, mutate } = useExpenses();
  const [filter, setFilter] = useState<ExpenseStatusCode | "">("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (isLoading && !data) {
    return <LoadingState label="Cargando solicitudes…" />;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudieron cargar las solicitudes.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  const all = data ?? [];
  const count = (code: ExpenseStatusCode) => all.filter((e) => e.status.code === code).length;
  const rows = all.filter((e) => !filter || e.status.code === filter);

  async function move(id: string, to: ExpenseStatusCode) {
    if (to === "rejected" && !window.confirm("¿Rechazar esta solicitud? No se podrá reabrir.")) return;
    setBusy(id);
    setMessage(null);
    try {
      const updated = await changeExpenseStatus(id, to);
      setMessage({ ok: true, text: `Solicitud pasada a "${updated.status.name}".` });
      await mutate();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "No se pudo cambiar el estado." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Flujo y filtro por estado */}
      <nav aria-label="Filtrar por estado" className="flex flex-wrap items-center gap-1.5 text-sm">
        <button type="button" onClick={() => setFilter("")} aria-pressed={filter === ""}
          className={`rounded-lg px-3 py-1.5 ${filter === "" ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent"}`}>
          Todas ({all.length})
        </button>
        {FLOW.map((code, i) => (
          <span key={code} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />}
            <button type="button" onClick={() => setFilter(code)} aria-pressed={filter === code}
              className={`rounded-lg px-3 py-1.5 ${filter === code ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent"}`}>
              {EXPENSE_STATUS[code].name} ({count(code)})
            </button>
            {code === "pending" && (
              <button type="button" onClick={() => setFilter("rejected")} aria-pressed={filter === "rejected"}
                className={`rounded-lg px-3 py-1.5 ${filter === "rejected" ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent"}`}>
                / Rechazado ({count("rejected")})
              </button>
            )}
          </span>
        ))}
      </nav>

      {message && (
        <p role="status"
          className={`rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>
          {message.text}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {filter ? "No hay solicitudes en este estado." : "No hay solicitudes registradas."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((e) => {
            const next = TRANSITIONS[e.status.code];
            return (
              <li key={e.id} className="rounded-xl border bg-card p-4 text-card-foreground">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ExpenseStatusBadge code={e.status.code} name={e.status.name} />
                      <span className="font-mono text-xs text-muted-foreground">{e.project.unique_code}</span>
                    </div>
                    <p className="mt-1.5 font-medium">{e.description}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {e.supplier_item
                        ? `${numFmt.format(e.count_raw_materials)} ${e.supplier_item.unit} de ${e.supplier_item.resource_name} · ${e.supplier_item.vendor_name}`
                        : `Cantidad: ${numFmt.format(e.count_raw_materials)} · sin material del catálogo`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.project.name} · actualizada {dateTimeFmt.format(new Date(e.modifiet_at))}
                    </p>
                  </div>
                  {next.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {next.map((to) => (
                        <Button key={to} size="sm" disabled={busy === e.id}
                          variant={to === "rejected" ? "destructive" : to === "approved" || to === "executed" ? "default" : "outline"}
                          onClick={() => move(e.id, to)}>
                          {busy === e.id ? "…" : ACTION_LABELS[to]}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
