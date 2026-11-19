"use client";

import { useProjects } from "@/lib/projects/use-projects";
import type { Project } from "@/lib/projects/types";
import { isProjectLocked } from "@/lib/projects/api";
import { Button } from "@/components/ui/button";
import { EditLink } from "@/components/forms/edit-link";

const STATUS_STYLES: Record<string, string> = {
  Propuesta: "bg-slate-100 text-slate-700",
  "En ejecución": "bg-blue-100 text-blue-700",
  Suspendido: "bg-amber-100 text-amber-800",
  Finalizado: "bg-green-100 text-green-700",
};

const PRIORITY_STYLES: Record<string, string> = {
  Crítica: "bg-red-100 text-red-700",
  Alta: "bg-orange-100 text-orange-700",
  Media: "bg-yellow-100 text-yellow-800",
  Baja: "bg-gray-100 text-gray-700",
};

const dateFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium" });

function Badge({ label, styles }: { label: string; styles: Record<string, string> }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[label] ?? "bg-gray-100"}`}>
      {label}
    </span>
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-28">
      <div className="mb-1 text-xs tabular-nums">{value.toFixed(2)}%</div>
      <div
        className="h-1.5 w-full rounded-full bg-gray-200"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function Row({ p }: { p: Project }) {
  return (
    <tr className="border-b align-top last:border-0">
      <td className="px-3 py-3 font-mono text-xs">{p.unique_code}</td>
      <td className="px-3 py-3">
        <div className="font-medium">{p.name}</div>
        <div className="text-xs text-gray-500">{p.description ?? "Sin descripción"}</div>
      </td>
      <td className="px-3 py-3"><Badge label={p.status.name} styles={STATUS_STYLES} /></td>
      <td className="px-3 py-3"><Badge label={p.priority.name} styles={PRIORITY_STYLES} /></td>
      <td className="px-3 py-3"><ProgressBar value={p.progress} label={`Avance de ${p.name}`} /></td>
      <td className="px-3 py-3"><ProgressBar value={p.budget_execution} label={`Ejecución presupuestaria de ${p.name}`} /></td>
      <td className="px-3 py-3">
        <div>{p.user.full_name}</div>
        <div className="text-xs text-gray-500">{p.user.email}</div>
      </td>
      <td className="px-3 py-3 text-xs whitespace-nowrap">{dateFmt.format(new Date(p.create_at))}</td>
      <td className="px-3 py-3 text-xs whitespace-nowrap">{dateFmt.format(new Date(p.updated_at))}</td>
      <td className="px-3 py-3 text-right">
        <EditLink href={`/dashboard/projects/${p.id}/edit`} label={p.name}
          disabled={isProjectLocked(p)} disabledReason="Proyecto finalizado" />
      </td>
    </tr>
  );
}

export function ProjectsTable() {
  const { data, error, isLoading, mutate } = useProjects();

  if (isLoading && !data) {
    return <p className="p-6 text-sm text-gray-500" aria-busy="true">Cargando proyectos…</p>;
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600" role="alert">
        No se pudieron cargar los proyectos.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  if (!data?.length) {
    return <p className="p-6 text-sm text-gray-500">No hay proyectos registrados.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Listado de proyectos</caption>
        <thead className="bg-gray-50 text-xs uppercase text-gray-600">
          <tr>
            <th scope="col" className="px-3 py-2">Código</th>
            <th scope="col" className="px-3 py-2">Proyecto</th>
            <th scope="col" className="px-3 py-2">Estatus</th>
            <th scope="col" className="px-3 py-2">Prioridad</th>
            <th scope="col" className="px-3 py-2">Avance</th>
            <th scope="col" className="px-3 py-2">Ejec. presupuestaria</th>
            <th scope="col" className="px-3 py-2">Responsable</th>
            <th scope="col" className="px-3 py-2">Creado</th>
            <th scope="col" className="px-3 py-2">Actualizado</th>
            <th scope="col" className="px-3 py-2"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => <Row key={p.id} p={p} />)}
        </tbody>
      </table>
    </div>
  );
}
