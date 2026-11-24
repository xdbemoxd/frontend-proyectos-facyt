"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { equipmentUpdateSchema, type EquipmentUpdateErrors } from "@/lib/equipment/schema";
import { getEquipment, updateEquipment } from "@/lib/equipment/api";
import { useEquipmentCatalogs } from "@/lib/equipment/use-equipment";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField, zodFieldErrors } from "@/components/forms/form-field";
import { ReadOnlyField, RecordStatus, useRecord } from "@/components/forms/record-loader";

export function EquipmentEditForm({ id }: { id: string }) {
  const router = useRouter();
  const unit = useRecord(getEquipment, id);
  const { data: catalogs, isLoading: loadingCatalogs } = useEquipmentCatalogs();
  const [errors, setErrors] = useState<EquipmentUpdateErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!unit) return <RecordStatus loading={unit === undefined} notFound="Equipo no encontrado." />;

  const pendingReservations = unit.pending_reservations ?? 0;
  const statuses = catalogs?.statuses ?? [unit.status];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || !unit) return;
    setFormError(null);

    const parsed = equipmentUpdateSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof EquipmentUpdateErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await updateEquipment(unit.id, parsed.data, unit.updated_at);
      router.push("/dashboard/equipment");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar el equipo.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <InputField id="eq-edit-name" name="name" label="Nombre del equipo" required maxLength={150}
        defaultValue={unit.equipment.name} error={errors.name}
        hint="El nombre y la descripción se aplican a todas las unidades de este equipo." />
      <TextareaField id="eq-edit-description" name="description" label="Descripción" maxLength={1000}
        defaultValue={unit.equipment.description ?? ""} error={errors.description} />

      <div className="grid gap-5 sm:grid-cols-2">
        <InputField id="eq-edit-model" name="model" label="Modelo" maxLength={100}
          defaultValue={unit.model ?? ""} error={errors.model} />
        <InputField id="eq-edit-serial" name="serial_number" label="Número de serie" maxLength={100}
          defaultValue={unit.serial_number ?? ""} error={errors.serial_number}
          hint="Debe ser único entre las unidades." />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ReadOnlyField label="Proveedor" value={unit.vendor.name} />
        <SelectField key={statuses.map((s) => s.id).join("-")}
          id="eq-edit-status" name="id_status" label="Estado" required
          defaultValue={unit.status.id} disabled={loadingCatalogs}
          options={statuses.map((s) => ({ value: s.id, label: s.name }))}
          error={errors.id_status}
          hint={pendingReservations > 0
            ? `Tiene ${pendingReservations} reserva(s) pendiente(s): no se puede pasar a mantenimiento.`
            : undefined} />
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/equipment"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar cambios"}</Button>
      </div>
    </form>
  );
}
