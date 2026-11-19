"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useEquipment } from "@/lib/equipment/use-equipment";
import { EQUIPMENT_STATUS } from "@/lib/equipment/mock";
import { Button } from "@/components/ui/button";
import { EditLink } from "@/components/forms/edit-link";
import { EquipmentStatusBadge } from "./status-badge";

export function EquipmentTable() {
  const { data, error, isLoading, mutate } = useEquipment();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  if (isLoading && !data) {
    return <p className="py-6 text-sm text-muted-foreground" aria-busy="true">Cargando equipos…</p>;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudieron cargar los equipos.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  const units = data ?? [];
  const q = query.trim().toLowerCase();
  const rows = units.filter(
    (u) =>
      (!status || u.status.name === status) &&
      (!q ||
        u.equipment.name.toLowerCase().includes(q) ||
        (u.serial_number ?? "").toLowerCase().includes(q) ||
        (u.model ?? "").toLowerCase().includes(q)),
  );
  const count = (name: string) => units.filter((u) => u.status.name === name).length;

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Resumen por estado" className="grid gap-3 sm:grid-cols-3">
        {EQUIPMENT_STATUS.map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-4 text-card-foreground">
            <EquipmentStatusBadge name={s.name} />
            <p className="mt-2 text-2xl font-semibold tabular-nums">{count(s.name)}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <label className="relative block min-w-60 flex-1 sm:max-w-sm">
          <span className="sr-only">Buscar equipo</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, modelo o serial"
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
        </label>
        <label>
          <span className="sr-only">Filtrar por estado</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="">Todos los estados</option>
            {EQUIPMENT_STATUS.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {q || status ? "Ningún equipo coincide con el filtro." : "No hay equipos registrados."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Listado de equipos</caption>
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Equipo</th>
                <th scope="col" className="px-4 py-3">Modelo</th>
                <th scope="col" className="px-4 py-3">N.º de serie</th>
                <th scope="col" className="px-4 py-3">Proveedor</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.equipment.name}</div>
                    <div className="text-xs text-muted-foreground">{u.equipment.description ?? "Sin descripción"}</div>
                  </td>
                  <td className="px-4 py-3">{u.model ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 font-mono text-xs">{u.serial_number ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3">{u.vendor.name}</td>
                  <td className="px-4 py-3"><EquipmentStatusBadge name={u.status.name} /></td>
                  <td className="px-4 py-3 text-right">
                    <EditLink href={`/dashboard/equipment/${u.id}/edit`} label={u.equipment.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
