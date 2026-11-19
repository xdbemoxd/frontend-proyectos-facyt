"use client";

import Link from "next/link";
import { AlertTriangle, FolderKanban, Wallet } from "lucide-react";
import { useProjects } from "@/lib/projects/use-projects";
import { useStock } from "@/lib/inventory/use-stock";

const pct = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 1 });

function Card({
  label, value, detail, icon: Icon, tone = "default", href,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warning";
  href?: string;
}) {
  const body = (
    <div className={`h-full rounded-xl border bg-card p-5 text-card-foreground transition-colors ${href ? "hover:bg-accent" : ""} ${tone === "warning" ? "border-amber-500/40" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className={`size-4 ${tone === "warning" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`} aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
  return href ? <Link href={href} className="rounded-xl focus-visible:outline-2 focus-visible:outline-ring">{body}</Link> : body;
}

/** KPIs del dashboard ejecutivo, calculados con los mismos hooks de cada seccion. */
export function DashboardKpis() {
  const { data: projects, isLoading: lp } = useProjects();
  const { data: stock, isLoading: ls } = useStock();

  if ((lp && !projects) || (ls && !stock)) {
    return (
      <section aria-label="Indicadores" aria-busy="true" className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl border bg-muted" />)}
      </section>
    );
  }

  const all = projects ?? [];
  const active = all.filter((p) => p.status.name === "En ejecución");
  const avgBudget = active.length
    ? active.reduce((s, p) => s + p.budget_execution, 0) / active.length
    : 0;
  const avgProgress = active.length
    ? active.reduce((s, p) => s + p.progress, 0) / active.length
    : 0;

  const critical = (stock ?? []).filter((s) => s.is_critical);
  const outOfStock = critical.filter((s) => s.current_stock <= 0).length;

  return (
    <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-3">
      <Card label="Proyectos activos" icon={FolderKanban}
        value={`${active.length}`}
        detail={`de ${all.length} proyectos · avance promedio ${pct.format(avgProgress)}%`} />
      <Card label="Presupuesto ejecutado" icon={Wallet}
        value={`${pct.format(avgBudget)}%`}
        detail="promedio de los proyectos en ejecución" />
      <Card label="Alertas de stock" icon={AlertTriangle}
        tone={critical.length ? "warning" : "default"}
        value={`${critical.length}`}
        detail={critical.length ? `${outOfStock} agotados · ${critical.length - outOfStock} en el mínimo` : "Todo el inventario está en niveles normales"}
        href="/dashboard/inventory" />
    </section>
  );
}
