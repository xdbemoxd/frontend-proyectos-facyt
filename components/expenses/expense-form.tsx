"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { expenseSchema, type ExpenseFormErrors } from "@/lib/expenses/schema";
import { changeExpenseStatus, createExpense } from "@/lib/expenses/api";
import { useStock } from "@/lib/inventory/use-stock";
import { MOCK_PROJECTS } from "@/lib/projects/mock";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField, zodFieldErrors } from "@/components/forms/form-field";

export function ExpenseForm() {
  const router = useRouter();
  const { data: stock, isLoading: ls } = useStock();
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [itemId, setItemId] = useState("");

  const selected = stock?.find((s) => s.supplier_item_id === itemId);
  // Solicitudes de gasto siguen siendo mock: usan el catalogo mock.
  const usable = MOCK_PROJECTS.filter((p) => p.status.name === "En ejecución" || p.status.name === "Propuesta");

  async function submit(form: HTMLFormElement, sendNow: boolean) {
    if (pending) return;
    setFormError(null);
    const parsed = expenseSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof ExpenseFormErrors>(parsed.error.issues));
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const created = await createExpense(parsed.data);
      if (sendNow) await changeExpenseStatus(created.id, "pending");
      router.push("/dashboard/expenses");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar la solicitud.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void submit(e.currentTarget, false); }} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <SelectField id="exp-project" name="id_project" label="Proyecto" required defaultValue=""
        placeholder="Elige el proyecto"
        options={usable.map((p) => ({ value: p.id, label: `${p.unique_code} · ${p.name}` }))}
        error={errors.id_project} />

      <SelectField id="exp-item" name="id_raw_materials_suppliers" label="Material (opcional)"
        value={itemId} onChange={(e) => setItemId(e.target.value)}
        placeholder={ls ? "Cargando…" : "Ninguno / no está en el catálogo"}
        options={(stock ?? []).map((s) => ({ value: s.supplier_item_id, label: `${s.resource_name} · ${s.vendor_name}` }))}
        error={errors.id_raw_materials_suppliers}
        hint={selected ? `Stock actual: ${selected.current_stock} ${selected.unit}` : undefined} />

      <InputField id="exp-qty" name="count_raw_materials" type="number" min={0} step="0.01" inputMode="decimal"
        label={`Cantidad${selected ? ` (${selected.unit})` : ""}`} required error={errors.count_raw_materials} />

      <TextareaField id="exp-desc" name="description" label="Descripción" required maxLength={255}
        error={errors.description} hint="Qué se necesita y para qué." />

      <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/expenses"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" variant="outline" disabled={pending}>Guardar borrador</Button>
        <Button type="button" disabled={pending}
          onClick={(e) => { const f = e.currentTarget.form; if (f) void submit(f, true); }}>
          {pending ? "Guardando…" : "Enviar a aprobación"}
        </Button>
      </div>
    </form>
  );
}
