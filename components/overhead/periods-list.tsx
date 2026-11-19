"use client";

import { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import { useOverheadPeriods } from "@/lib/overhead/use-overhead";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const money = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium" });
const numFmt = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat("es-VE", { style: "percent", maximumFractionDigits: 1 });
const asDate = (d: string) => dateFmt.format(new Date(`${d}T12:00:00`));

export function PeriodsList() {
  const { data, error, isLoading, mutate } = useOverheadPeriods();
  const [open, setOpen] = useState<string | null>(null);

  if (isLoading && !data) {
    return <p className="py-6 text-sm text-muted-foreground" aria-busy="true">Cargando períodos…</p>;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudieron cargar los períodos.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }
  if (!data?.length) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Todavía no se ha cerrado ningún período.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        Los períodos cerrados no se pueden modificar.
      </p>
      <ul className="flex flex-col gap-3">
        {data.map((p) => {
          const isOpen = open === p.id;
          return (
            <li key={p.id} className="rounded-xl border bg-card text-card-foreground">
              <button type="button" onClick={() => setOpen(isOpen ? null : p.id)} aria-expanded={isOpen}
                aria-controls={`alloc-${p.id}`}
                className="flex w-full flex-wrap items-center gap-4 rounded-xl p-4 text-left hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-ring">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{asDate(p.start_date)} – {asDate(p.end_date)}</p>
                  <p className="text-xs text-muted-foreground">
                    Reparto {p.criterion} · {p.allocations.length} proyectos · cerrado por {p.closed_by.full_name}
                  </p>
                </div>
                <span className="text-lg font-semibold tabular-nums">{money.format(p.total_cost)}</span>
                <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
              </button>
              {isOpen && (
                <div id={`alloc-${p.id}`} className="overflow-x-auto border-t">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">Reparto del período</caption>
                    <thead className="text-xs uppercase text-muted-foreground">
                      <tr>
                        <th scope="col" className="px-4 py-2">Proyecto</th>
                        <th scope="col" className="px-4 py-2 text-right">Consumo</th>
                        <th scope="col" className="px-4 py-2 text-right">Porcentaje</th>
                        <th scope="col" className="px-4 py-2 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.allocations.map((a) => (
                        <tr key={a.id} className="border-t">
                          <td className="px-4 py-2">
                            <span className="font-mono text-xs">{a.project.unique_code}</span>
                            <span className="ml-2 text-muted-foreground">{a.project.name}</span>
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums">{numFmt.format(a.consumption)}</td>
                          <td className="px-4 py-2 text-right tabular-nums">{pct.format(a.amount / p.total_cost)}</td>
                          <td className="px-4 py-2 text-right font-medium tabular-nums">{money.format(a.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
