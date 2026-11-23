"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { userCreateSchema, type UserCreateErrors } from "@/lib/users/schema";
import { createUser } from "@/lib/users/api";
import { useRoles } from "@/lib/users/use-roles";
import { roleLabel } from "@/lib/users/labels";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, zodFieldErrors } from "@/components/forms/form-field";

export function UserCreateForm() {
  const router = useRouter();
  const { roles } = useRoles();
  const [errors, setErrors] = useState<UserCreateErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const parsed = userCreateSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof UserCreateErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await createUser(parsed.data);
      router.push("/dashboard/users");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo registrar el usuario.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <InputField id="usr-email" name="email" type="email" label="Correo de Google" required maxLength={255}
        autoComplete="off" error={errors.email}
        hint="El correo con el que la persona iniciará sesión." />
      <SelectField id="usr-rol" name="id_rol" label="Rol" required defaultValue=""
        placeholder="Elige un rol"
        options={roles.map((r) => ({ value: r.id, label: `${roleLabel(r.name)} — ${r.description ?? ""}` }))}
        error={errors.id_rol} />

      <p className="rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
        El nombre y el apellido se toman de Google en el primer ingreso. Hasta entonces, la cuenta
        aparece como &quot;Pendiente de primer ingreso&quot;.
      </p>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/users"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Registrar usuario"}</Button>
      </div>
    </form>
  );
}
