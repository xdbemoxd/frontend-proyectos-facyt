"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { projectCreateSchema, type ProjectCreateErrors } from "@/lib/projects/schema";
import { createProject } from "@/lib/projects/api";
import { useCoordinators } from "@/lib/projects/use-projects";
import type { Project } from "@/lib/projects/types";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField, zodFieldErrors } from "@/components/forms/form-field";

type Props = {
  /** El administrador elige el coordinador; el coordinador queda como responsable. */
  isAdmin: boolean;
};

export function ProjectCreateForm({ isAdmin }: Props) {
  const router = useRouter();
  const { data: coordinators, error: coordinatorsError, isLoading: loadingCoordinators } =
    useCoordinators(isAdmin);
  const [errors, setErrors] = useState<ProjectCreateErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState<Project | null>(null);

  const year = new Date().getFullYear();
  const noCoordinators = isAdmin && !loadingCoordinators && (coordinators?.length ?? 0) === 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const parsed = projectCreateSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof ProjectCreateErrors>(parsed.error.issues));
      return;
    }
    if (isAdmin && !parsed.data.id_user) {
      setErrors({ id_user: "Elige el coordinador responsable." });
      return;
    }

    setErrors({});
    setPending(true);
    try {
      const project = await createProject({
        area_code: parsed.data.area_code,
        name: parsed.data.name,
        description: parsed.data.description,
        ...(isAdmin ? { id_user: parsed.data.id_user } : {}),
      });
      setCreated(project);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo registrar el proyecto.");
    } finally {
      setPending(false);
    }
  }

  if (created) {
    return (
      <div role="status"
        className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
          <div>
            <p className="font-medium">Proyecto registrado: {created.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Código <span className="font-mono text-foreground">{created.unique_code}</span> · estatus{" "}
              {created.status.name} · prioridad {created.priority.name}.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={() => setCreated(null)}>Registrar otro</Button>
          <Link href="/dashboard"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Ver proyectos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}
      {coordinatorsError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {coordinatorsError.message}
        </p>
      )}
      {noCoordinators && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          No hay coordinadores activos. Registra uno en{" "}
          <Link href="/dashboard/users/new" className="underline underline-offset-4">Usuarios</Link> antes de crear el proyecto.
        </p>
      )}

      <InputField id="pr-new-area" name="area_code" label="Siglas del área" required maxLength={6}
        autoComplete="off" className="sm:max-w-48" error={errors.area_code}
        hint={`El código se genera solo: QUI-${year}-001, QUI-${year}-002…`} />
      <InputField id="pr-new-name" name="name" label="Nombre" required maxLength={150} error={errors.name} />
      <TextareaField id="pr-new-description" name="description" label="Descripción" maxLength={255}
        error={errors.description} />

      {isAdmin && (
        <SelectField id="pr-new-user" name="id_user" label="Coordinador responsable" required defaultValue=""
          disabled={loadingCoordinators || noCoordinators}
          placeholder={loadingCoordinators ? "Cargando coordinadores…" : "Elige un coordinador"}
          options={(coordinators ?? []).map((c) => ({ value: c.id, label: `${c.full_name} · ${c.email}` }))}
          error={errors.id_user} />
      )}

      <p className="rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
        El proyecto se registra en <strong>Propuesta</strong> con prioridad <strong>Media</strong>, avance y
        ejecución presupuestaria en 0 %.{" "}
        {isAdmin ? "La prioridad se ajusta luego en Priorización." : "Quedarás como responsable."}
      </p>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending || noCoordinators}>
          {pending ? "Registrando…" : "Registrar proyecto"}
        </Button>
      </div>
    </form>
  );
}
