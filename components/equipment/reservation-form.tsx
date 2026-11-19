"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { reservationSchema, type ReservationFormErrors } from "@/lib/equipment/schema";
import { createReservation } from "@/lib/equipment/api";
import { useEquipment } from "@/lib/equipment/use-equipment";
import { useProjects } from "@/lib/projects/use-projects";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField, zodFieldErrors } from "@/components/forms/form-field";

export function ReservationForm() {
  const router = useRouter();
  const { data: units, isLoading: loadingUnits } = useEquipment();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const [errors, setErrors] = useState<ReservationFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Solo proyectos que pueden usar equipos
  const activeProjects = (projects ?? []).filter((p) => p.status.name === "En ejecución" || p.status.name === "Propuesta");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const parsed = reservationSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof ReservationFormErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await createReservation(parsed.data);
      router.push("/dashboard/equipment/reservations");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar la reserva.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <SelectField id="res-unit" name="id_equipament_supplier" label="Equipo" required defaultValue=""
        placeholder={loadingUnits ? "Cargando…" : "Elige un equipo"}
        options={(units ?? []).map((u) => ({
          value: u.id,
          label: `${u.equipment.name}${u.serial_number ? ` · ${u.serial_number}` : ""}${u.status.name === "En mantenimiento" ? " (en mantenimiento)" : ""}`,
          disabled: u.status.name === "En mantenimiento",
        }))}
        error={errors.id_equipament_supplier} />

      <SelectField id="res-project" name="id_project" label="Proyecto" required defaultValue=""
        placeholder={loadingProjects ? "Cargando…" : "Elige un proyecto"}
        options={activeProjects.map((p) => ({ value: p.id, label: `${p.unique_code} · ${p.name}` }))}
        error={errors.id_project} />

      <div className="grid gap-5 sm:grid-cols-2">
        <InputField id="res-start" name="reservation_date" type="datetime-local" label="Inicio" required
          error={errors.reservation_date} />
        <InputField id="res-end" name="end_date" type="datetime-local" label="Fin" required
          error={errors.end_date} />
      </div>

      <TextareaField id="res-purpose" name="purpose" label="Propósito" maxLength={2000}
        error={errors.purpose} hint="Para qué se usará el equipo." />

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/equipment/reservations"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Reservar"}</Button>
      </div>
    </form>
  );
}
