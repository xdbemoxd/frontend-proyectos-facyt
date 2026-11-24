"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useReservations } from "@/lib/equipment/use-equipment";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

const dateTimeFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium", timeStyle: "short" });
const timeFmt = new Intl.DateTimeFormat("es-VE", { timeStyle: "short" });

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function ReservationsTable() {
  const { data, error, isLoading, mutate } = useReservations();
  const [query, setQuery] = useState("");

  if (isLoading && !data) {
    return <LoadingState label="Cargando reservas…" />;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudieron cargar las reservas.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  const reservations = data ?? [];
  const q = query.trim().toLowerCase();
  const rows = reservations.filter(
    (r) =>
      !q ||
      r.unit.equipment_name.toLowerCase().includes(q) ||
      (r.unit.serial_number ?? "").toLowerCase().includes(q) ||
      r.project.unique_code.toLowerCase().includes(q) ||
      r.project.name.toLowerCase().includes(q) ||
      r.user.full_name.toLowerCase().includes(q),
  );

  return (
    <div className="flex flex-col gap-4">
      <label className="relative block min-w-60 sm:max-w-sm">
        <span className="sr-only">Buscar reserva</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por equipo, proyecto o responsable"
          className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
      </label>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {q ? "Ninguna reserva coincide con la búsqueda." : "No hay reservas registradas."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Reservas de equipos</caption>
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Equipo</th>
                <th scope="col" className="px-4 py-3">Proyecto</th>
                <th scope="col" className="px-4 py-3">Horario</th>
                <th scope="col" className="px-4 py-3">Reservado por</th>
                <th scope="col" className="px-4 py-3">Propósito</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const start = new Date(r.reservation_date);
                const end = new Date(r.end_date);
                const isPast = end.getTime() < Date.now();
                const isNow = start.getTime() <= Date.now() && !isPast;
                return (
                  <tr key={r.id} className={`border-t align-top ${isPast ? "text-muted-foreground" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.unit.equipment_name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{r.unit.serial_number ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{r.project.unique_code}</div>
                      <div className="text-xs text-muted-foreground">{r.project.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {dateTimeFmt.format(start)} – {sameDay(start, end) ? timeFmt.format(end) : dateTimeFmt.format(end)}
                      {isNow && (
                        <span className="ml-2 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
                          En curso
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{r.user.full_name}</td>
                    <td className="px-4 py-3 text-xs">{r.purpose ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
