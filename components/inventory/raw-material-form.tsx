"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rawMaterialSchema, type RawMaterialFormErrors } from "@/lib/inventory/schema";
import { createRawMaterial } from "@/lib/inventory/api";
import { useInventoryCatalogs } from "@/lib/inventory/use-stock";
import { unitOptions } from "@/lib/inventory/constants";
import { useVendors } from "@/lib/vendors/use-vendors";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField, zodFieldErrors } from "@/components/forms/form-field";

export function RawMaterialForm() {
  const router = useRouter();
  const { data: vendors, isLoading: loadingVendors } = useVendors();
  const { data: catalogs, isLoading: loadingCatalogs } = useInventoryCatalogs();
  const [errors, setErrors] = useState<RawMaterialFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const parsed = rawMaterialSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof RawMaterialFormErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await createRawMaterial(parsed.data);
      router.push("/dashboard/inventory");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar la materia prima.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-1 text-sm font-semibold">Material</legend>
        <InputField id="rm-name" name="name" label="Nombre" required maxLength={255} error={errors.name}
          hint="Si ya existe, se le agrega el proveedor nuevo." />
        <TextareaField id="rm-description" name="description" label="Descripción" maxLength={1000}
          error={errors.description} />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField id="rm-type" name="resource_type_id" label="Tipo" required defaultValue=""
            placeholder={loadingCatalogs ? "Cargando…" : "Elige un tipo"}
            options={(catalogs?.resource_types ?? []).map((t) => ({ value: t.id, label: t.name }))}
            error={errors.resource_type_id} />
          <SelectField id="rm-unit" name="unit" label="Unidad" required defaultValue="unidad"
            options={unitOptions()}
            error={errors.unit} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5 border-t pt-5">
        <legend className="mb-1 text-sm font-semibold">Proveedor y alerta</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField id="rm-vendor" name="vendors_id" label="Proveedor" required defaultValue=""
            placeholder={loadingVendors ? "Cargando…" : "Elige un proveedor"}
            options={(vendors ?? []).map((v) => ({ value: v.id, label: v.name }))}
            error={errors.vendors_id} />
          <InputField id="rm-min" name="minimun_stock" label="Stock mínimo" required type="number"
            min={0} step="0.01" defaultValue={0} inputMode="decimal"
            error={errors.minimun_stock} hint="Avisa cuando el stock llegue a este valor." />
        </div>
        <p className="text-xs text-muted-foreground">
          El stock arranca en 0. Sube al registrar lotes de compra y baja con los despachos.
        </p>
      </fieldset>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/inventory"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar materia prima"}</Button>
      </div>
    </form>
  );
}
