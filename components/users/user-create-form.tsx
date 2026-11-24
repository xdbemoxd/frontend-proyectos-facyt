"use client";

import { useActionState, useEffect, useState } from "react";
import { revalidateUsers } from "@/hooks/use-users";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createUserAction, type CreateUserState } from "@/actions/users.action";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/forms/form-field";

const initialState: CreateUserState = { status: "idle" };

export function UserCreateForm() {
  // key cambia para reiniciar el formulario al pulsar "Registrar otro".
  const [formKey, setFormKey] = useState(0);
  return <CreateForm key={formKey} onReset={() => setFormKey((k) => k + 1)} />;
}

function CreateForm({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);
  useEffect(() => {
    if (state.status === "success") void revalidateUsers();
  }, [state.status]);
  const { options, error: rolesError, isLoading: loadingRoles, mutate: retryRoles } = useRoles();

  if (state.status === "success") {
    return (
      <div role="status"
        className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
          <div>
            <p className="font-medium">Usuario registrado: {state.email}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Recibirá un correo de invitación y podrá entrar con su cuenta de Google.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={onReset}>Registrar otro</Button>
          <Link href="/dashboard/users"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Ver usuarios
          </Link>
        </div>
      </div>
    );
  }

  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const message = state.status === "error" ? state.message : undefined;
  const values = state.status === "error" ? state.values : { email: "", id_rol: "" };
  const noRoles = options.length === 0;

  return (
    <form action={formAction} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {message && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>
      )}
      {rolesError && (
        <div role="alert"
          className="flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>{rolesError.message}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => retryRoles()}>Reintentar</Button>
        </div>
      )}

      {/* key: al volver con error, React reinicia el campo con el valor enviado */}
      <InputField key={`email-${values.email}`} id="usr-email" name="email" type="email" label="Correo de Google"
        required maxLength={255} autoComplete="off" defaultValue={values.email} error={errors.email}
        hint="A este correo le llegará la invitación para entrar." />
      <SelectField key={`rol-${values.id_rol}`} id="usr-rol" name="id_rol" label="Rol" required
        defaultValue={values.id_rol} disabled={noRoles}
        placeholder={loadingRoles ? "Cargando roles…" : noRoles ? "No disponible" : "Elige un rol"}
        options={options}
        error={errors.id_rol} />

      <p className="rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
        Solo se registran el correo y el rol. La persona no llena ningún formulario: recibe la invitación,
        entra con Google y su nombre se toma de su cuenta.
      </p>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/users"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending || noRoles}>
          {pending ? "Registrando…" : "Registrar y enviar invitación"}
        </Button>
      </div>
    </form>
  );
}
