"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { userUpdateSchema, type UserUpdateErrors } from "@/lib/users/schema";
import { userState } from "@/lib/users/types";
import { revalidateUsers, useUser } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";
import { updateUserAction } from "@/actions/users.action";
import { Button } from "@/components/ui/button";
import { SelectField, zodFieldErrors } from "@/components/forms/form-field";
import { UserStateBadge } from "./user-state-badge";
import { LoadingState } from "@/components/ui/loading-state";

type Props = { id: string; currentUserEmail: string | null };

export function UserEditForm({ id, currentUserEmail }: Props) {
  const router = useRouter();
  const { data: user, error, isLoading, mutate: reload } = useUser(id);
  const { options, isLoading: loadingRoles, error: rolesError } = useRoles();
  const [errors, setErrors] = useState<UserUpdateErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (isLoading) {
    return <LoadingState compact label="Cargando usuario…" className="mx-auto max-w-xl" />;
  }
  if (error) {
    return (
      <div role="alert" className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-xl border p-6 text-sm text-destructive">
        <span>{error.message}</span>
        <Button variant="outline" size="sm" onClick={() => reload()}>Reintentar</Button>
      </div>
    );
  }
  if (!user) {
    return (
      <p className="mx-auto max-w-xl rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Usuario no encontrado.
      </p>
    );
  }

  const isSelf = !!currentUserEmail && user.email.toLowerCase() === currentUserEmail.toLowerCase();
  const pendingFirstLogin = userState(user) === "pending";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || !user) return;
    setFormError(null);

    const parsed = userUpdateSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof UserUpdateErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    let result: Awaited<ReturnType<typeof updateUserAction>>;
    try {
      result = await updateUserAction(user.id, parsed.data);
    } catch {
      setFormError("No se pudo guardar. Recarga la página e inténtalo de nuevo.");
      setPending(false);
      return;
    }
    if (!result.ok) {
      setFormError(result.error);
      setPending(false);
      return;
    }
    await Promise.all([revalidateUsers(), reload()]);
    router.push("/dashboard/users");
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {(formError || rolesError) && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError ?? rolesError?.message}
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{user.name ? `${user.name} ${user.lastname ?? ""}` : "Sin nombre aún"}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <UserStateBadge state={userState(user)} />
      </div>

      {isSelf && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Esta es tu cuenta: no puedes cambiar tu rol ni desactivarte.
        </p>
      )}

      {/* key: se vuelve a montar cuando llegan los roles para aplicar el valor actual */}
      <SelectField key={`rol-${options.length}`} id="usr-edit-rol" name="id_rol" label="Rol" required
        defaultValue={user.rol.id} disabled={isSelf || loadingRoles}
        placeholder={loadingRoles ? "Cargando roles…" : undefined}
        options={options}
        error={errors.id_rol} />
      {isSelf && <input type="hidden" name="id_rol" value={user.rol.id} />}

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={user.is_active}
          disabled={isSelf} className="mt-0.5 size-4 accent-primary" />
        <span>
          <span className="font-medium">Cuenta activa</span>
          <span className="block text-xs text-muted-foreground">
            {pendingFirstLogin
              ? "Aún no ha entrado. Si la desactivas, no podrá hacer su primer ingreso."
              : "Si la desactivas, no podrá iniciar sesión. Su historial se conserva."}
          </span>
        </span>
      </label>
      {isSelf && <input type="hidden" name="is_active" value="true" />}

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/users"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending || isSelf || loadingRoles}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
