"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projectUpdateSchema, type ProjectUpdateErrors } from "@/lib/projects/schema";
import { getProject, isProjectLocked, updateProject } from "@/lib/projects/api";
import { useProjectCatalogs } from "@/lib/projects/use-projects";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField, zodFieldErrors } from "@/components/forms/form-field";
import { ReadOnlyField, RecordStatus, useRecord } from "@/components/forms/record-loader";

export function ProjectEditForm({
  id,
  canPrioritize = false,
  canEditStatus = false,
}: {
  id: string;
  canPrioritize?: boolean;
  /** Solo el administrador cambia estatus (y avance/ejecución) del proyecto. */
  canEditStatus?: boolean;
}) {
  const router = useRouter();
  const project = useRecord(getProject, id);
  const { data: catalogs, error: catalogsError } = useProjectCatalogs();
  const [errors, setErrors] = useState<ProjectUpdateErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!project) return <RecordStatus loading={project === undefined} notFound="Proyecto no encontrado." />;

  const locked = isProjectLocked(project);
  const statuses = catalogs?.statuses ?? [project.status];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || !project || locked) return;
    setFormError(null);

    const parsed = projectUpdateSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof ProjectUpdateErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await updateProject(project.id, parsed.data, project.updated_at);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar el proyecto.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}
      {catalogsError && (
        <p role="alert" className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          No se pudieron cargar los estatus del servidor; solo se muestra el actual.
        </p>
      )}
      {locked && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Este proyecto está finalizado: sus datos quedan cerrados y no se pueden editar.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <ReadOnlyField label="Código" value={<span className="font-mono">{project.unique_code}</span>}
          hint="El código no cambia nunca." />
        <ReadOnlyField label="Prioridad" value={project.priority.name}
          hint="Se cambia en Priorización, con justificación." />
      </div>

      <fieldset disabled={locked} className="flex flex-col gap-5">
        <InputField id="pr-edit-name" name="name" label="Nombre" required maxLength={150}
          defaultValue={project.name} error={errors.name} />
        <TextareaField id="pr-edit-description" name="description" label="Descripción" maxLength={255}
          defaultValue={project.description ?? ""} error={errors.description} />
        {canEditStatus ? (
          <SelectField id="pr-edit-status" name="id_status" label="Estatus" required defaultValue={project.status.id}
            options={statuses.map((s) => ({ value: s.id, label: s.name }))}
            error={errors.id_status}
            hint={'Si lo marcas como "Finalizado", ya no se podrá editar.'} />
        ) : (
          <ReadOnlyField label="Estatus" value={project.status.name}
            hint="El estatus, el avance y la ejecución presupuestaria los actualiza el administrador." />
        )}
      </fieldset>

      <ReadOnlyField label="Responsable" value={`${project.user.full_name} · ${project.user.email}`} />

      <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
        {canPrioritize && (
          <Link href="/dashboard/priority"
            className="mr-auto rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            Cambiar prioridad
          </Link>
        )}
        <Link href="/dashboard"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending || locked}>{pending ? "Guardando…" : "Guardar cambios"}</Button>
      </div>
    </form>
  );
}
