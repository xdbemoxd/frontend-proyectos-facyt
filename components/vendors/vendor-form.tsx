"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { vendorSchema, type VendorFormErrors } from "@/lib/vendors/schema";
import { createVendor } from "@/lib/vendors/api";
import type { VendorInput } from "@/lib/vendors/types";
import { Button } from "@/components/ui/button";

type FieldProps = {
  label: string;
  name: keyof VendorFormErrors;
  error?: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string;
  type?: string;
  multiline?: boolean;
  maxLength?: number;
};

function Field({ label, name, error, hint, required, defaultValue, type = "text", multiline, maxLength }: FieldProps) {
  const id = `vendor-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const className =
    "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-destructive" aria-hidden="true">*</span>}
      </label>
      {multiline ? (
        <textarea id={id} name={name} rows={3} defaultValue={defaultValue} maxLength={maxLength}
          aria-invalid={!!error} aria-describedby={describedBy} className={className} />
      ) : (
        <input id={id} name={name} type={type} defaultValue={defaultValue} maxLength={maxLength}
          required={required} aria-invalid={!!error} aria-describedby={describedBy} className={className} />
      )}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

type VendorFormProps = {
  /** Para edicion; vacio = crear. */
  initial?: Partial<VendorInput>;
};

export function VendorForm({ initial }: VendorFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<VendorFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = vendorSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: VendorFormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof VendorFormErrors;
        fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await createVendor(parsed.data);
      router.push("/dashboard/vendors");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar el proveedor.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <Field label="Nombre" name="name" required maxLength={150} defaultValue={initial?.name} error={errors.name} />
      <Field label="Descripción" name="description" multiline maxLength={255}
        defaultValue={initial?.description ?? ""} error={errors.description}
        hint="Qué suministra: reactivos, consumibles, equipos…" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Correo de contacto" name="contact_email" type="email" maxLength={255}
          defaultValue={initial?.contact_email ?? ""} error={errors.contact_email} />
        <Field label="Teléfono de contacto" name="contact_phone" type="tel" maxLength={20}
          defaultValue={initial?.contact_phone ?? ""} error={errors.contact_phone} hint="Ej: +58 414-1234567" />
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/vendors"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar proveedor"}
        </Button>
      </div>
    </form>
  );
}
