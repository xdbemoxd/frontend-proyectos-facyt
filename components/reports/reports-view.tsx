"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, Printer } from "lucide-react";
import { useExpenses } from "@/lib/expenses/use-expenses";
import { useOverheadPeriods } from "@/lib/overhead/use-overhead";
import { useEquipment, useReservations } from "@/lib/equipment/use-equipment";
import { downloadCsv, type Column } from "@/lib/reports/export";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

type ReportId = "expenses" | "overhead" | "equipment";

const REPORTS: { id: ReportId; title: string; description: string }[] = [
  { id: "expenses", title: "Análisis de gastos", description: "Solicitudes de gasto por proyecto y estado." },
  { id: "overhead", title: "Resumen de prorrateo", description: "Reparto de consumibles compartidos por período y proyecto." },
  { id: "equipment", title: "Hoja de vida de equipos", description: "Cada unidad con su estado y su historial de reservas." },
];

const dateFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium" });
const dateTimeFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "short", timeStyle: "short" });
const money = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" });
const asDate = (d: string) => dateFmt.format(new Date(d.length === 10 ? `${d}T12:00:00` : d));

type Row = Record<string, string | number | null>;
type Report = { columns: Column<Row>[]; rows: Row[]; summary: string[] };

const col = (header: string, key: string): Column<Row> => ({ header, value: (r) => r[key] ?? null });

export function ReportsView() {
  const [active, setActive] = useState<ReportId>("expenses");
  const expenses = useExpenses();
  const periods = useOverheadPeriods();
  const units = useEquipment();
  const reservations = useReservations();

  const loading =
    (active === "expenses" && !expenses.data) ||
    (active === "overhead" && !periods.data) ||
    (active === "equipment" && (!units.data || !reservations.data));

  const report = useMemo<Report | null>(() => {
    if (active === "expenses" && expenses.data) {
      const rows = expenses.data.map((e) => ({
        proyecto: e.project.unique_code,
        descripcion: e.description,
        material: e.supplier_item?.resource_name ?? "—",
        cantidad: e.count_raw_materials,
        unidad: e.supplier_item?.unit ?? "",
        estado: e.status.name,
        creada: asDate(e.created_at),
        actualizada: asDate(e.modifiet_at),
      }));
      const by = (code: string) => expenses.data!.filter((e) => e.status.code === code).length;
      return {
        rows,
        columns: [
          col("Proyecto", "proyecto"), col("Descripción", "descripcion"), col("Material", "material"),
          col("Cantidad", "cantidad"), col("Unidad", "unidad"), col("Estado", "estado"),
          col("Creada", "creada"), col("Actualizada", "actualizada"),
        ],
        summary: [
          `${rows.length} solicitudes`,
          `${by("pending")} pendientes`, `${by("approved")} aprobadas`,
          `${by("executed")} ejecutadas`, `${by("rejected")} rechazadas`,
        ],
      };
    }
    if (active === "overhead" && periods.data) {
      const rows = periods.data.flatMap((p) =>
        p.allocations.map((a) => ({
          periodo: `${asDate(p.start_date)} – ${asDate(p.end_date)}`,
          criterio: p.criterion,
          proyecto: a.project.unique_code,
          consumo: a.consumption,
          porcentaje: p.total_cost ? Math.round((a.amount / p.total_cost) * 1000) / 10 : 0,
          monto: a.amount,
        })),
      );
      const total = periods.data.reduce((s, p) => s + p.total_cost, 0);
      return {
        rows,
        columns: [
          col("Período", "periodo"), col("Criterio", "criterio"), col("Proyecto", "proyecto"),
          col("Consumo", "consumo"), col("Porcentaje (%)", "porcentaje"), col("Monto (USD)", "monto"),
        ],
        summary: [`${periods.data.length} períodos cerrados`, `Total prorrateado: ${money.format(total)}`],
      };
    }
    if (active === "equipment" && units.data && reservations.data) {
      const now = Date.now();
      const rows = units.data.map((u) => {
        const res = reservations.data!.filter((r) => r.unit.id === u.id);
        const hours = res.reduce(
          (s, r) => s + (new Date(r.end_date).getTime() - new Date(r.reservation_date).getTime()) / 3_600_000, 0);
        const last = res
          .filter((r) => new Date(r.reservation_date).getTime() <= now)
          .sort((a, b) => b.reservation_date.localeCompare(a.reservation_date))[0];
        return {
          equipo: u.equipment.name,
          modelo: u.model ?? "—",
          serial: u.serial_number ?? "—",
          proveedor: u.vendor.name,
          estado: u.status.name,
          alta: asDate(u.create_at),
          reservas: res.length,
          horas: Math.round(hours * 10) / 10,
          ultimo_uso: last ? `${dateTimeFmt.format(new Date(last.reservation_date))} · ${last.project.unique_code}` : "—",
        };
      });
      const count = (s: string) => units.data!.filter((u) => u.status.name === s).length;
      return {
        rows,
        columns: [
          col("Equipo", "equipo"), col("Modelo", "modelo"), col("N.º de serie", "serial"),
          col("Proveedor", "proveedor"), col("Estado", "estado"), col("Alta", "alta"),
          col("Reservas", "reservas"), col("Horas reservadas", "horas"), col("Último uso", "ultimo_uso"),
        ],
        summary: [
          `${rows.length} unidades`, `${count("Disponible")} disponibles`,
          `${count("En uso")} en uso`, `${count("En mantenimiento")} en mantenimiento`,
        ],
      };
    }
    return null;
  }, [active, expenses.data, periods.data, units.data, reservations.data]);

  const meta = REPORTS.find((r) => r.id === active)!;
  const today = new Date();
  const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Tipo de reporte" className="grid gap-3 sm:grid-cols-3 print:hidden">
        {REPORTS.map((r) => (
          <button key={r.id} type="button" role="tab" aria-selected={active === r.id}
            onClick={() => setActive(r.id)}
            className={`rounded-xl border bg-card p-4 text-left text-card-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring ${active === r.id ? "ring-2 ring-ring" : ""}`}>
            <p className="font-medium">{r.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
          </button>
        ))}
      </div>

      <section role="tabpanel" aria-labelledby="report-title" className="rounded-xl border bg-card p-5 text-card-foreground print:border-0 print:p-0">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="report-title" className="font-heading text-lg font-medium">{meta.title}</h2>
            <p className="text-xs text-muted-foreground">
              Control de Proyectos FaCyT · generado el{" "}
              <time dateTime={today.toISOString()} suppressHydrationWarning>
                {dateTimeFmt.format(today)}
              </time>
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" disabled={!report?.rows.length}
              onClick={() => report && downloadCsv(`${active}-${stamp}`, report.columns, report.rows)}>
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              Excel
            </Button>
            <Button size="sm" disabled={!report?.rows.length} onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden="true" />
              PDF
            </Button>
          </div>
        </div>

        {loading || !report ? (
          <LoadingState label="Cargando datos…" />
        ) : report.rows.length === 0 ? (
          <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No hay datos para este reporte.
          </p>
        ) : (
          <>
            <ul className="mb-4 flex flex-wrap gap-2 text-xs">
              {report.summary.map((s) => (
                <li key={s} className="rounded-full bg-muted px-3 py-1">{s}</li>
              ))}
            </ul>
            <div className="overflow-x-auto rounded-lg border print:overflow-visible">
              <table className="w-full text-left text-sm print:text-xs">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>{report.columns.map((c) => <th key={c.header} scope="col" className="px-3 py-2">{c.header}</th>)}</tr>
                </thead>
                <tbody>
                  {report.rows.map((r, i) => (
                    <tr key={i} className="border-t break-inside-avoid">
                      {report.columns.map((c) => {
                        const v = c.value(r);
                        return (
                          <td key={c.header} className={`px-3 py-2 ${typeof v === "number" ? "text-right tabular-nums" : ""}`}>
                            {typeof v === "number" ? v.toLocaleString("es-VE") : v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
