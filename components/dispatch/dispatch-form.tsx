"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dispatchSchema, type DispatchFormErrors } from "@/lib/dispatch/schema";
import { createDispatch } from "@/lib/dispatch/api";
import { useStock } from "@/lib/inventory/use-stock";
import { MOCK_PROJECTS } from "@/lib/projects/mock";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField, zodFieldErrors } from "@/components/forms/form-field";

export function DispatchForm() {
  const router = useRouter();
  const { data: stock, isLoading: loadingStock } = useStock();
  const [errors, setErrors] = useState<DispatchFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("");

  const selected = stock?.find((s) => s.supplier_item_id === itemId);
  const remaining = selected ? selected.current_stock - (Number(qty) || 0) : null;
  const exceeds = remaining !== null && remaining < 0;
  // Despachos y gastos siguen siendo mock: usan el catalogo mock hasta que
  // esos modulos se conecten al backend (el backend de proyectos ya es real).
  const activeProjects = MOCK_PROJECTS.filter((p) => p.status.name === "En ejecución");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const parsed = dispatchSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof DispatchFormErrors>(parsed.error.issues));
      return;
    }
    if (exceeds) {
      setErrors({ use_raw_materials: `Solo hay ${selected!.current_stock} ${selected!.unit} disponibles.` });
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await createDispatch(parsed.data);
      router.push("/dashboard/inventory/dispatch");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo registrar el despacho.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <SelectField id="dsp-project" name="id_project" label="Proyecto destino" required defaultValue=""
        placeholder="Elige un proyecto"
        options={activeProjects.map((p) => ({ value: p.id, label: `${p.unique_code} · ${p.name}` }))}
        error={errors.id_project} hint="Solo proyectos en ejecución." />

      <SelectField id="dsp-item" name="id_raw_materials_suppliers" label="Insumo" required
        value={itemId} onChange={(e) => setItemId(e.target.value)}
        placeholder={loadingStock ? "Cargando…" : "Elige el insumo"}
        options={(stock ?? []).map((s) => ({
          value: s.supplier_item_id,
          label: `${s.resource_name} · ${s.vendor_name} (${s.current_stock} ${s.unit})`,
          disabled: s.current_stock <= 0,
        }))}
        error={errors.id_raw_materials_suppliers}
        hint="Los insumos agotados no se pueden despachar." />

      <InputField id="dsp-qty" name="use_raw_materials" type="number" min={0} step="0.01" inputMode="decimal"
        label={`Cantidad${selected ? ` (${selected.unit})` : ""}`} required
        value={qty} onChange={(e) => setQty(e.target.value)} error={errors.use_raw_materials} />

      {selected && (
        <div className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${exceeds ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>
          <span className={exceeds ? "" : "text-muted-foreground"}>
            {exceeds ? "No alcanza el stock" : "Quedará en stock"}
          </span>
          <span className="font-semibold tabular-nums">
            {exceeds ? `faltan ${Math.abs(remaining!)}` : remaining} {selected.unit}
          </span>
        </div>
      )}

      <TextareaField id="dsp-notes" name="notes" label="Notas" maxLength={1000} error={errors.notes} />

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/inventory/dispatch"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending || exceeds}>{pending ? "Registrando…" : "Registrar despacho"}</Button>
      </div>
    </form>
  );
}
