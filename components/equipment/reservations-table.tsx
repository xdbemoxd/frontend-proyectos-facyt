"use client";

import { useReservations } from "@/lib/equipment/use-equipment";
import { Button } from "@/components/ui/button";

const dateTimeFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium", timeStyle: "short" });
const timeFmt = new Intl.DateTimeFormat("es-VE", { timeStyle: "short" });

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function ReservationsTable() {
  const { data, error, isLoading, mutate } = useReservations();

  if (isLoading && !data) {
    return <p className="py-6 text-sm text-muted-foreground" aria-busy="true">Cargando reservas…</p>;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudieron cargar las reservas.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }
  if (!data?.length) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        No hay reservas registradas.
      </p>
    );
  }

  const now = Date.now();

  return (
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
          {data.map((r) => {
            const start = new Date(r.reservation_date);
            const end = new Date(r.end_date);
            const isPast = end.getTime() < now;
            const isNow = start.getTime() <= now && !isPast;
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
  );
}
