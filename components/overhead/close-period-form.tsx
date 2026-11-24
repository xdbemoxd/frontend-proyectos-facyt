"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { closePeriodSchema, type ClosePeriodErrors } from "@/lib/overhead/schema";
import { closePeriod, getOverheadPreview } from "@/lib/overhead/api";
import type { Criterion, OverheadPreview } from "@/lib/overhead/types";
import { Button } from "@/components/ui/button";
import { InputField, zodFieldErrors } from "@/components/forms/form-field";

const money = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" });
const pct = new Intl.NumberFormat("es-VE", { style: "percent", maximumFractionDigits: 1 });
const numFmt = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });
const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

/** Primer y ultimo dia del mes anterior (valor por defecto). */
function lastMonth() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last = new Date(now.getFullYear(), now.getMonth(), 0);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: fmt(first), end: fmt(last) };
}

export function ClosePeriodForm() {
  const router = useRouter();
  const def = lastMonth();
  const [start, setStart] = useState(def.start);
  const [end, setEnd] = useState(def.end);
  const [criterion, setCriterion] = useState<Criterion>("proporcional");
  const [total, setTotal] = useState("");
  const [preview, setPreview] = useState<OverheadPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ClosePeriodErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Vista previa calculada por el backend (proyectos activos + dispatch_log).
  useEffect(() => {
    const amount = total.trim();
    if (!start || !end || end < start || !AMOUNT_RE.test(amount) || !(Number(amount) > 0)) {
      setPreview(null);
      setPreviewError(null);
      return;
    }
    let cancelled = false;
    getOverheadPreview({ start_date: start, end_date: end, total_cost: amount, criterion })
      .then((result) => {
        if (cancelled) return;
        setPreview(result);
        setPreviewError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPreview(null);
        setPreviewError(err instanceof Error ? err.message : "No se pudo calcular el reparto.");
      });
    return () => { cancelled = true; };
  }, [start, end, criterion, total]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const parsed = closePeriodSchema.safeParse({ start_date: start, end_date: end, criterion, total_cost: total });
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof ClosePeriodErrors>(parsed.error.issues));
      return;
    }
    if (!preview) {
      setFormError("Espera la vista previa del reparto antes de cerrar el período.");
      return;
    }
    if (!window.confirm("Al cerrar el período el reparto queda registrado y no se puede modificar. ¿Continuar?")) return;

    setErrors({});
    setPending(true);
    try {
      await closePeriod(parsed.data);
      router.push("/dashboard/overhead");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo cerrar el período.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <InputField id="ovh-start" name="start_date" type="date" label="Inicio del período" required
          value={start} onChange={(e) => setStart(e.target.value)} error={errors.start_date} />
        <InputField id="ovh-end" name="end_date" type="date" label="Fin del período" required
          value={end} onChange={(e) => setEnd(e.target.value)} min={start} error={errors.end_date} />
      </div>

      <InputField id="ovh-total" name="total_cost" type="number" min={0} step="0.01" inputMode="decimal"
        label="Costo total de consumibles compartidos (USD)" required
        value={total} onChange={(e) => setTotal(e.target.value)} error={errors.total_cost}
        hint="Suma de los lotes institucionales comprados en el período." />

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Criterio de reparto <span className="text-destructive" aria-hidden="true">*</span></legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ["proporcional", "Proporcional", "Según el consumo registrado de cada proyecto."],
            ["equitativo", "Equitativo", "Partes iguales entre los proyectos activos."],
          ] as const).map(([value, label, desc]) => (
            <label key={value}
              className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${criterion === value ? "border-primary bg-accent" : "hover:bg-accent/50"}`}>
              <input type="radio" name="criterion" value={value} checked={criterion === value}
                onChange={() => setCriterion(value)} className="mt-0.5 accent-primary" />
              <span>
                <span className="font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <section aria-labelledby="preview-title" aria-live="polite" className="rounded-lg border">
        <h2 id="preview-title" className="border-b px-4 py-2 text-sm font-medium">Vista previa del reparto</h2>
        {previewError ? (
          <p className="px-4 py-4 text-sm text-destructive">{previewError}</p>
        ) : !preview ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">Completa las fechas y el costo total para ver el reparto.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2">Proyecto</th>
                  <th scope="col" className="px-4 py-2 text-right">Consumo</th>
                  <th scope="col" className="px-4 py-2 text-right">Porcentaje</th>
                  <th scope="col" className="px-4 py-2 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {preview.allocations.map((p) => (
                  <tr key={p.project.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-xs">{p.project.unique_code}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{numFmt.format(p.consumption)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{pct.format(p.share)}</td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums">{money.format(p.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t bg-muted font-medium">
                  <td className="px-4 py-2" colSpan={3}>Total</td>
                  <td className="px-4 py-2 text-right tabular-nums">{money.format(preview.total_cost)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/overhead"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending || !preview}>{pending ? "Cerrando…" : "Cerrar período"}</Button>
      </div>
    </form>
  );
}
