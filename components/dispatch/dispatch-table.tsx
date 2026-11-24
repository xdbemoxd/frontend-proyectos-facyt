"use client";

import { useState } from "react";
import { Lock, Search } from "lucide-react";
import { useDispatches } from "@/lib/dispatch/use-dispatch";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

const dateTimeFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium", timeStyle: "short" });
const numFmt = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });

export function DispatchTable() {
  const { data, error, isLoading, mutate } = useDispatches();
  const [query, setQuery] = useState("");
  const [project, setProject] = useState("");

  if (isLoading && !data) {
    return <LoadingState label="Cargando bitácora…" />;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudo cargar la bitácora.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  const items = data ?? [];
  const projects = Array.from(new Map(items.map((d) => [d.project.id, d.project])).values());
  const q = query.trim().toLowerCase();
  const rows = items.filter(
    (d) =>
      (!project || d.project.id === project) &&
      (!q ||
        d.supplier_item.resource_name.toLowerCase().includes(q) ||
        d.user.full_name.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        Historial inalterable: los despachos no se pueden editar ni borrar.
      </p>

      <div className="flex flex-wrap gap-3">
        <label className="relative block min-w-60 flex-1 sm:max-w-sm">
          <span className="sr-only">Buscar despacho</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por insumo o responsable"
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
        </label>
        <label>
          <span className="sr-only">Filtrar por proyecto</span>
          <select value={project} onChange={(e) => setProject(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="">Todos los proyectos</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.unique_code}</option>)}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {q || project ? "Ningún despacho coincide con el filtro." : "No hay despachos registrados."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Bitácora de despachos</caption>
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Fecha y hora</th>
                <th scope="col" className="px-4 py-3">Proyecto destino</th>
                <th scope="col" className="px-4 py-3">Insumo</th>
                <th scope="col" className="px-4 py-3 text-right">Cantidad</th>
                <th scope="col" className="px-4 py-3">Responsable</th>
                <th scope="col" className="px-4 py-3">Notas</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-t align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{dateTimeFmt.format(new Date(d.material_requested_at))}</td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs">{d.project.unique_code}</div>
                    <div className="text-xs text-muted-foreground">{d.project.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{d.supplier_item.resource_name}</div>
                    <div className="text-xs text-muted-foreground">{d.supplier_item.vendor_name}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                    {numFmt.format(d.use_raw_materials)} <span className="text-muted-foreground">{d.supplier_item.unit}</span>
                  </td>
                  <td className="px-4 py-3">{d.user.full_name}</td>
                  <td className="px-4 py-3 text-xs">{d.notes ?? <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
