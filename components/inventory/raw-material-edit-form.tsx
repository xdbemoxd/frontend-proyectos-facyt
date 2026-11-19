"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rawMaterialUpdateSchema, type RawMaterialUpdateErrors } from "@/lib/inventory/schema";
import { getStockItem, hasStockMovements, updateRawMaterial } from "@/lib/inventory/api";
import { RESOURCE_TYPES, UNITS } from "@/lib/inventory/mock";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, zodFieldErrors } from "@/components/forms/form-field";
import { ReadOnlyField, RecordStatus, useRecord } from "@/components/forms/record-loader";

const numFmt = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });

export function RawMaterialEditForm({ id }: { id: string }) {
  const router = useRouter();
  const item = useRecord(getStockItem, id);
  const [errors, setErrors] = useState<RawMaterialUpdateErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!item) return <RecordStatus loading={item === undefined} notFound="Materia prima no encontrada." />;

  const unitLocked = hasStockMovements(item.resource_id);
  const typeId = RESOURCE_TYPES.find((t) => t.name === item.resource_type)?.id ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const parsed = rawMaterialUpdateSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof RawMaterialUpdateErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await updateRawMaterial(id, parsed.data);
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
        <InputField id="rm-edit-name" name="name" label="Nombre" required maxLength={255}
          defaultValue={item.resource_name} error={errors.name}
          hint="El cambio se aplica al material con todos sus proveedores." />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField id="rm-edit-type" name="resource_type_id" label="Tipo" required defaultValue={typeId}
            options={RESOURCE_TYPES.map((t) => ({ value: t.id, label: t.name }))}
            error={errors.resource_type_id} />
          <SelectField id="rm-edit-unit" name="unit" label="Unidad" required defaultValue={item.unit}
            disabled={unitLocked}
            options={UNITS.map((u) => ({ value: u, label: u }))}
            error={errors.unit}
            hint={unitLocked ? "Ya tiene movimientos de stock: la unidad no se puede cambiar." : undefined} />
          {unitLocked && <input type="hidden" name="unit" value={item.unit} />}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5 border-t pt-5">
        <legend className="mb-1 text-sm font-semibold">Proveedor y alerta</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <ReadOnlyField label="Proveedor" value={item.vendor_name} />
          <ReadOnlyField label="Stock actual" value={`${numFmt.format(item.current_stock)} ${item.unit}`}
            hint="Cambia solo con lotes y despachos." />
        </div>
        <InputField id="rm-edit-min" name="minimun_stock" label="Stock mínimo" required type="number"
          min={0} step="0.01" defaultValue={item.minimun_stock} inputMode="decimal"
          error={errors.minimun_stock} hint="Avisa cuando el stock llegue a este valor." />
      </fieldset>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/inventory"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar cambios"}</Button>
      </div>
    </form>
  );
}
