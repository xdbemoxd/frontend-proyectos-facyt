"use client";

import { useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { useStock } from "@/lib/inventory/use-stock";
import { RESOURCE_TYPES } from "@/lib/inventory/mock";
import { Button } from "@/components/ui/button";
import { StockBadge } from "./stock-badge";

const numFmt = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });

export function StockTable() {
  const { data, error, isLoading, mutate } = useStock();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [onlyCritical, setOnlyCritical] = useState(false);

  if (isLoading && !data) {
    return <p className="py-6 text-sm text-muted-foreground" aria-busy="true">Cargando inventario…</p>;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudo cargar el inventario.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  const items = data ?? [];
  const critical = items.filter((i) => i.is_critical);
  const q = query.trim().toLowerCase();
  const rows = items.filter(
    (i) =>
      (!onlyCritical || i.is_critical) &&
      (!type || i.resource_type === type) &&
      (!q || i.resource_name.toLowerCase().includes(q) || i.vendor_name.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-4">
      {critical.length > 0 && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium">
              {critical.length} {critical.length === 1 ? "material está" : "materiales están"} en el mínimo o agotados
            </p>
            <p className="text-muted-foreground">{critical.map((c) => c.resource_name).join(", ")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOnlyCritical((v) => !v)}>
            {onlyCritical ? "Ver todos" : "Ver solo críticos"}
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <label className="relative block min-w-60 flex-1 sm:max-w-sm">
          <span className="sr-only">Buscar material</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por material o proveedor"
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
        </label>
        <label>
          <span className="sr-only">Filtrar por tipo</span>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="">Todos los tipos</option>
            {RESOURCE_TYPES.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {q || type || onlyCritical ? "Ningún material coincide con el filtro." : "No hay materias primas registradas."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Stock de materias primas por proveedor</caption>
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Material</th>
                <th scope="col" className="px-4 py-3">Tipo</th>
                <th scope="col" className="px-4 py-3">Proveedor</th>
                <th scope="col" className="px-4 py-3 text-right">Stock actual</th>
                <th scope="col" className="px-4 py-3 text-right">Mínimo</th>
                <th scope="col" className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.supplier_item_id} className="border-t">
                  <td className="px-4 py-3 font-medium">{i.resource_name}</td>
                  <td className="px-4 py-3">{i.resource_type}</td>
                  <td className="px-4 py-3">{i.vendor_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {numFmt.format(i.current_stock)} <span className="text-muted-foreground">{i.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {numFmt.format(i.minimun_stock)} {i.unit}
                  </td>
                  <td className="px-4 py-3"><StockBadge status={i.stock_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
