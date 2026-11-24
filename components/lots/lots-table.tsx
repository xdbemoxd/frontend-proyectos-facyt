"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useLots } from "@/lib/lots/use-lots";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

const dateFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium" });
const numFmt = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" });

export function LotsTable() {
  const { data, error, isLoading, mutate } = useLots();
  const [query, setQuery] = useState("");

  if (isLoading && !data) {
    return <LoadingState label="Cargando lotes…" />;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudieron cargar los lotes.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  const lots = data ?? [];
  const q = query.trim().toLowerCase();
  const rows = lots.filter(
    (l) =>
      !q ||
      l.supplier_item.resource_name.toLowerCase().includes(q) ||
      l.supplier_item.vendor_name.toLowerCase().includes(q) ||
      (l.invoice_reference ?? "").toLowerCase().includes(q),
  );
  const total = rows.reduce((sum, l) => sum + l.count_raw_materials_in * l.unit_cost, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative block min-w-60 flex-1 sm:max-w-sm">
          <span className="sr-only">Buscar lote</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por material, proveedor o factura"
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
        </label>
        <p className="text-sm text-muted-foreground">
          Total {q ? "filtrado" : "comprado"}: <span className="font-medium tabular-nums text-foreground">{money.format(total)}</span>
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {q ? "Ningún lote coincide con la búsqueda." : "No hay lotes registrados."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Lotes de compra</caption>
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Fecha de ingreso</th>
                <th scope="col" className="px-4 py-3">Material</th>
                <th scope="col" className="px-4 py-3">Proveedor</th>
                <th scope="col" className="px-4 py-3 text-right">Cantidad</th>
                <th scope="col" className="px-4 py-3 text-right">Costo unitario</th>
                <th scope="col" className="px-4 py-3 text-right">Total</th>
                <th scope="col" className="px-4 py-3">Factura</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-4 py-3 whitespace-nowrap">{dateFmt.format(new Date(l.in_date))}</td>
                  <td className="px-4 py-3 font-medium">{l.supplier_item.resource_name}</td>
                  <td className="px-4 py-3">{l.supplier_item.vendor_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {numFmt.format(l.count_raw_materials_in)} <span className="text-muted-foreground">{l.supplier_item.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{money.format(l.unit_cost)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {money.format(l.count_raw_materials_in * l.unit_cost)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{l.invoice_reference ?? <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
