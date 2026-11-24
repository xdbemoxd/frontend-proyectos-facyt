"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { useProjects, usePriorityLog, useProjectCatalogs } from "@/lib/projects/use-projects";
import { changeProjectPriority } from "@/lib/projects/api";
import { priorityChangeSchema, type PriorityChangeErrors } from "@/lib/projects/schema";
import type { Catalog, Project } from "@/lib/projects/types";
import { Button } from "@/components/ui/button";
import { SelectField, TextareaField, zodFieldErrors } from "@/components/forms/form-field";
import { LoadingState } from "@/components/ui/loading-state";

const PRIORITY_STYLES: Record<string, string> = {
  Crítica: "bg-red-500/10 text-red-700 dark:bg-red-400/10 dark:text-red-300",
  Alta: "bg-orange-500/10 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300",
  Media: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300",
  Baja: "bg-muted text-muted-foreground",
};

const PRIORITY_RANK: Record<string, number> = { critica: 0, alta: 1, media: 2, baja: 3 };

/** Ordena por severidad real (la BD no guarda un campo `rank`). */
function priorityRank(priority: Catalog): number {
  const name = priority.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  return PRIORITY_RANK[name] ?? 99;
}

const dateTimeFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium", timeStyle: "short" });

function PriorityBadge({ name }: { name: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-center text-xs font-medium ${PRIORITY_STYLES[name] ?? "bg-muted text-muted-foreground"}`}>
      {name}
    </span>
  );
}

/** Formulario en linea para cambiar la prioridad de un proyecto. */
function ChangePriorityForm({ project, priorities, catalogsLoading, onDone, onCancel }: {
  project: Project;
  priorities: Catalog[];
  catalogsLoading: boolean;
  onDone: () => Promise<void>;
  onCancel: () => void;
}) {
  const [errors, setErrors] = useState<PriorityChangeErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const options = [...priorities].sort(
    (a, b) => priorityRank(a) - priorityRank(b) || a.id - b.id,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const parsed = priorityChangeSchema.safeParse({
      ...Object.fromEntries(new FormData(e.currentTarget)),
      id_project: project.id,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof PriorityChangeErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await changeProjectPriority(parsed.data);
      await onDone();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo cambiar la prioridad.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mt-3 flex flex-col gap-4 rounded-lg border bg-background p-4">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}
      {catalogsLoading ? (
        <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          Cargando prioridades…
        </p>
      ) : options.length === 0 ? (
        <p role="alert" className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          No se pudieron cargar las prioridades del servidor. Recarga la página antes de continuar.
        </p>
      ) : null}
      <SelectField id={`prio-${project.id}`} name="id_priority" label="Nueva prioridad" required
        defaultValue="" placeholder="Elige la prioridad"
        options={options.map((p) => ({
          value: p.id,
          label: p.id === project.priority.id ? `${p.name} (actual)` : p.name,
          disabled: p.id === project.priority.id,
        }))}
        error={errors.id_priority} className="sm:max-w-xs" />
      <TextareaField id={`just-${project.id}`} name="explaining" label="Justificación" required
        maxLength={2000} rows={3} error={errors.explaining}
        hint="Obligatoria. Quedará registrada en la bitácora y no se puede modificar." />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>Cancelar</Button>
        <Button type="submit" disabled={pending || options.length === 0}>{pending ? "Guardando…" : "Confirmar cambio"}</Button>
      </div>
    </form>
  );
}

export function PriorityBoard() {
  const { data: projects, error, isLoading, mutate } = useProjects();
  const { data: log, mutate: mutateLog } = usePriorityLog();
  const { data: catalogs, error: catalogsError, isLoading: catalogsLoading } = useProjectCatalogs();
  const [editing, setEditing] = useState<string | null>(null);
  const [lastChanged, setLastChanged] = useState<string | null>(null);

  if (isLoading && !projects) {
    return <LoadingState label="Cargando proyectos…" />;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudieron cargar los proyectos.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  // Ordenamiento dinamico: prioridad (Critica primero) y luego codigo.
  const sorted = [...(projects ?? [])].sort(
    (a, b) =>
      priorityRank(a.priority) - priorityRank(b.priority) ||
      a.priority.id - b.priority.id ||
      a.unique_code.localeCompare(b.unique_code),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <section aria-labelledby="ranking-title">
        <h2 id="ranking-title" className="sr-only">Proyectos por prioridad</h2>
        {catalogsError && (
          <p role="alert" className="mb-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            No se pudieron cargar los catálogos de prioridad. No se puede cambiar la prioridad hasta recargar.
          </p>
        )}
        {lastChanged && (
          <p role="status" className="mb-4 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
            Prioridad actualizada y registrada en la bitácora.
          </p>
        )}
        {sorted.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No hay proyectos registrados.
          </p>
        ) : (
        <ol className="flex flex-col gap-3">
          {sorted.map((p, i) => (
            <li key={p.id}
              className={`rounded-xl border bg-card p-4 text-card-foreground transition-colors ${lastChanged === p.id ? "border-green-500/50" : ""}`}>
              <div className="flex flex-wrap items-center gap-4">
                <span className="w-6 text-center text-sm font-semibold tabular-nums text-muted-foreground" aria-label={`Posición ${i + 1}`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge name={p.priority.name} />
                    <span className="font-mono text-xs text-muted-foreground">{p.unique_code}</span>
                    <span className="text-xs text-muted-foreground">· {p.status.name}</span>
                  </div>
                  <p className="mt-1 truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.user.full_name}</p>
                </div>
                {editing !== p.id && (
                  <Button variant="outline" size="sm"
                    onClick={() => { setEditing(p.id); setLastChanged(null); }}>
                    Cambiar prioridad
                  </Button>
                )}
              </div>
              {editing === p.id && (
                <ChangePriorityForm project={p}
                  priorities={catalogs?.priorities ?? []}
                  catalogsLoading={catalogsLoading}
                  onCancel={() => setEditing(null)}
                  onDone={async () => {
                    setEditing(null);
                    setLastChanged(p.id);
                    await Promise.all([mutate(), mutateLog()]);
                  }} />
              )}
            </li>
          ))}
        </ol>
        )}
      </section>

      <aside aria-labelledby="log-title">
        <h2 id="log-title" className="mb-3 flex items-center gap-2 font-heading text-base font-medium">
          <History className="size-4" aria-hidden="true" />
          Bitácora de cambios
        </h2>
        {!log ? (
          <LoadingState compact label="Cargando bitácora…" className="py-2" />
        ) : log.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Sin cambios registrados.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {log.map((c) => (
              <li key={c.id} className="rounded-xl border bg-card p-4 text-sm text-card-foreground">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-xs">{c.project.unique_code}</span>
                  <PriorityBadge name={c.from_priority} />
                  <span aria-label="cambió a" className="text-muted-foreground">→</span>
                  <PriorityBadge name={c.to_priority} />
                </div>
                <p className="mt-2 whitespace-pre-line">{c.explaining}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {c.user.full_name} · {dateTimeFmt.format(new Date(c.created_at))}
                </p>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
