"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { equipmentSchema, type EquipmentFormErrors } from "@/lib/equipment/schema";
import { createEquipment } from "@/lib/equipment/api";
import { useEquipmentCatalogs } from "@/lib/equipment/use-equipment";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField, zodFieldErrors } from "@/components/forms/form-field";

export function EquipmentForm() {
  const router = useRouter();
  const { data: catalogs, isLoading: loadingCatalogs, error: catalogsError } = useEquipmentCatalogs();
  const [errors, setErrors] = useState<EquipmentFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const statuses = catalogs?.statuses ?? [];
  const vendors = catalogs?.vendors ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const parsed = equipmentSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof EquipmentFormErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await createEquipment(parsed.data);
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
      {catalogsError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          No se pudieron cargar los catálogos. Recarga la página.
        </p>
      )}

      <InputField id="eq-name" name="name" label="Nombre del equipo" required maxLength={150}
        error={errors.name} hint="Si ya existe un equipo con ese nombre, se registra como otra unidad." />
      <TextareaField id="eq-description" name="description" label="Descripción" maxLength={1000}
        error={errors.description} />

      <div className="grid gap-5 sm:grid-cols-2">
        <InputField id="eq-model" name="model" label="Modelo" maxLength={100} error={errors.model} />
        <InputField id="eq-serial" name="serial_number" label="Número de serie" maxLength={100}
          error={errors.serial_number} hint="Debe ser único entre las unidades." />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField id="eq-vendor" name="id_vendors" label="Proveedor" required defaultValue=""
          placeholder={loadingCatalogs ? "Cargando…" : "Elige un proveedor"}
          options={vendors.map((v) => ({ value: v.id, label: v.name }))}
          error={errors.id_vendors} />
        <SelectField key={statuses[0]?.id ?? "status-loading"}
          id="eq-status" name="id_status" label="Estado" required
          defaultValue={statuses[0]?.id ?? ""}
          placeholder={loadingCatalogs ? "Cargando…" : "Elige un estado"}
          options={statuses.map((s) => ({ value: s.id, label: s.name }))}
          error={errors.id_status} />
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/equipment"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending || loadingCatalogs}>{pending ? "Guardando…" : "Guardar equipo"}</Button>
      </div>
    </form>
  );
}
