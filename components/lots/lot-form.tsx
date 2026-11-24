"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { lotSchema, type LotFormErrors } from "@/lib/lots/schema";
import { createLot } from "@/lib/lots/api";
import { useStock } from "@/lib/inventory/use-stock";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, zodFieldErrors } from "@/components/forms/form-field";

const money = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" });

/** "2026-11-18" de hoy en hora local (para el valor por defecto y el max). */
function todayLocal() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function LotForm() {
  const router = useRouter();
  const { data: stock, isLoading } = useStock();
  const [errors, setErrors] = useState<LotFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");

  const selected = stock?.find((s) => s.supplier_item_id === itemId);
  const total = (Number(qty) || 0) * (Number(cost) || 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const raw = Object.fromEntries(new FormData(e.currentTarget));
    // La fecha viene como "YYYY-MM-DD". Para fechas pasadas se toma a mediodía
    // local (no cambia de día por la zona horaria). Si es hoy, se usa la hora
    // actual: mediodía sería una fecha futura por la mañana y la API la rechaza.
    if (typeof raw.in_date === "string" && raw.in_date) {
      raw.in_date =
        raw.in_date === todayLocal()
          ? new Date().toISOString()
          : `${raw.in_date}T12:00`;
    }

    const parsed = lotSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof LotFormErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await createLot(parsed.data);
      router.push("/dashboard/inventory/lots");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo registrar el lote.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <SelectField id="lot-item" name="id_raw_materials_supplier" label="Material y proveedor" required
        value={itemId} onChange={(e) => setItemId(e.target.value)}
        placeholder={isLoading ? "Cargando…" : "Elige el material"}
        options={(stock ?? []).map((s) => ({
          value: s.supplier_item_id,
          label: `${s.resource_name} · ${s.vendor_name}`,
        }))}
        error={errors.id_raw_materials_supplier}
        hint={selected ? `Stock actual: ${selected.current_stock} ${selected.unit}` : "Si no aparece, regístralo primero en Materias primas."} />

      <div className="grid gap-5 sm:grid-cols-2">
        <InputField id="lot-qty" name="count_raw_materials_in" type="number" min={0} step="0.01" inputMode="decimal"
          label={`Cantidad${selected ? ` (${selected.unit})` : ""}`} required
          value={qty} onChange={(e) => setQty(e.target.value)} error={errors.count_raw_materials_in} />
        <InputField id="lot-cost" name="unit_cost" type="number" min={0} step="0.01" inputMode="decimal"
          label="Costo unitario (USD)" required
          value={cost} onChange={(e) => setCost(e.target.value)} error={errors.unit_cost} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <InputField id="lot-date" name="in_date" type="date" label="Fecha de ingreso" required
          defaultValue={todayLocal()} max={todayLocal()} error={errors.in_date} />
        <InputField id="lot-invoice" name="invoice_reference" label="N.º de factura" maxLength={100}
          error={errors.invoice_reference} />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm">
        <span className="text-muted-foreground">Total del lote</span>
        <span className="font-semibold tabular-nums">{money.format(total)}</span>
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/inventory/lots"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>{pending ? "Registrando…" : "Registrar lote"}</Button>
      </div>
    </form>
  );
}
