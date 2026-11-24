"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useExpenses } from "@/lib/expenses/use-expenses";
import { useOverheadPeriods } from "@/lib/overhead/use-overhead";
import { useEquipment, useReservations } from "@/lib/equipment/use-equipment";
import {
  downloadReport,
  type ReportFormat,
} from "@/lib/reports/download";
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
type ReportColumn = {
  header: string;
  value: (row: Row) => string | number | null;
};
type Report = { columns: ReportColumn[]; rows: Row[]; summary: string[] };

const col = (header: string, key: string): ReportColumn => ({
  header,
  value: (r) => r[key] ?? null,
});

export function ReportsView({ canViewOverhead = false }: { canViewOverhead?: boolean }) {
  const [active, setActive] = useState<ReportId>("expenses");
  const [pendingFormat, setPendingFormat] = useState<ReportFormat | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const expenses = useExpenses();
  const periods = useOverheadPeriods(canViewOverhead);
  const units = useEquipment();
  const reservations = useReservations();
  const visibleReports = REPORTS.filter((r) => r.id !== "overhead" || canViewOverhead);

  const loading =
    (active === "expenses" && !expenses.data) ||
    (active === "overhead" && !periods.data) ||
    (active === "equipment" && (!units.data || !reservations.data));

  const loadError =
    (active === "expenses" && expenses.error) ||
    (active === "overhead" && periods.error) ||
    (active === "equipment" && (units.error || reservations.error));

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

  const meta = visibleReports.find((r) => r.id === active)!;
  const today = new Date();
  const hasData = Boolean(report && report.rows.length > 0);
  const busy = pendingFormat !== null;

  async function handleDownload(format: ReportFormat) {
    if (!hasData || busy) return;
    setPendingFormat(format);
    setDownloadError(null);
    try {
      await downloadReport(active, format);
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "No se pudo generar el reporte."
      );
    } finally {
      setPendingFormat(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Tipo de reporte" className="grid gap-3 sm:grid-cols-3 print:hidden">
        {visibleReports.map((r) => (
          <button key={r.id} type="button" role="tab" aria-selected={active === r.id}
            onClick={() => { setActive(r.id); setDownloadError(null); }}
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
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasData || busy}
              aria-busy={pendingFormat === "xlsx"}
              onClick={() => handleDownload("xlsx")}
            >
              {pendingFormat === "xlsx" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <FileSpreadsheet className="size-4" aria-hidden="true" />
              )}
              {pendingFormat === "xlsx" ? "Generando…" : "Excel (XLSX)"}
            </Button>
            <Button
              size="sm"
              disabled={!hasData || busy}
              aria-busy={pendingFormat === "pdf"}
              onClick={() => handleDownload("pdf")}
            >
              {pendingFormat === "pdf" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <FileText className="size-4" aria-hidden="true" />
              )}
              {pendingFormat === "pdf" ? "Generando…" : "PDF"}
            </Button>
          </div>
        </div>

        {downloadError ? (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {downloadError}
          </p>
        ) : null}

        {loadError ? (
          <p role="alert" className="rounded-xl border border-destructive/30 p-6 text-sm text-destructive">
            No se pudieron cargar los datos del reporte. Intenta recargar la página.
          </p>
        ) : loading || !report ? (
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
